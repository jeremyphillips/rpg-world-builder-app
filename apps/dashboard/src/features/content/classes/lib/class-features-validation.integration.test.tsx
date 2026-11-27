/**
 * @vitest-environment jsdom
 */
import { useCallback, useRef, useState, type ComponentType, type ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  collectRowVariantTopologyFields,
  collectTabbedFormResolverItems,
  compileFormOwnership,
  createEmptyFormValidationProducerSession,
  FormUiProvider,
  makeResolver,
  resolveTabValidationState,
  type FormIssue,
  type FormItem,
  type FormValidationProducerSlot,
} from '@rpg/ui/form'

import { ClassFeaturesTab } from '../components/class-features-tab'
import { makeContentFormCtx } from '../../lib/fixtures/content-form-ctx'
import { buildClassTabs } from './class-form-fields'
import { embeddedArrayResolverField } from '../../lib/forms/validation/tabbed-form-resolver-fields'
import { ingestContentFormValidationIssues } from '../../lib/forms/validation/ingest-content-form-validation.lib'
import {
  countMasterDetailRowsWithIssues,
  useMasterDetailRowValidation,
} from '../../lib/master-detail/master-detail-row-validation'
import {
  buildClassFeatureRowVariantTopology,
  classFeatureItemFields,
  classFeatureRowResolveFields,
  subclassFeatureItemFields,
} from './class-feature-form-fields'
import {
  createFeatureRowFormSchema,
  createSubclassFeatureRowFormSchema,
} from './class-feature-row-form-schema'
import { effectiveMaxFromCtx } from '../../lib/form-options/content-campaign-rules'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => {}
    HTMLElement.prototype.releasePointerCapture = () => {}
  }
})

const ctx = makeContentFormCtx()
const maxLevel = effectiveMaxFromCtx(ctx)

const classFeatureResolverField = embeddedArrayResolverField('features', 'Features', {
  itemFields: classFeatureItemFields(ctx),
  resolveItemFields: classFeatureRowResolveFields(ctx),
  rowVariantTopology: buildClassFeatureRowVariantTopology(ctx),
})
const classFeaturesSchema = z.object({
  features: z.array(createFeatureRowFormSchema(maxLevel)),
})

const schema = z.object({
  features: z.array(createSubclassFeatureRowFormSchema(maxLevel)),
})

const featureArrayField = {
  kind: 'array' as const,
  name: 'features',
  fields: subclassFeatureItemFields(ctx),
}

function RowIssueCountProbe({
  resolver = subclassFeatureItemFields(ctx),
}: {
  resolver?: FormItem[]
}) {
  const { getRowIssueCount } = useMasterDetailRowValidation('features', resolver)
  return <div data-testid="row-issue-count">{getRowIssueCount(0)}</div>
}

function FeatureRowIssueSummary({
  resolver = classFeatureItemFields(ctx),
}: {
  resolver?: FormItem[]
}) {
  const { getRowIssueCount } = useMasterDetailRowValidation('features', resolver)
  const rows = [0, 1].map((index) => ({ item: { issueCount: getRowIssueCount(index) } }))
  return <div data-testid="rows-with-issues">{countMasterDetailRowsWithIssues(rows)}</div>
}

function ClassFeaturesSubmitButton({ onAttempt }: { onAttempt: () => void }) {
  const { trigger } = useFormContext()

  return (
    <button
      type="button"
      onClick={() => {
        onAttempt()
        void trigger()
      }}
    >
      Save features
    </button>
  )
}

type FeatureRowDefault = {
  kind?: 'custom' | 'spellcasting' | 'subclass-choice'
  name: string
  level: number
  grants: never[]
  intro?: string
}

function MountedClassFeaturesHarness({
  ProducerBoundary,
  defaultValues,
  formCtx = ctx,
}: {
  ProducerBoundary: ComponentType<{ children: ReactNode }>
  defaultValues: { features: FeatureRowDefault[] }
  formCtx?: typeof ctx
}) {
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)
  const form = useForm({
    defaultValues,
    resolver: makeResolver(classFeaturesSchema, [classFeatureResolverField]),
    mode: 'onSubmit',
  })

  return (
    <MemoryRouter>
      <FormProvider {...form}>
        <FormUiProvider
          fields={[classFeatureResolverField]}
          hasAttemptedSubmit={attemptedSubmit}
          onMarkSubmitAttempted={() => setAttemptedSubmit(true)}
        >
          <ProducerBoundary>
            <ClassFeaturesTab formCtx={formCtx} />
            <RowIssueCountProbe resolver={classFeatureItemFields(ctx)} />
            <FeatureRowIssueSummary resolver={classFeatureItemFields(ctx)} />
            <ClassFeaturesSubmitButton onAttempt={() => setAttemptedSubmit(true)} />
          </ProducerBoundary>
        </FormUiProvider>
      </FormProvider>
    </MemoryRouter>
  )
}

