/**
 * @vitest-environment jsdom
 *
 * Production-entry: spell TabbedForm + useContentFormSubmit → persist + structured ApiError.
 */
import { useMemo, useState } from 'react'
import { ApiError, type Spell, reincarnateSpeciesTableFixture } from '@rpg/contracts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { RICH_TEXT_TABLE_EMBED_ATTR } from '@rpg/ui'
import { TabbedForm, collectTabbedFormResolverItems, FormUiProvider } from '@rpg/ui/form'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import { ContentFormWriteGateProvider } from '../../lib/forms/shells/layout/content-form-write-gate'
import {
  loadContentEditFormState,
  resolveContentFormSchema,
} from '../../lib/forms/shells/edit/content-edit-load'
import {
  ProducerApiIssueProbe,
  ProducerApiSlotIssueProbe,
} from '../../lib/forms/shells/edit/content-edit-stamp.probe'
import { persistContentEditUpdate } from '../../lib/forms/shells/edit/content-edit-persist.lib'
import { prepareSerializedContentFormWrite } from '../../lib/forms/submit/prepare-serialized-content-form-write.lib'
import { useContentFormSubmit } from '../../lib/forms/shells/submit/content-form-submit'
import { buildSpellTabs, spellFormSchema } from './spell-form-fields'
import { spellFormDef } from './spell-form-def'
import {
  buildSpellCreateInput,
  SPELL_SCALING_FORM_DEFAULTS,
  spellCreateDefaultValues,
  type SpellFormValues,
} from './spell-form-values'

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

const PRUNED_SPELL_TABLES_VALUES = {
  ...spellCreateDefaultValues,
  name: 'Arcane Tables',
  school: 'evocation',
  level: 1,
  classIds: ['wizard'],
  castingTime: {
    normal: { value: 1, unit: 'action' as const },
    canBeCastAsRitual: false,
  },
  range: { kind: 'self' as const },
  duration: { kind: 'instantaneous' as const },
  components: { verbal: true, somatic: true },
  areaOfEffect: spellCreateDefaultValues.areaOfEffect!,
  effects: [],
  description: `<div ${RICH_TEXT_TABLE_EMBED_ATTR}="table-b"></div>`,
  tables: [
    reincarnateSpeciesTableFixture,
    { ...reincarnateSpeciesTableFixture, id: 'table-b', name: 'Table B' },
  ],
  ...SPELL_SCALING_FORM_DEFAULTS,
} as SpellFormValues

function loadSpellTablesEdit() {
  const optionsCtx = makeContentFormCtx({
    rulesetId: RULESET_ID,
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
    classCatalogStatus: 'ready',
    damageTypeVocabulary: buildSeedDamageTypeVocabulary(),
  })
  const entity = {
    id: 'homebrew-arcane-tables',
    catalogLayer: 'homebrew' as const,
    status: 'draft' as const,
    rulesetId: RULESET_ID,
    campaignId: TEST_CAMPAIGN_ID,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    slug: 'arcane-tables',
    ...buildSpellCreateInput(PRUNED_SPELL_TABLES_VALUES, optionsCtx, 'draft'),
  } as Spell
  return {
    entity,
    catalogSeed: undefined as Record<string, unknown> | undefined,
    ...loadContentEditFormState({
      def: spellFormDef,
      entity,
      optionsCtx,
      campaignId: TEST_CAMPAIGN_ID,
      entityId: entity.id,
    }),
  }
}

const mutateAsync = vi.hoisted(() => vi.fn())
const prepareWriteSpy = vi.hoisted(() => vi.fn())

type PersistHarnessOptions = {
  stageValues?: (values: SpellFormValues) => SpellFormValues
}

