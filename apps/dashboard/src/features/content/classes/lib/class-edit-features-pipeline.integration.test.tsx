/**
 * @vitest-environment jsdom
 *
 * Production entry for class embedded features: real `classFormDef` tabs,
 * `useContentFormSubmit`, and producer session — not the isolated ClassFeaturesTab harness.
 */
import type { CharacterClass } from '@rpg/contracts'
import { getClassBySlug } from '@rpg/catalog/classes'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  TabbedForm,
  TABBED_FORM_SECTIONS_ARIA_LABEL,
  collectTabbedFormResolverItems,
  FormUiProvider,
  useFormValidationProducerContext,
  collectCurrentFormValidationProducerIssues,
  isFormValidationProducerSlotStale,
} from '@rpg/ui/form'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import {
  loadContentEditFormState,
  resolveContentFormSchema,
} from '../../lib/forms/shells/edit/content-edit-load'
import { useContentFormSubmit } from '../../lib/forms/shells/submit/content-form-submit'
import { buildClassTabs, type ClassFormValues } from './class-form-fields'
import { classFormDef } from './class-form-def'

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

function systemFighterEntity(): CharacterClass {
  const catalog = getClassBySlug(RULESET_ID, 'fighter')
  expect(catalog).toBeDefined()
  return {
    ...catalog!,
    catalogLayer: 'system',
    status: 'published',
    campaignAccess: catalog!.campaignAccess ?? { participants: [], campaignId: TEST_CAMPAIGN_ID },
    overlayRevision: 0,
  } as CharacterClass
}

function loadClassEdit(overrides?: Partial<ClassFormValues>) {
  const entity = systemFighterEntity()
  const optionsCtx = makeContentFormCtx({
    rulesetId: RULESET_ID,
    spellCatalogStatus: 'ready',
    classCatalogStatus: 'ready',
    entityId: entity.id,
    mode: 'edit',
  })
  const loaded = loadContentEditFormState({
    def: classFormDef,
    entity,
    optionsCtx,
    campaignId: TEST_CAMPAIGN_ID,
    entityId: entity.id,
  })
  const defaultValues = {
    ...loaded.defaultValues,
    ...overrides,
  } as ClassFormValues
  const layoutCtx = loaded.layoutCtx
  const schema =
    resolveContentFormSchema(classFormDef, layoutCtx, loaded.validationIntent) ??
    classFormDef.schema
  const allTabs = augmentTabsWithHoistedName(
    buildClassTabs(layoutCtx),
    classFormDef.nameField(layoutCtx),
  )
  const featuresTab = allTabs.find((tab) => tab.id === 'features')
  expect(featuresTab).toBeDefined()
  const tabs = [
    {
      ...allTabs[0]!,
      fields: [classFormDef.nameField(layoutCtx), ...allTabs[0]!.fields],
    },
    featuresTab!,
  ]
  const resolverFields = collectTabbedFormResolverItems(allTabs)
  const formKey = `class-edit:${entity.id}`

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

function renderClassFeaturesPipeline(overrides?: Partial<ClassFormValues>) {
  const loaded = loadClassEdit(overrides)
  const persist = vi.fn()

  function Harness() {
    const { onSubmit, formError, ProducerBoundary } = useContentFormSubmit<ClassFormValues>({
      def: classFormDef,
      ctx: loaded.layoutCtx,
      commitValidationIntent: loaded.validationIntent,
      fallbackMessage: 'Could not update classes.',
      invalidPresentation: {
        resolverFields: loaded.resolverFields,
        formId: loaded.formKey,
        resolveViewForPath: (path) => (path.startsWith('features') ? 'features' : undefined),
        activateView: () => undefined,
      },
      prepareWrite: () => {
        throw new Error('prepareWrite must not run when commit validation blocks save')
      },
      persist,
    })

    return (
      <FormUiProvider fields={loaded.resolverFields}>
        <TabbedForm
          id={loaded.formKey}
          schema={loaded.schema as never}
          tabs={loaded.tabs}
          defaultValues={loaded.defaultValues}
          onSubmit={onSubmit}
          formError={formError ?? undefined}
          producerBoundary={ProducerBoundary}
          footer={
            <>
              <ProducerInteractiveIssueProbe />
              <button type="submit">Save changes</button>
            </>
          }
        />
      </FormUiProvider>
    )
  }

  const view = render(<Harness />)
  return { ...loaded, persist, ...view }
}

describe('class edit features validation pipeline (FV-016)', () => {
  it('blocks persist and surfaces embedded feature issues through the adopted commit path', async () => {
    const user = userEvent.setup()
    const { persist } = renderClassFeaturesPipeline({
      features: [
        {
          kind: 'custom',
          name: '',
          level: 1,
          grants: [],
        },
      ],
    })

    const sections = () =>
      within(screen.getByRole('group', { name: TABBED_FORM_SECTIONS_ARIA_LABEL }))
    await user.click(sections().getByRole('button', { name: /^Features/i }))
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(persist).not.toHaveBeenCalled()
      expect(Number(screen.getByTestId('interactive-issue-count').textContent)).toBeGreaterThan(0)
    })

    expect(sections().getByRole('button', { name: /Features/i })).toHaveAccessibleName(
      /field needs attention/i,
    )
    const featureNav = screen.getByRole('navigation', { name: 'Features' })
    expect(
      within(featureNav).getByRole('button', { name: /Unnamed Feature|Level 1/i }),
    ).toBeInTheDocument()
  })
})