function liveProducerBoundary(resolverFields: FormItem[]) {
  return function ProducerBoundary({ children }: { children: ReactNode }) {
    const [session, setSession] = useState(() => createEmptyFormValidationProducerSession())
    const stampRef = useRef(1)
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

describe('class feature master-detail validation pilot', () => {
  it('compiles empty feature variant topology without throwing on missing row kind', () => {
    const topology = buildClassFeatureRowVariantTopology(ctx)
    const variantFields = collectRowVariantTopologyFields(topology)
    expect(() => compileFormOwnership(variantFields, {})).not.toThrow()
    const compiled = compileFormOwnership(variantFields, {})
    expect(compiled.paths.has('name')).toBe(true)
    expect(compiled.paths.has('intro')).toBe(true)
  })

  it('routes embedded feature row issues to the Features header-only tab', () => {
    const tabs = buildClassTabs(ctx)
    const resolverFields = collectTabbedFormResolverItems(tabs)
    const tabStates = resolveTabValidationState(
      [
        {
          path: 'features.0.name',
          message: 'Name is required.',
          severity: 'field',
        },
      ],
      tabs,
      resolverFields,
    )

    expect(tabStates.find((state) => state.tabId === 'features')?.count).toBe(1)
  })

  it('surfaces missing name on the row after submit through the interactive producer', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    const ProducerBoundary = liveProducerBoundary([featureArrayField])

    render(
      <Form
        schema={schema}
        fields={[featureArrayField]}
        producerBoundary={ProducerBoundary}
        defaultValues={{
          features: [
            {
              name: '',
              level: 1,
              grants: [],
            },
          ],
        }}
        onSubmit={onSubmit}
        footer={
          <>
            <RowIssueCountProbe />
            <button type="submit">Save</button>
          </>
        }
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('row-issue-count').textContent)).toBeGreaterThan(0)
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('mounts ClassFeaturesTab and badges the custom feature row after submit', async () => {
    const user = userEvent.setup()
    const ProducerBoundary = liveProducerBoundary([classFeatureResolverField])

    render(
      <MountedClassFeaturesHarness
        ProducerBoundary={ProducerBoundary}
        defaultValues={{
          features: [
            {
              kind: 'custom',
              name: '',
              level: 1,
              grants: [],
            },
          ],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save features' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('row-issue-count').textContent)).toBeGreaterThan(0)
    })
    expect(
      within(screen.getByRole('navigation', { name: 'Features' })).getByRole('button', {
        name: /Unnamed Feature/i,
      }),
    ).toBeInTheDocument()
  })

  it('badges invalid rows when no feature row is selected at submit', async () => {
    const user = userEvent.setup()
    const ProducerBoundary = liveProducerBoundary([classFeatureResolverField])

    render(
      <MountedClassFeaturesHarness
        ProducerBoundary={ProducerBoundary}
        defaultValues={{
          features: [
            {
              kind: 'custom',
              name: '',
              level: 1,
              grants: [],
            },
            {
              kind: 'custom',
              name: '',
              level: 2,
              grants: [],
            },
          ],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save features' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('rows-with-issues').textContent)).toBe(2)
    })
  })

  it('mounts spellcasting row and keeps intro in the variant field set after submit', async () => {
    const user = userEvent.setup()
    const ProducerBoundary = liveProducerBoundary([classFeatureResolverField])

    render(
      <MountedClassFeaturesHarness
        ProducerBoundary={ProducerBoundary}
        defaultValues={{
          features: [
            {
              kind: 'spellcasting',
              name: '',
              level: 1,
              grants: [],
              intro: '',
            },
          ],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save features' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('row-issue-count').textContent)).toBeGreaterThan(0)
    })
    expect(screen.getByLabelText('Introduction')).toBeInTheDocument()
  })

  it('surfaces subclass-choice availability and row validation together after submit', async () => {
    const user = userEvent.setup()
    const ProducerBoundary = liveProducerBoundary([classFeatureResolverField])
    const disabledCtx = makeContentFormCtx({ campaignRules: { subclassing: { enabled: false } } })

    render(
      <MountedClassFeaturesHarness
        ProducerBoundary={ProducerBoundary}
        formCtx={disabledCtx}
        defaultValues={{
          features: [
            {
              kind: 'subclass-choice',
              name: '',
              level: 3,
              grants: [],
            },
          ],
        }}
      />,
    )

    expect(screen.getByText(/Subclass choices are disabled/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Save features' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('row-issue-count').textContent)).toBeGreaterThan(0)
    })
  })

  it('surfaces validation for a row with omitted kind without throwing', async () => {
    const user = userEvent.setup()
    const ProducerBoundary = liveProducerBoundary([classFeatureResolverField])

    render(
      <MountedClassFeaturesHarness
        ProducerBoundary={ProducerBoundary}
        defaultValues={{
          features: [
            {
              name: '',
              level: 1,
              grants: [],
            },
          ],
        }}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save features' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('row-issue-count').textContent)).toBeGreaterThan(0)
    })
  })

  it('badges multiple invalid feature rows in the list summary after submit', async () => {
    const user = userEvent.setup()
    const ProducerBoundary = liveProducerBoundary([classFeatureResolverField])

    render(
      <MountedClassFeaturesHarness
        ProducerBoundary={ProducerBoundary}
        defaultValues={{
          features: [
            {
              kind: 'custom',
              name: '',
              level: 1,
              grants: [],
            },
            {
              kind: 'custom',
              name: '',
              level: 2,
              grants: [],
            },
          ],
        }}
      />,
    )

    const list = within(screen.getByRole('navigation', { name: 'Features' }))
    await user.click(list.getByRole('button', { name: /Level 2/i }))
    await user.click(list.getByRole('button', { name: /Level 1/i }))

    await user.click(screen.getByRole('button', { name: 'Save features' }))

    await waitFor(() => {
      expect(Number(screen.getByTestId('rows-with-issues').textContent)).toBe(2)
    })
  })
})
