/**
 * @vitest-environment jsdom
 */
import { useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getMonsterBySlug } from '@rpg/catalog/monsters'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { TabbedForm, collectTabbedFormResolverItems, FormUiProvider } from '@rpg/ui/form'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import { ContentFormWriteGateProvider } from '../../lib/forms/shells/layout/content-form-write-gate'
import { prepareSerializedContentFormWrite } from '../../lib/forms/submit/prepare-serialized-content-form-write.lib'
import { useContentFormSubmit } from '../../lib/forms/shells/submit/content-form-submit'
import { buildMonsterTabs } from './monster-form-fields'
import { monsterFormDef } from './monster-form-def'
import { MONSTER_FORM_TAB } from './monster-form-view'
import { resolveMonsterFormSchema } from './monster-form-schema'
import { monsterToFormValues, type MonsterFormValues } from './monster-form-values'

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

const mutateAsync = vi.hoisted(() => vi.fn())
const prepareWriteSpy = vi.hoisted(() => vi.fn())
const formValuesAtPersist = vi.hoisted(() => vi.fn())

function renderMonsterCreatePersistHarness() {
  const layoutCtx = makeContentFormCtx({
    mode: 'create',
    rulesetId: RULESET_ID,
    equipmentCatalogStatus: 'ready',
    equipmentCatalogById: new Map(),
    skillCatalogStatus: 'ready',
    skillCatalogBySlug: new Map(),
    spellCatalogStatus: 'ready',
    spellCatalogById: new Map(),
  })
  const schema = resolveMonsterFormSchema(layoutCtx, 'publish')
  const catalogMonster = getMonsterBySlug(RULESET_ID, 'swarm-of-insects')
  expect(catalogMonster).toBeDefined()
  const defaultValues = {
    ...monsterToFormValues(catalogMonster!),
    name: 'Integration beetle',
  }
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const formKey = `monster-create:${TEST_CAMPAIGN_ID}`
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
    const serializeInputCtx = useMemo(
      () => ({
        armorClassRules: layoutCtx.armorClassRules,
        campaignRules: layoutCtx.campaignRules,
        equipmentKind: layoutCtx.equipmentKind,
      }),
      [],
    )

    const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<MonsterFormValues>({
      def: monsterFormDef,
      ctx: layoutCtx,
      fallbackMessage: 'Could not create monsters.',
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
          validationIntent: 'publish',
          operation: 'create',
          rulesetId: RULESET_ID,
        })
        prepareWriteSpy(prepared)
        return prepared
      },
      persist: async (wireInput, form) => {
        formValuesAtPersist(form.getValues())
        await mutateAsync(wireInput)
      },
    })

    return (
      <ContentFormWriteGateProvider>
        <FormUiProvider fields={resolverFields} publishPresentationEnabled>
          <TabbedForm<MonsterFormValues>
            id={formKey}
            uiStateKey={formKey}
            schema={schema}
            tabs={tabs}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            formError={formError ?? undefined}
            validationPresentation="progressive"
            publishPresentationEnabled
            producerBoundary={ProducerBoundary}
            footer={(form) => (
              <button
                type="button"
                onClick={() => {
                  void onSubmit(form.getValues(), form).catch(() => undefined)
                }}
              >
                Create monster
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

describe('monster create persist payload', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({ id: 'new-monster', catalogLayer: 'homebrew' })
    prepareWriteSpy.mockReset()
    formValuesAtPersist.mockReset()
  })

  it('passes prepare-serialized write payload to persist instead of raw rhf values', async () => {
    const user = userEvent.setup({ delay: null })
    renderMonsterCreatePersistHarness()

    await user.click(screen.getByRole('button', { name: 'Statistics' }))
    await user.type(await screen.findByRole('textbox', { name: 'Name' }), '!')

    await user.click(screen.getByRole('button', { name: /create monster/i }))

    await waitFor(() => {
      expect(prepareWriteSpy).toHaveBeenCalledTimes(1)
      expect(mutateAsync).toHaveBeenCalledTimes(1)
    })

    const preparedFromPath = prepareWriteSpy.mock.calls[0]![0]
    expect(mutateAsync.mock.calls[0]![0]).toEqual(preparedFromPath.payload)
    expect(mutateAsync.mock.calls[0]![0]).not.toEqual(formValuesAtPersist.mock.calls[0]![0])

    const layoutCtx = makeContentFormCtx({
      mode: 'create',
      rulesetId: RULESET_ID,
      equipmentCatalogStatus: 'ready',
      skillCatalogStatus: 'ready',
      spellCatalogStatus: 'ready',
    })
    const catalog = getMonsterBySlug(RULESET_ID, 'swarm-of-insects')!
    const values = {
      ...monsterToFormValues(catalog),
      name: 'Integration beetle!',
    }
    const expectedPrepared = prepareSerializedContentFormWrite({
      def: monsterFormDef,
      values,
      form: { formState: { dirtyFields: { name: true } } } as never,
      inputCtx: {
        armorClassRules: layoutCtx.armorClassRules,
        campaignRules: layoutCtx.campaignRules,
        equipmentKind: layoutCtx.equipmentKind,
      },
      validationIntent: 'publish',
      operation: 'create',
      rulesetId: RULESET_ID,
    })
    expect(mutateAsync.mock.calls[0]![0]).toEqual(expectedPrepared.payload)
  })
})
