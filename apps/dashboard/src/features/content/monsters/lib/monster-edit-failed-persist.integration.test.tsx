/**
 * @vitest-environment jsdom
 *
 * Production-entry: monster TabbedForm + useContentFormSubmit → persist + structured ApiError.
 */
import { useMemo, useState } from 'react'
import { ApiError } from '@rpg/contracts'
import { getMonsterBySlug } from '@rpg/catalog/monsters'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  TabbedForm,
  collectTabbedFormResolverItems,
  FormUiProvider,
  makeResolver,
} from '@rpg/ui/form'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import { ContentFormWriteGateProvider } from '../../lib/forms/shells/layout/content-form-write-gate'
import { loadContentEditFormState } from '../../lib/forms/shells/edit/content-edit-load'
import {
  ProducerApiIssueProbe,
  ProducerApiSlotIssueProbe,
} from '../../lib/forms/shells/edit/content-edit-stamp.probe'
import { persistContentEditUpdate } from '../../lib/forms/shells/edit/content-edit-persist.lib'
import { prepareSerializedContentFormWrite } from '../../lib/forms/submit/prepare-serialized-content-form-write.lib'
import { useContentFormSubmit } from '../../lib/forms/shells/submit/content-form-submit'
import { buildMonsterTabs } from './monster-form-fields'
import { monsterFormDef } from './monster-form-def'
import { MONSTER_FORM_TAB } from './monster-form-view'
import type { MonsterFormValues } from './monster-form-values'

const RULESET_ID = 'srd-cc-5.2.1'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
  if (!HTMLElement.prototype.scrollIntoView) {
    HTMLElement.prototype.scrollIntoView = () => {}
  }
})

function systemSwarmEntity() {
  const catalog = getMonsterBySlug(RULESET_ID, 'swarm-of-insects')
  expect(catalog).toBeDefined()
  return {
    ...catalog!,
    catalogLayer: 'system' as const,
    status: 'published' as const,
    overlayRevision: 0,
    seedRowIdsByPath: {
      traits: catalog!.traits?.map((trait) => trait.id) ?? [],
    },
  }
}

function loadSwarmEdit() {
  const entity = systemSwarmEntity()
  const optionsCtx = makeContentFormCtx({
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    skillCatalogStatus: 'ready',
    skillCatalogBySlug: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
    rulesetId: RULESET_ID,
  })
  return {
    entity,
    catalogSeed: getMonsterBySlug(RULESET_ID, 'swarm-of-insects') as Record<string, unknown>,
    ...loadContentEditFormState({
      def: monsterFormDef,
      entity,
      optionsCtx,
      campaignId: TEST_CAMPAIGN_ID,
      entityId: entity.id,
      armorClassRules: optionsCtx.armorClassRules,
    }),
  }
}

const mutateAsync = vi.hoisted(() => vi.fn())
const prepareWriteSpy = vi.hoisted(() => vi.fn())