function renderSpellEditPersistHarness(
  loaded = loadSpellTablesEdit(),
  options?: PersistHarnessOptions,
) {
  const { entity, layoutCtx, defaultValues, validationIntent, catalogSeed } = loaded
  const schema =
    resolveContentFormSchema(spellFormDef, loaded.layoutCtx, loaded.validationIntent) ??
    spellFormSchema
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const formKey = `spell-edit:${entity.id}`
  const allTabs = augmentTabsWithHoistedName(
    buildSpellTabs(layoutCtx),
    spellFormDef.nameField(layoutCtx),
  )
  const basicsTab = allTabs.find((tab) => tab.id === 'basics')!
  const tabs = [
    {
      ...basicsTab,
      fields: [spellFormDef.nameField(layoutCtx), ...basicsTab.fields],
    },
  ]
  const resolverFields = collectTabbedFormResolverItems(allTabs)

  function Harness() {
    const [overlayBaseline, setOverlayBaseline] = useState<Record<string, unknown> | null>(() =>
      entity.catalogLayer === 'system' && spellFormDef.normalizeOverlayBody
        ? spellFormDef.normalizeOverlayBody(
            defaultValues as SpellFormValues,
            { entity, armorClassRules: layoutCtx.armorClassRules },
            validationIntent,
          )
        : null,
    )

    const serializeInputCtx = useMemo(
      () => ({
        entity,
        campaignRules: layoutCtx.campaignRules,
      }),
      [],
    )

    const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<SpellFormValues>({
      def: spellFormDef,
      ctx: layoutCtx,
      commitValidationIntent: validationIntent,
      fallbackMessage: 'Could not update spells.',
      invalidPresentation: {
        resolverFields,
        formId: formKey,
      },
      prepareWrite: (values, form) => {
        const prepared = prepareSerializedContentFormWrite({
          def: spellFormDef,
          values,
          form,
          inputCtx: serializeInputCtx,
          validationIntent,
          operation: 'update',
          rulesetId: RULESET_ID,
          serializeOptions: {
            overlayBaseline: overlayBaseline ?? undefined,
            catalogSeed,
            expectedOverlayRevision: (entity as { overlayRevision?: number }).overlayRevision ?? 0,
            entityId: entity.id,
            seedRowIdsByPath: (entity as { seedRowIdsByPath?: Record<string, readonly string[]> })
              .seedRowIdsByPath,
          },
        })
        prepareWriteSpy(prepared)
        return prepared
      },
      persist: async (wireInput, form, meta) =>
        persistContentEditUpdate({
          def: spellFormDef,
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
          <TabbedForm<SpellFormValues>
            id={formKey}
            uiStateKey={formKey}
            schema={schema}
            tabs={tabs}
            defaultValues={defaultValues as SpellFormValues}
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
                  const values = form.getValues() as SpellFormValues
                  void onSubmit(options?.stageValues?.(values) ?? values, form).catch(
                    () => undefined,
                  )
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

describe('spell edit failed persist producer projection', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    prepareWriteSpy.mockReset()
  })

  it('remaps table wire paths through prepare provenance after persist rejection on the tabbed edit shell', async () => {
    const user = userEvent.setup({ delay: null })
    mutateAsync.mockRejectedValueOnce(
      new ApiError(400, 'validation_error', 'Invalid spell', {
        issues: [
          {
            path: 'tables.0.name',
            message: 'Table name is required.',
            code: 'custom',
          },
        ],
      }),
    )

    renderSpellEditPersistHarness(loadSpellTablesEdit(), {
      stageValues: () => ({
        ...PRUNED_SPELL_TABLES_VALUES,
        name: 'Arcane Tablesx',
      }),
    })

    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => {
      expect(prepareWriteSpy).toHaveBeenCalledTimes(1)
      expect(mutateAsync).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('api-slot-issue-count')).toHaveTextContent('1')
    })

    const preparedFromPath = prepareWriteSpy.mock.calls[0]![0]
    expect(preparedFromPath.provenance).toBeTruthy()
    expect(mutateAsync.mock.calls[0]![0]).toEqual(preparedFromPath.payload)
  })
})
