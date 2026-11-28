/**
 * @vitest-environment jsdom
 *
 * Production entry: species TabbedForm + useContentFormSubmit blocks publish persist.
 */
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  TabbedForm,
  collectTabbedFormResolverItems,
  FormUiProvider,
  useFormValidationProducerContext,
  collectCurrentFormValidationProducerIssues,
  isFormValidationProducerSlotStale,
} from '@rpg/ui/form'

import { DEFAULT_SYSTEM_RULESET_ID, SENSE_SET_ID } from '@rpg/contracts'
import type * as VocabularyFeature from '@/features/vocabulary'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import {
  loadContentEditFormState,
  resolveContentFormSchema,
} from '../../lib/forms/shells/edit/content-edit-load'
import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
} from '../../lib/forms/shells/submit/content-form-submit'
import { HUMAN } from '../fixtures'
import { buildSpeciesTabs, type SpeciesFormValues } from './species-form-fields'
import { speciesFormDef } from './species-form-def'

vi.mock('@/features/vocabulary', async (importOriginal) => {
  const vocabulary = await importOriginal<typeof VocabularyFeature>()
  return {
    ...vocabulary,
    useVocabularySet: () => ({
      data: vocabulary.buildSeedVocabulary(SENSE_SET_ID, (set) => set),
      isPending: false,
      isError: false,
    }),
  }
})

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

function ProducerInteractiveIssueProbe() {
  const producer = useFormValidationProducerContext()
  if (!producer) {
    return <output data-testid="interactive-issue-count">0</output>
  }
  const interactive = producer.session.slots.interactive
  const count =
    interactive && !isFormValidationProducerSlotStale(interactive, producer.stamp)
      ? interactive.issues.length
      : collectCurrentFormValidationProducerIssues(producer.session, producer.stamp).length
  return <output data-testid="interactive-issue-count">{count}</output>
}

function loadSpeciesEdit(overrides?: Partial<SpeciesFormValues>) {
  const entity = {
    ...HUMAN,
    catalogLayer: 'homebrew' as const,
    status: 'draft' as const,
    overlayRevision: 0,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }
  const optionsCtx = makeContentFormCtx({
    rulesetId: HUMAN.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID,
    mode: 'edit',
    entityId: entity.id,
  })
  const loaded = loadContentEditFormState({
    def: speciesFormDef,
    entity,
    optionsCtx,
    campaignId: TEST_CAMPAIGN_ID,
    entityId: entity.id,
  })
  const defaultValues = {
    ...loaded.defaultValues,
    ...overrides,
  } as SpeciesFormValues
  const layoutCtx = loaded.layoutCtx
  const schema =
    resolveContentFormSchema(speciesFormDef, layoutCtx, loaded.validationIntent) ??
    speciesFormDef.schema
  const allTabs = augmentTabsWithHoistedName(
    buildSpeciesTabs(layoutCtx),
    speciesFormDef.nameField(layoutCtx),
  )
  const traitsTab = allTabs.find((tab) => tab.id === 'traits')
  expect(traitsTab).toBeDefined()
  const tabs = [
    {
      ...allTabs[0]!,
      fields: [speciesFormDef.nameField(layoutCtx), ...allTabs[0]!.fields],
    },
    traitsTab!,
  ]
  const resolverFields = collectTabbedFormResolverItems(allTabs)
  const formKey = `species-edit:${entity.id}`

  return {
    entity,
    layoutCtx,
    defaultValues,
    schema,
    tabs,
    resolverFields,
    formKey,
    validationIntent: loaded.validationIntent,
  }
}

function renderSpeciesEditPipeline(overrides?: Partial<SpeciesFormValues>) {
  const loaded = loadSpeciesEdit(overrides)
  const persist = vi.fn()

  function Harness() {
    const producerBinding = useContentFormSubmitProducerBinding()
    const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<SpeciesFormValues>({
      def: speciesFormDef,
      ctx: loaded.layoutCtx,
      producerBinding,
      commitValidationIntent: 'publish',
      fallbackMessage: 'Could not update species.',
      invalidPresentation: {
        resolverFields: loaded.resolverFields,
        formId: loaded.formKey,
        resolveViewForPath: (path) => (path.startsWith('traits') ? 'traits' : undefined),
        activateView: () => undefined,
      },
      prepareWrite: () => {
        throw new Error('prepareWrite must not run when commit validation blocks save')
      },
      persist,
    })

    return (
      <FormUiProvider fields={loaded.resolverFields} publishPresentationEnabled>
        <TabbedForm
          id={loaded.formKey}
          schema={loaded.schema as never}
          tabs={loaded.tabs}
          defaultValues={loaded.defaultValues}
          onSubmit={onSubmit}
          formError={formError ?? undefined}
          validationPresentation="progressive"
          publishPresentationEnabled
          producerBoundary={ProducerBoundary}
          footer={(form) => (
            <>
              <ProducerInteractiveIssueProbe />
              <button
                type="button"
                onClick={() => {
                  void onSubmit(form.getValues(), form).catch(() => undefined)
                }}
              >
                Save changes
              </button>
            </>
          )}
        />
      </FormUiProvider>
    )
  }

  const view = render(<Harness />)
  return { ...loaded, persist, ...view }
}

describe('species edit validation pipeline', () => {
  it('blocks persist and surfaces identity issues through producer session', async () => {
    const user = userEvent.setup()
    const { persist } = renderSpeciesEditPipeline({
      name: '',
    })

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(persist).not.toHaveBeenCalled()
      expect(Number(screen.getByTestId('interactive-issue-count').textContent)).toBeGreaterThan(0)
    })
  })
})