function renderMonsterEditPersistHarness() {
  const loaded = loadSwarmEdit()
  const { entity, layoutCtx, schema, defaultValues, validationIntent, catalogSeed } = loaded
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const formKey = `monster-edit:${entity.id}`
  const allTabs = augmentTabsWithHoistedName(
    buildMonsterTabs(layoutCtx),
    monsterFormDef.nameField(layoutCtx),
  )
  const statisticsTab = allTabs.find((tab) => tab.id === MONSTER_FORM_TAB.statistics)!
  const tabs = [
    {
      ...statisticsTab,
      fields: [monsterFormDef.nameField(layoutCtx), ...statisticsTab.fields],
    },
    ...allTabs.filter((tab) => tab.id !== MONSTER_FORM_TAB.statistics),
  ]
  const resolverFields = collectTabbedFormResolverItems(allTabs)

  function Harness() {
    const [overlayBaseline, setOverlayBaseline] = useState<Record<string, unknown> | null>(() =>
      monsterFormDef.normalizeOverlayBody
        ? monsterFormDef.normalizeOverlayBody(
            defaultValues as MonsterFormValues,
            { entity, armorClassRules: layoutCtx.armorClassRules },
            validationIntent,
          )
        : null,
    )

    const serializeInputCtx = useMemo(
      () => ({
        entity,
        armorClassRules: layoutCtx.armorClassRules,
      }),
      [],
    )

    const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<MonsterFormValues>({
      def: monsterFormDef,
      ctx: layoutCtx,
      commitValidationIntent: validationIntent,
      fallbackMessage: 'Could not update monsters.',
      invalidPresentation: {
        resolverFields,
        formId: formKey,
      },
      prepareWrite: (values, form) => {
        const prepared = prepareSerializedContentFormWrite({
          def: monsterFormDef,
          values,
          form,
          inputCtx: serializeInputCtx,
          validationIntent,
          operation: 'update',
          rulesetId: RULESET_ID,
          serializeOptions: {
            overlayBaseline: overlayBaseline ?? undefined,
            catalogSeed,
            expectedOverlayRevision: entity.overlayRevision ?? 0,
            entityId: entity.id,
            seedRowIdsByPath: entity.seedRowIdsByPath,
          },
        })
        prepareWriteSpy(prepared)
        return prepared
      },
      persist: async (wireInput, form, meta) =>
        persistContentEditUpdate({
          def: monsterFormDef,
          entity,
          campaignId: TEST_CAMPAIGN_ID,
          layoutCtx,
          wireInput: wireInput as Record<string, unknown>,
          form,
          mutation: { mutateAsync },
          queryClient: client,
          setOverlayBaseline,
          validationIntent,
          isAttemptCurrent: meta?.isAttemptCurrent,
        }),
    })

    return (
      <ContentFormWriteGateProvider>
        <FormUiProvider fields={resolverFields} publishPresentationEnabled>
          <TabbedForm<MonsterFormValues>
            id={formKey}
            uiStateKey={formKey}
            schema={schema}
            tabs={tabs}
            defaultValues={defaultValues as MonsterFormValues}
            onSubmit={onSubmit}
            formError={formError ?? undefined}
            validationPresentation="progressive"
            publishPresentationEnabled
            producerBoundary={ProducerBoundary}
            contentWrapper={(content) => (
              <>
                {content}
                <ProducerApiIssueProbe />
                <ProducerApiSlotIssueProbe />
              </>
            )}
            footer={(form) => (
              <button
                type="button"
                onClick={() => {
                  // Same adopted onSubmit TabbedForm calls after a successful native submit.
                  void onSubmit(form.getValues(), form).catch(() => undefined)
                }}
              >
                Save changes
              </button>
            )}
          />
        </FormUiProvider>
      </ContentFormWriteGateProvider>
    )
  }

  return render(
    <QueryClientProvider client={client}>
      <Harness />
    </QueryClientProvider>,
  )
}

