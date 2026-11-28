/**
 * @vitest-environment jsdom
 *
 * Production entry: skill proficiency Form + useContentFormSubmit blocks publish persist.
 */
import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  Form,
  FormUiProvider,
  useFormValidationProducerContext,
  collectCurrentFormValidationProducerIssues,
  isFormValidationProducerSlotStale,
} from '@rpg/ui/form'

import { makeContentFormCtx, TEST_CAMPAIGN_ID } from '../../lib/fixtures/content-form-ctx'
import { resolveContentFormNavigationFields } from '../../lib/forms/shells/host/content-form-host-projection'
import {
  loadContentEditFormState,
  resolveContentFormSchema,
} from '../../lib/forms/shells/edit/content-edit-load'
import { useContentFormSubmit } from '../../lib/forms/shells/submit/content-form-submit'
import { ATHLETICS } from '../fixtures'
import {
  buildSkillProficiencyFields,
  skillProficiencyFormSchema,
  type SkillProficiencyFormValues,
} from './skill-proficiency-form-fields'
import { skillProficiencyFormDef } from './skill-proficiency-form-def'

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

function loadSkillProficiencyEdit(overrides?: Partial<SkillProficiencyFormValues>) {
  const entity = {
    ...ATHLETICS,
    catalogLayer: 'homebrew' as const,
    status: 'draft' as const,
    overlayRevision: 0,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }
  const optionsCtx = makeContentFormCtx({
    rulesetId: ATHLETICS.rulesetId,
    mode: 'edit',
    entityId: entity.id,
  })
  const loaded = loadContentEditFormState({
    def: skillProficiencyFormDef,
    entity,
    optionsCtx,
    campaignId: TEST_CAMPAIGN_ID,
    entityId: entity.id,
  })
  const defaultValues = {
    ...loaded.defaultValues,
    ...overrides,
  } as SkillProficiencyFormValues
  const layoutCtx = loaded.layoutCtx
  const schema =
    resolveContentFormSchema(skillProficiencyFormDef, layoutCtx, loaded.validationIntent) ??
    skillProficiencyFormSchema
  const fields = buildSkillProficiencyFields(layoutCtx)
  const resolverFields = resolveContentFormNavigationFields(
    skillProficiencyFormDef,
    layoutCtx,
    fields,
  )
  const formKey = `skill-proficiency-edit:${entity.id}`

  return {
    layoutCtx,
    defaultValues,
    schema,
    fields,
    resolverFields,
    formKey,
    validationIntent: loaded.validationIntent,
  }
}

function renderSkillProficiencyEditPipeline(overrides?: Partial<SkillProficiencyFormValues>) {
  const loaded = loadSkillProficiencyEdit(overrides)
  const persist = vi.fn()

  function Harness() {
    const { onSubmit, formError, ProducerBoundary } =
      useContentFormSubmit<SkillProficiencyFormValues>({
        def: skillProficiencyFormDef,
        ctx: loaded.layoutCtx,
        commitValidationIntent: loaded.validationIntent,
        fallbackMessage: 'Could not update skill proficiencies.',
        invalidPresentation: {
          resolverFields: loaded.resolverFields,
          formId: loaded.formKey,
        },
        prepareWrite: () => {
          throw new Error('prepareWrite must not run when commit validation blocks save')
        },
        persist,
      })

    return (
      <FormUiProvider fields={loaded.resolverFields} publishPresentationEnabled>
        <Form
          id={loaded.formKey}
          schema={loaded.schema}
          fields={loaded.fields}
          defaultValues={loaded.defaultValues}
          onSubmit={onSubmit}
          formError={formError ?? undefined}
          validationPresentation="progressive"
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
  return { persist, ...view }
}

describe('skill proficiency edit validation pipeline', () => {
  it('blocks persist when example rows fail publish validation', async () => {
    const user = userEvent.setup()
    const { persist } = renderSkillProficiencyEditPipeline({
      examples: [{ value: '' }],
    })

    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(persist).not.toHaveBeenCalled()
      expect(Number(screen.getByTestId('interactive-issue-count').textContent)).toBeGreaterThan(0)
    })
  })
})
