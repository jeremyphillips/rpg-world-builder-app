/**
 * @vitest-environment jsdom
 *
 * Phase 0 desired-behavior fixtures at the content dashboard boundary — mounted
 * TabbedForm submit with adopted producer and canonical publish paint.
 */
import { useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { addCustomRefinementIssue } from '@rpg/contracts'
import {
  TabbedForm,
  collectTabbedFormResolverItems,
  collectCurrentFormValidationProducerIssues,
  FormItems,
  FormUiProvider,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  FormUiContext,
  type FormItem,
  type FormValidationProducerSlot,
  type TabbedFormTab,
  createEmptyFormValidationProducerSession,
  replaceFormValidationProducerSlot,
} from '@rpg/ui/form'

import {
  movementAlternativeFormSchema,
  movementAlternativeGroupField,
  movementRowDraftFormSchema,
  movementValidationMessages,
  refineMovementAlternativeForm,
  MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_LABEL,
} from '../fields/content-movement-form-fields'
import { evaluateContentPublishFormIssues } from './content-publish-validation.lib'
import { ingestContentFormValidationIssues } from './ingest-content-form-validation.lib'
import { MountedPublishCanonicalBridge } from './mounted-publish-canonical-bridge.client'
import { formatFieldMessage } from '@rpg/contracts'
import {
  useContentFormSubmit,
  useContentFormSubmitProducerBinding,
} from '../shells/submit/content-form-submit'
import type { AnyContentFormDef, ContentFormCtx } from '../registry/content-form-registry'

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

function CanonicalPublishIssuesProbe({
  publishSchema,
  publishFields,
}: {
  publishSchema: z.ZodType<MovementAltValues>
  publishFields: FormItem[]
}) {
  const form = useFormContext<MovementAltValues>()
  const ui = useContext(FormUiContext)
  if (!ui.hasAttemptedPublish && !ui.hasAttemptedSubmit) return null
  const issues =
    evaluateContentPublishFormIssues(publishSchema, form.getValues(), publishFields) ?? []
  if (!issues.length) return null
  return (
    <div data-testid="canonical-publish-issues-probe">
      {issues.map((issue) => (
        <p
          key={`${issue.path}:${issue.claim?.target ?? issue.path}`}
          data-issue-target={issue.claim?.target}
        >
          {issue.message}
        </p>
      ))}
    </div>
  )
}

function RhfCanonicalErrorProbe({
  parentPath,
  childPath,
}: {
  parentPath: string
  childPath: string
}) {
  const form = useFormContext()
  const parent = form.getFieldState(parentPath as never).error?.message
  const child = form.getFieldState(childPath as never).error?.message
  return (
    <div data-testid="rhf-canonical-error-probe">
      {parent ? <p data-testid="rhf-parent-error">{parent}</p> : null}
      {child ? <p data-testid="rhf-child-error">{child}</p> : null}
    </div>
  )
}

function adoptedProducerBoundary(resolverFields: FormItem[]) {
  return function ProducerBoundary({ children }: { children: ReactNode }) {
    const [session, setSession] = useState(() => createEmptyFormValidationProducerSession())
    const stampRef = useRef(0)
    const replaceSlot = useCallback(
      (slot: FormValidationProducerSlot, issues: readonly FormIssue[]) => {
        setSession((prev) =>
          ingestContentFormValidationIssues(prev, slot, stampRef.current, issues),
        )
      },
      [],
    )

    return (
      <FormValidationProducerProvider
        session={session}
        stamp={stampRef.current}
        replaceSlot={replaceSlot}
      >
        <FormValidationInteractiveProducerBridge fields={resolverFields} />
        {children}
      </FormValidationProducerProvider>
    )
  }
}

function movementAlternativeDualIssueSchema() {
  return z
    .object({
      movement: z.array(movementRowDraftFormSchema),
      movementAlternative: movementAlternativeFormSchema.optional(),
    })
    .superRefine((values, ctx) => {
      if (values.movementAlternative && values.movementAlternative.modes.length === 1) {
        addCustomRefinementIssue(ctx, 'Alternative movement is incomplete.', [
          'movementAlternative',
        ])
      }
      refineMovementAlternativeForm(values.movementAlternative, values.movement, ctx)
    })
}

type MovementAltValues = z.infer<ReturnType<typeof movementAlternativeDualIssueSchema>>

function movementAltMountedHarness(publishSchema: z.ZodType<MovementAltValues>) {
  const movementField = movementAlternativeGroupField()
  const tabs: TabbedFormTab[] = [
    {
      id: 'statistics',
      label: 'Statistics',
      fields: [movementField],
    },
  ]
  const resolverFields = collectTabbedFormResolverItems(tabs)
  const defaultValues: MovementAltValues = {
    movement: [{ mode: 'walk', feet: 20 }],
    movementAlternative: { modes: ['fly'], feet: 20 },
  }
  function EditShellProducerBoundary({ children }: { children: ReactNode }) {
    const Boundary = adoptedProducerBoundary(resolverFields)
    return (
      <Boundary>
        <MountedPublishCanonicalBridge
          publishSchema={publishSchema}
          publishFields={resolverFields}
        />
        <CanonicalPublishIssuesProbe publishSchema={publishSchema} publishFields={resolverFields} />
        <RhfCanonicalErrorProbe
          parentPath="movementAlternative"
          childPath="movementAlternative.modes"
        />
        {children}
      </Boundary>
    )
  }

  return {
    tabs,
    resolverFields,
    defaultValues,
    EditShellProducerBoundary,
    publishSchema,
  }
}

describe('content form phase 0 mounted presentation', () => {
  it('keeps descendant modes issues visible alongside the parent group issue after publish', async () => {
    const user = userEvent.setup()
    const harness = movementAltMountedHarness(movementAlternativeDualIssueSchema())
    const parentCopy = 'Alternative movement is incomplete.'
    const modesCopy = formatFieldMessage(movementValidationMessages.alternativeMinModes())

    render(
      <FormUiProvider fields={harness.resolverFields} publishPresentationEnabled>
        <TabbedForm
          id="phase0-descendant-claim"
          schema={harness.publishSchema}
          tabs={harness.tabs}
          defaultValues={harness.defaultValues}
          producerBoundary={harness.EditShellProducerBoundary}
          validationPresentation="progressive"
          publishPresentationEnabled
          onSubmit={vi.fn()}
          footer={<button type="submit">Publish</button>}
        />
      </FormUiProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    const formRoot = () => {
      const form = document.getElementById('phase0-descendant-claim')
      expect(form).toBeTruthy()
      return form as HTMLElement
    }

    await waitFor(() => {
      const scoped = within(formRoot())
      expect(scoped.getByTestId('rhf-child-error')).toHaveTextContent(
        /at least two alternative movement modes/i,
      )
      const modesGroup = scoped.getByRole('group', {
        name: MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_LABEL,
      })
      expect(modesGroup).toHaveAttribute('aria-invalid', 'true')
    })

    await waitFor(() => {
      const [canonicalProbe] = within(formRoot()).getAllByTestId('canonical-publish-issues-probe')
      expect(canonicalProbe).toBeTruthy()
      expect(canonicalProbe.querySelectorAll('p')).toHaveLength(2)
      expect(
        canonicalProbe.querySelector('[data-issue-target="movementAlternative"]'),
      ).toHaveTextContent(parentCopy)
      expect(
        canonicalProbe.querySelector('[data-issue-target="movementAlternative.modes"]'),
      ).toHaveTextContent(modesCopy)
    })

    const routed =
      evaluateContentPublishFormIssues(
        harness.publishSchema,
        harness.defaultValues,
        harness.resolverFields,
      ) ?? []
    expect(routed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: 'movementAlternative',
          claim: { kind: 'field', target: 'movementAlternative' },
        }),
        expect.objectContaining({
          path: 'movementAlternative.modes',
          claim: { kind: 'field', target: 'movementAlternative.modes' },
        }),
      ]),
    )
  })

  it('does not badge the first tab when an orphan issue has no tab owner', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      a: z.string().min(1, 'A is required'),
      b: z.string().min(1, 'B is required'),
    })
    const tabs: TabbedFormTab[] = [
      {
        id: 'a',
        label: 'A',
        fields: [{ type: 'text', name: 'a', label: 'Field A', required: true }],
      },
      {
        id: 'b',
        label: 'B',
        fields: [{ type: 'text', name: 'b', label: 'Field B', required: true }],
      },
    ]
    const resolverFields = collectTabbedFormResolverItems(tabs)

    const publishSchema = schema.superRefine((_values, ctx) => {
      addCustomRefinementIssue(ctx, 'Orphan issue', ['orphan'])
    })

    function OrphanProducerBoundary({ children }: { children: ReactNode }) {
      const Boundary = adoptedProducerBoundary(resolverFields)
      return (
        <Boundary>
          <MountedPublishCanonicalBridge
            publishSchema={publishSchema}
            publishFields={resolverFields}
          />
          {children}
        </Boundary>
      )
    }

    render(
      <FormUiProvider fields={resolverFields} publishPresentationEnabled>
        <TabbedForm
          id="phase0-orphan-tab"
          schema={publishSchema}
          tabs={tabs}
          defaultValues={{ a: 'ok', b: 'ok' }}
          producerBoundary={OrphanProducerBoundary}
          validationPresentation="progressive"
          publishPresentationEnabled
          onSubmit={vi.fn()}
          footer={<button type="submit">Publish</button>}
        />
      </FormUiProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'A' })).not.toHaveTextContent(/\d/)
      expect(screen.getByRole('button', { name: 'B' })).not.toHaveTextContent(/\d/)
    })
  })

  it('keeps pathless form issues off tab badges after publish', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1, 'Name is required'),
      notes: z.string().optional(),
    })
    const tabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
      },
      {
        id: 'notes',
        label: 'Notes',
        fields: [{ type: 'text', name: 'notes', label: 'Notes' }],
      },
    ]
    const resolverFields = collectTabbedFormResolverItems(tabs)
    const pathlessCopy = 'Review this form and try again.'

    const publishSchema = schema.superRefine((_values, ctx) => {
      addCustomRefinementIssue(ctx, pathlessCopy, [])
    })

    function PathlessProducerBoundary({ children }: { children: ReactNode }) {
      const Boundary = adoptedProducerBoundary(resolverFields)
      return (
        <Boundary>
          <MountedPublishCanonicalBridge
            publishSchema={publishSchema}
            publishFields={resolverFields}
          />
          {children}
        </Boundary>
      )
    }

    render(
      <FormUiProvider fields={resolverFields} publishPresentationEnabled>
        <TabbedForm
          id="phase0-pathless-badge"
          schema={publishSchema}
          tabs={tabs}
          defaultValues={{ name: 'Valid name', notes: '' }}
          producerBoundary={PathlessProducerBoundary}
          validationPresentation="progressive"
          publishPresentationEnabled
          onSubmit={vi.fn()}
          footer={<button type="submit">Publish</button>}
        />
      </FormUiProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Identity' })).not.toHaveTextContent(/\d/)
      expect(screen.getByRole('button', { name: 'Notes' })).not.toHaveTextContent(/\d/)
    })
  })

  it('does not leak raw Zod transport in the mounted TabbedForm footer on prepareWrite failure', async () => {
    const persist = vi.fn()
    const submitSchema = z.object({
      name: z.string().min(1, 'Name is required.'),
      level: z.coerce.number().min(1, 'Level is required.'),
    })
    type SubmitValues = z.infer<typeof submitSchema>
    const submitTabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
        errorPaths: ['name'],
      },
      {
        id: 'stats',
        label: 'Stats',
        fields: [{ type: 'number', name: 'level', label: 'Level', required: true }],
        errorPaths: ['level'],
      },
    ]
    const submitFields = collectTabbedFormResolverItems(submitTabs)
    const submitDef = {
      schema: submitSchema,
      draftSchema: submitSchema,
      createDefaultValues: { name: 'Ready', level: 2 },
      nameField: (): FormItem => submitFields[0],
      buildFields: (): FormItem[] => submitFields,
    } as unknown as AnyContentFormDef
    const submitCtx = { campaignId: 'camp-1', mode: 'create' } as ContentFormCtx
    const user = userEvent.setup()
    const controls = { submit: async () => undefined as Promise<void> }

    function Harness() {
      const binding = useContentFormSubmitProducerBinding()
      const contentSubmit = useContentFormSubmit<SubmitValues>({
        def: submitDef,
        ctx: submitCtx,
        fallbackMessage: 'Could not save.',
        producerBinding: binding,
        invalidPresentation: {
          resolverFields: submitFields,
          formId: 'phase0-footer-zod',
        },
        prepareWrite: () => {
          throw new z.ZodError([
            {
              code: 'too_small',
              minimum: 1,
              type: 'string',
              inclusive: true,
              message: 'Name must be present on wire.',
              path: ['name'],
            },
          ])
        },
        persist,
      })
      controls.submit = (values, form) => contentSubmit.onSubmit(values, form)
      const Boundary = contentSubmit.ProducerBoundary

      return (
        <FormUiProvider fields={submitFields} validationPresentation="progressive">
          <TabbedForm<SubmitValues>
            id="phase0-footer-zod"
            schema={submitSchema}
            tabs={submitTabs}
            defaultValues={{ name: 'Ready', level: 2 }}
            onSubmit={contentSubmit.onSubmit}
            formError={contentSubmit.formError ?? undefined}
            validationPresentation="progressive"
            producerBoundary={Boundary}
            footer={(form) => (
              <button
                type="button"
                onClick={() => {
                  void controls.submit(form.getValues(), form).catch(() => undefined)
                }}
              >
                Save
              </button>
            )}
          />
        </FormUiProvider>
      )
    }

    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('aria-invalid', 'true')
    })

    const footerAlert = screen.queryByRole('alert')
    const footerCopy = footerAlert?.textContent ?? ''
    expect(footerCopy).not.toMatch(/\[|ZodError/i)
    expect(persist).not.toHaveBeenCalled()
  })

  it('drops stale producer slots after snapshot stamp advances on mounted TabbedForm submit', async () => {
    const user = userEvent.setup()
    const submitSchema = z.object({
      name: z.string().min(1),
      grants: z.array(z.object({ label: z.string().min(1) })),
    })
    type SubmitValues = z.infer<typeof submitSchema>
    const grantFields: FormItem[] = [
      {
        kind: 'array',
        name: 'grants',
        label: 'Grants',
        fields: [{ type: 'text', name: 'label', label: 'Label', required: true }],
      },
    ]
    const submitTabs: TabbedFormTab[] = [
      {
        id: 'grants',
        label: 'Grants',
        fields: grantFields,
        errorPaths: ['grants'],
      },
    ]
    const submitFields = collectTabbedFormResolverItems(submitTabs)
    const staleCopy = 'Stale api copy'
    const currentCopy = 'Current interactive copy'
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'api', 1, [
      {
        path: 'grants.0.label',
        message: staleCopy,
        severity: 'field',
        claim: { kind: 'field', target: 'grants.0.label' },
      },
    ])
    session = replaceFormValidationProducerSlot(session, 'interactive', 2, [
      {
        path: 'grants.0.label',
        message: currentCopy,
        severity: 'field',
        claim: { kind: 'field', target: 'grants.0.label' },
      },
    ])

    function StampGuardProducerBoundary({ children }: { children: ReactNode }) {
      return (
        <FormValidationProducerProvider session={session} stamp={2} replaceSlot={vi.fn()}>
          <FormValidationInteractiveProducerBridge fields={submitFields} />
          {children}
        </FormValidationProducerProvider>
      )
    }

    render(
      <FormUiProvider fields={submitFields} validationPresentation="progressive">
        <TabbedForm<SubmitValues>
          id="phase0-stamp-guard"
          schema={submitSchema}
          tabs={submitTabs}
          defaultValues={{ name: 'Ready', grants: [{ label: '' }] }}
          producerBoundary={StampGuardProducerBoundary}
          validationPresentation="progressive"
          onSubmit={vi.fn()}
          footer={<button type="submit">Save</button>}
        />
      </FormUiProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByText(currentCopy)).toBeInTheDocument()
    })
    expect(screen.queryByText(staleCopy)).not.toBeInTheDocument()
    expect(collectCurrentFormValidationProducerIssues(session, 2)).toHaveLength(1)
    expect(collectCurrentFormValidationProducerIssues(session, 2)[0]?.message).toBe(currentCopy)
    expect(collectCurrentFormValidationProducerIssues(session, 1)).toHaveLength(1)
    expect(collectCurrentFormValidationProducerIssues(session, 1)[0]?.message).toBe(staleCopy)
    expect(collectCurrentFormValidationProducerIssues(session, 2)).not.toEqual(
      collectCurrentFormValidationProducerIssues(session, 1),
    )
  })

  it('does not badge a disconnected header-only tab at the content TabbedForm boundary', async () => {
    const user = userEvent.setup()
    const schema = z.object({
      name: z.string().min(1),
      meta: z.object({ title: z.string().min(1, 'Title is required.') }),
    })
    type Values = z.infer<typeof schema>
    const tabs: TabbedFormTab[] = [
      {
        id: 'identity',
        label: 'Identity',
        fields: [{ type: 'text', name: 'name', label: 'Name', required: true }],
        errorPaths: ['name'],
      },
      {
        id: 'meta',
        label: 'Meta',
        fields: [],
        header: (
          <FormItems
            items={[{ type: 'text', name: 'title', label: 'Title', required: true }]}
            idPrefix="meta"
            namePrefix="meta"
          />
        ),
      },
    ]
    const resolverFields = collectTabbedFormResolverItems(tabs)

    render(
      <FormUiProvider fields={resolverFields} validationPresentation="progressive">
        <TabbedForm<Values>
          id="phase0-disconnected-header"
          schema={schema}
          tabs={tabs}
          defaultValues={{ name: 'Valid', meta: { title: '' } }}
          validationPresentation="progressive"
          onSubmit={vi.fn()}
          footer={<button type="submit">Save</button>}
        />
      </FormUiProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Meta' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Identity' })).not.toHaveTextContent(/\d/)
      expect(screen.getByRole('button', { name: 'Meta' })).not.toHaveTextContent(/\d/)
    })
  })
})