describe('monster edit failed persist producer projection', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    prepareWriteSpy.mockReset()
  })

  it('accepts a dirty swarm name edit at the publish commit boundary', () => {
    const loaded = loadSwarmEdit()
    const values = {
      ...(loaded.defaultValues as MonsterFormValues),
      name: 'Swarm of Insectsx',
    }
    expect(loaded.schema.safeParse(values).success).toBe(true)
    expect(loaded.schema.safeParse(loaded.defaultValues).success).toBe(true)
    const overlayBaseline = monsterFormDef.normalizeOverlayBody!(
      loaded.defaultValues as MonsterFormValues,
      { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      loaded.validationIntent,
    )
    expect(() =>
      prepareSerializedContentFormWrite({
        def: monsterFormDef,
        values,
        form: { formState: { dirtyFields: { name: true } } } as never,
        inputCtx: { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
        validationIntent: loaded.validationIntent,
        operation: 'update',
        rulesetId: RULESET_ID,
        serializeOptions: {
          overlayBaseline,
          catalogSeed: loaded.catalogSeed,
          expectedOverlayRevision: loaded.entity.overlayRevision ?? 0,
          entityId: loaded.entity.id,
          seedRowIdsByPath: loaded.entity.seedRowIdsByPath,
        },
      }),
    ).not.toThrow()
  })

  it('resolver accepts swarm defaults after a hoisted name edit', async () => {
    const loaded = loadSwarmEdit()
    const allTabs = augmentTabsWithHoistedName(
      buildMonsterTabs(loaded.layoutCtx),
      monsterFormDef.nameField(loaded.layoutCtx),
    )
    const resolver = makeResolver(loaded.schema, collectTabbedFormResolverItems(allTabs))
    const values = {
      ...(loaded.defaultValues as MonsterFormValues),
      name: 'Swarm of Insectsx',
    }
    const result = await resolver(values, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    expect(result.errors).toEqual({})
  })

  it('keeps api producer issues and field copy after persist rejection on the tabbed edit shell', async () => {
    const user = userEvent.setup({ delay: null })
    mutateAsync.mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid monster', {
        issues: [{ path: 'name', message: 'Name is already in use.', code: 'duplicate' }],
      }),
    )

    renderMonsterEditPersistHarness()

    const nameField = await screen.findByRole('textbox', { name: 'Name' })
    await user.type(nameField, 'x')

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(prepareWriteSpy).toHaveBeenCalledTimes(1)
      expect(mutateAsync).toHaveBeenCalledTimes(1)
      expect(screen.getByText(/Name is already in use/i)).toBeInTheDocument()
      expect(screen.getByTestId('api-slot-issue-count')).toHaveTextContent('1')
    })

    const preparedFromPath = prepareWriteSpy.mock.calls[0]![0]
    expect(mutateAsync.mock.calls[0]![0]).toEqual(preparedFromPath.payload)
    expect(mutateAsync.mock.calls[0]![0]).not.toEqual(preparedFromPath)

    const loaded = loadSwarmEdit()
    const values = {
      ...(loaded.defaultValues as MonsterFormValues),
      name: 'Swarm of Insectsx',
    }
    const overlayBaseline = monsterFormDef.normalizeOverlayBody!(
      loaded.defaultValues as MonsterFormValues,
      { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      loaded.validationIntent,
    )
    const expectedPrepared = prepareSerializedContentFormWrite({
      def: monsterFormDef,
      values,
      form: { formState: { dirtyFields: { name: true } } } as never,
      inputCtx: { entity: loaded.entity, armorClassRules: loaded.layoutCtx.armorClassRules },
      validationIntent: loaded.validationIntent,
      operation: 'update',
      rulesetId: RULESET_ID,
      serializeOptions: {
        overlayBaseline,
        catalogSeed: loaded.catalogSeed,
        expectedOverlayRevision: loaded.entity.overlayRevision ?? 0,
        entityId: loaded.entity.id,
        seedRowIdsByPath: loaded.entity.seedRowIdsByPath,
      },
    })
    expect(mutateAsync.mock.calls[0]![0]).toEqual(expectedPrepared.payload)
  })

  it('does not paint api issues when a superseded same-stamp attempt fails late', async () => {
    const user = userEvent.setup({ delay: null })
    const loaded = loadSwarmEdit()
    const savedName = 'Swarm of Insects!'
    let releaseFirst: () => void = () => undefined

    mutateAsync
      .mockImplementationOnce(
        () =>
          new Promise<void>((_, reject) => {
            releaseFirst = () =>
              reject(
                new ApiError(400, 'validation_error', 'Invalid monster', {
                  issues: [{ path: 'name', message: 'Name is already in use.', code: 'duplicate' }],
                }),
              )
          }),
      )
      .mockResolvedValueOnce({
        ...loaded.entity,
        name: savedName,
      })

    renderMonsterEditPersistHarness()

    const nameField = await screen.findByRole('textbox', { name: 'Name' })
    await user.type(nameField, '!')

    const save = screen.getByRole('button', { name: /save changes/i })
    let first!: Promise<void>
    act(() => {
      first = user.click(save).then(() => undefined)
    })
    first.catch(() => undefined)
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))

    await act(async () => {
      await user.click(save)
    })
    await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(2))

    await act(async () => {
      releaseFirst()
      await first
    })

    await waitFor(() => {
      expect(screen.queryByText(/Name is already in use/i)).not.toBeInTheDocument()
      expect(screen.getByTestId('api-slot-issue-count')).toHaveTextContent('0')
    })
  })
})
