/**
 * @vitest-environment jsdom
 */
import { useCallback, useRef, useState, type ReactNode } from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import type { ZodType } from 'zod'
import {
  TabbedForm,
  collectTabbedFormResolverItems,
  FormUiProvider,
  FormValidationInteractiveProducerBridge,
  FormValidationProducerProvider,
  type FormIssue,
  type FormValidationProducerSlot,
  makeResolver,
  prepareFormIssues,
  replaceFormValidationProducerSlot,
  createEmptyFormValidationProducerSession,
  projectFormValidationProducerIssues,
  resolveTabValidationState,
} from '@rpg/ui/form'
import { getMonsterBySlug } from '@rpg/catalog/monsters'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import {
  MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_BASE_HINT,
  MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_SPIDER_CLIMB_HINT,
  MOVEMENT_ALTERNATIVE_MODES_FIELD,
  movementAlternativeGroupField,
  movementValidationMessages,
  movementWithHoverGroup,
} from '../../../lib/forms/fields/content-movement-form-fields'
import { formatFieldMessage } from '@rpg/contracts'
import { evaluateContentPublishValidation } from '../../../lib/forms/validation/content-publish-validation.lib'
import { ingestContentFormValidationIssues } from '../../../lib/forms/validation/ingest-content-form-validation.lib'
import { monsterFormDef } from '../monster-form-def'
import { buildMonsterTabs } from '../monster-form-fields'
import { MONSTER_FORM_TAB, resolveMonsterFormViewForPath } from '../monster-form-view'
import { resolveMonsterFormSchema } from '../monster-form-schema'
import {
  buildMonsterInput,
  monsterToFormValues,
  resolveMonsterCreateDefaultValues,
  type MonsterFormValues,
} from '../monster-form-values'

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

const ctx = makeContentFormCtx({
  equipmentCatalogStatus: 'ready',
  skillCatalogStatus: 'ready',
  spellCatalogStatus: 'ready',
})

function swarmFormValues(): MonsterFormValues {
  const swarm = getMonsterBySlug('srd-cc-5.2.1', 'swarm-of-insects')
  expect(swarm).toBeDefined()
  return monsterToFormValues(swarm!, { armorClassRules: ctx.armorClassRules })
}

function publishFields() {
  const tabs = augmentTabsWithHoistedName(buildMonsterTabs(ctx), monsterFormDef.nameField(ctx))
  return collectTabbedFormResolverItems(tabs)
}

describe('monster movement alternative validation', () => {
  it('buildMonsterInput accepts tombstone null when removing a persisted alternative', () => {
    const swarm = getMonsterBySlug('srd-cc-5.2.1', 'swarm-of-insects')!
    const values = swarmFormValues()
    values.movementAlternative = undefined

    expect(() =>
      buildMonsterInput(values, { entity: swarm, armorClassRules: ctx.armorClassRules }, 'draft'),
    ).not.toThrow()
    const input = buildMonsterInput(
      values,
      { entity: swarm, armorClassRules: ctx.armorClassRules },
      'draft',
    )
    expect(input.movementAlternative).toBeNull()
    expect(JSON.stringify(input)).not.toMatch(/Invalid input/i)
  })

  it('keeps seeded traits on a movement-only save and omits a missing traits key', () => {
    const swarm = getMonsterBySlug('srd-cc-5.2.1', 'swarm-of-insects')!
    const values = swarmFormValues()
    values.movement = [{ mode: 'walk', feet: 25 }]
    const input = buildMonsterInput(
      values,
      { entity: swarm, armorClassRules: ctx.armorClassRules },
      'draft',
    )
    expect(input.traits?.map((trait) => trait.id)).toEqual(['swarm', 'spider-climb'])
    expect(input.actions).toEqual([])

    const missing = swarmFormValues()
    delete (missing as { traits?: unknown }).traits
    const omitted = buildMonsterInput(
      missing,
      { entity: swarm, armorClassRules: ctx.armorClassRules },
      'draft',
    )
    expect(omitted).not.toHaveProperty('traits')
  })

  it('keeps the alternative object issue on the group and the modes issue on Available modes', () => {
    const fields = [movementAlternativeGroupField()]
    const parent = prepareFormIssues(
      [{ path: ['movementAlternative'], message: 'Alternative movement is incomplete.' }],
      fields,
      { movementAlternative: { modes: ['fly'], feet: 20 } },
    )
    expect(parent[0]).toMatchObject({
      claim: { kind: 'field', target: 'movementAlternative' },
    })
    expect(parent[0]?.claim?.target).not.toBe(MOVEMENT_ALTERNATIVE_MODES_FIELD)

    const modes = prepareFormIssues(
      [{ path: ['movementAlternative', 'modes'], message: 'Select at least two modes.' }],
      fields,
      { movementAlternative: { modes: ['fly'], feet: 20 } },
    )
    expect(modes[0]).toMatchObject({
      claim: { kind: 'field', target: MOVEMENT_ALTERNATIVE_MODES_FIELD },
    })
  })

  it('routes min-mode publish errors to Available modes', async () => {
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const fields = publishFields()
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Alt test'
    values.sizes = ['medium']
    values.creatureType = 'beast'
    values.alignment = 'u'
    values.challengeRating = '1/8'
    values.movement = [{ mode: 'walk', feet: 20 }]
    values.movementAlternative = { modes: ['fly'], feet: 20 }

    const issues = evaluateContentPublishValidation(publishSchema, values as never, fields)
    expect(issues).not.toBeNull()
    const routed = prepareFormIssues(
      issues!.map((issue) => ({ path: issue.path.split('.'), message: issue.message })),
      fields,
      values as Record<string, unknown>,
    )
    const modesIssue = routed.find(
      (issue) =>
        issue.claim?.target === MOVEMENT_ALTERNATIVE_MODES_FIELD ||
        issue.presentationPath === MOVEMENT_ALTERNATIVE_MODES_FIELD,
    )
    expect(modesIssue?.message).toBeTruthy()
    expect(modesIssue?.message).not.toMatch(/Invalid input/i)

    const resolver = makeResolver(publishSchema, fields)
    const result = await resolver(values as never, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    })
    const nested =
      (result.errors as Record<string, unknown>)[MOVEMENT_ALTERNATIVE_MODES_FIELD] ??
      (result.errors as { movementAlternative?: { modes?: { message?: string } } })
        ?.movementAlternative?.modes
    expect((nested as { message?: string })?.message).toBeTruthy()
  })

  it('assigns alternative validation to the statistics tab', () => {
    const tabs = augmentTabsWithHoistedName(buildMonsterTabs(ctx), monsterFormDef.nameField(ctx))
    const fields = collectTabbedFormResolverItems(tabs)
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Overlap test'
    values.sizes = ['medium']
    values.creatureType = 'beast'
    values.alignment = 'u'
    values.challengeRating = '1/8'
    values.movement = [
      { mode: 'walk', feet: 20 },
      { mode: 'climb', feet: 10 },
    ]
    values.movementAlternative = { modes: ['climb', 'fly'], feet: 20 }

    const issues = evaluateContentPublishValidation(publishSchema, values as never, fields)
    const routed = prepareFormIssues(
      issues!.map((issue) => ({ path: issue.path.split('.'), message: issue.message })),
      fields,
      values as Record<string, unknown>,
    )
    const tabStates = resolveTabValidationState(routed, tabs, fields)
    expect(
      tabStates.find((state) => state.tabId === MONSTER_FORM_TAB.statistics)?.count,
    ).toBeGreaterThan(0)
    expect(resolveMonsterFormViewForPath(MOVEMENT_ALTERNATIVE_MODES_FIELD)).toBe(
      MONSTER_FORM_TAB.statistics,
    )
  })

  it('rejects publish when alternative movement is open with no modes selected', () => {
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const fields = publishFields()
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'Empty alt'
    values.sizes = ['medium']
    values.creatureType = 'beast'
    values.alignment = 'u'
    values.challengeRating = '1/8'
    values.movement = [{ mode: 'walk', feet: 20 }]
    values.movementAlternative = { modes: [], feet: undefined }

    const issues = evaluateContentPublishValidation(publishSchema, values as never, fields)
    expect(issues?.some((issue) => issue.path === MOVEMENT_ALTERNATIVE_MODES_FIELD)).toBe(true)
  })

  it('does not publish-validate cleared unsaved alternative as a field error', () => {
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const fields = publishFields()
    const values = resolveMonsterCreateDefaultValues()
    values.name = 'No alt'
    values.sizes = ['medium']
    values.creatureType = 'beast'
    values.alignment = 'u'
    values.challengeRating = '1/8'
    values.movement = [{ mode: 'walk', feet: 20 }]
    values.movementAlternative = undefined

    const issues = evaluateContentPublishValidation(publishSchema, values as never, fields)
    const modesIssue = issues?.find((issue) => issue.path === MOVEMENT_ALTERNATIVE_MODES_FIELD)
    expect(modesIssue).toBeUndefined()
  })

  it('does not publish-validate swarm edit after removing alternative', () => {
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const fields = publishFields()
    const values = swarmFormValues()
    values.movementAlternative = undefined

    const issues = evaluateContentPublishValidation(publishSchema, values as never, fields)
    expect(issues).toBeNull()
  })
})

function collapsedMovementAlternativeField() {
  const base = movementAlternativeGroupField()
  return {
    ...base,
    optionalDisclosure: {
      ...base.optionalDisclosure!,
      expandWhenPopulated: false,
    },
  } as typeof base
}

describe('movement alternative optional disclosure', () => {
  it('keeps a collapsed-but-applicable modes issue in producer projection', () => {
    const fields = [movementAlternativeGroupField()]
    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      {
        path: 'movementAlternative.modes',
        message: 'Select at least two modes.',
        severity: 'field',
        claim: { kind: 'field', target: 'movementAlternative.modes' },
      },
    ])
    const projected = projectFormValidationProducerIssues(session, 1, fields, {
      movementAlternative: { modes: ['fly'], feet: 20 },
    })
    expect(projected.some((issue) => issue.claim?.target === 'movementAlternative.modes')).toBe(
      true,
    )
  })
  it('renders Available modes when swarm loads with alternative movement', async () => {
    const defaultValues = swarmFormValues()
    const tabs = [
      {
        id: MONSTER_FORM_TAB.statistics,
        label: 'Statistics',
        fields: [movementWithHoverGroup({ includeMovementAlternative: true })],
      },
    ]

    render(
      <TabbedForm
        id="monster-movement-alt"
        schema={resolveMonsterFormSchema(ctx, 'draft') as ZodType<MonsterFormValues>}
        tabs={tabs}
        defaultValues={defaultValues}
        onSubmit={() => {}}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Available modes')).toBeInTheDocument()
      expect(
        screen.getByText(
          `${MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_BASE_HINT} ${MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_SPIDER_CLIMB_HINT}`,
        ),
      ).toBeInTheDocument()
    })

    const modesParticipant = screen
      .getByText('Available modes')
      .closest('[data-field-row-participant]')
    expect(modesParticipant).toHaveAttribute('data-field-width', 'auto')
    expect(modesParticipant?.querySelector('[data-field-intrinsic-sizing]')).toBeTruthy()
    expect(modesParticipant?.querySelector('[data-field-intrinsic-spill]')).toBeTruthy()
    const hintNode = modesParticipant?.querySelector('[id$="-hint"]')
    expect(hintNode?.textContent).toContain(MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_BASE_HINT)
  })

  it('retains a collapsed optional-disclosure issue until expand or submit', async () => {
    const user = userEvent.setup()
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const movementField = collapsedMovementAlternativeField()
    const tabs = [
      {
        id: MONSTER_FORM_TAB.statistics,
        label: 'Statistics',
        fields: [movementField],
      },
    ]
    const defaultValues = resolveMonsterCreateDefaultValues()
    defaultValues.name = 'Collapsed alt'
    defaultValues.sizes = ['medium']
    defaultValues.creatureType = 'beast'
    defaultValues.alignment = 'u'
    defaultValues.challengeRating = '1/8'
    defaultValues.movement = [{ mode: 'walk', feet: 20 }]
    defaultValues.movementAlternative = { modes: ['fly'], feet: 20 }

    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      {
        path: MOVEMENT_ALTERNATIVE_MODES_FIELD,
        message: 'Choose at least 2 available modes.',
        severity: 'field',
        claim: { kind: 'field', target: MOVEMENT_ALTERNATIVE_MODES_FIELD },
      },
    ])

    function ProducerBoundary({ children }: { children: ReactNode }) {
      return (
        <FormValidationProducerProvider session={session} stamp={1}>
          {children}
        </FormValidationProducerProvider>
      )
    }

    render(
      <TabbedForm
        id="monster-movement-collapsed"
        schema={publishSchema}
        tabs={tabs}
        defaultValues={defaultValues}
        producerBoundary={ProducerBoundary}
        validationPresentation="progressive"
        onSubmit={() => {}}
        footer={<button type="submit">Publish</button>}
      />,
    )

    expect(screen.getByRole('button', { name: 'Add alternative movement' })).toBeInTheDocument()
    expect(screen.queryByText('Choose at least 2 available modes.')).not.toBeInTheDocument()
    expect(screen.queryByText('Available modes')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Statistics.*1 field needs attention/i }),
      ).toBeInTheDocument()
      expect(screen.getByText('Choose at least 2 available modes.')).toBeInTheDocument()
    })
  })

  it('shows two distinct modes reasons on the mounted producer after publish', async () => {
    const user = userEvent.setup()
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const movementField = movementAlternativeGroupField()
    const statisticsTab = {
      id: MONSTER_FORM_TAB.statistics,
      label: 'Statistics',
      fields: [movementField],
    }
    const resolverFields = collectTabbedFormResolverItems([statisticsTab])
    const defaultValues = resolveMonsterCreateDefaultValues()
    defaultValues.name = 'Overlap modes'
    defaultValues.sizes = ['medium']
    defaultValues.creatureType = 'beast'
    defaultValues.alignment = 'u'
    defaultValues.challengeRating = '1/8'
    defaultValues.movement = [
      { mode: 'walk', feet: 20 },
      { mode: 'climb', feet: 10 },
    ]
    defaultValues.movementAlternative = { modes: ['climb'], feet: 20 }

    const publishIssues = evaluateContentPublishValidation(
      publishSchema,
      defaultValues as never,
      resolverFields,
    )
    expect(publishIssues).not.toBeNull()
    const routed = prepareFormIssues(
      publishIssues!.map((issue) => ({ path: issue.path.split('.'), message: issue.message })),
      resolverFields,
      defaultValues as Record<string, unknown>,
    )
    const modesIssues = routed.filter(
      (issue) =>
        issue.claim?.target === MOVEMENT_ALTERNATIVE_MODES_FIELD ||
        issue.path === MOVEMENT_ALTERNATIVE_MODES_FIELD,
    )
    expect(modesIssues).toHaveLength(2)

    function ProducerBoundary({ children }: { children: ReactNode }) {
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

    const minCopy = formatFieldMessage(movementValidationMessages.alternativeMinModes())
    const overlapCopy = formatFieldMessage(movementValidationMessages.alternativeOverlap())

    render(
      <FormUiProvider fields={resolverFields} publishPresentationEnabled>
        <TabbedForm
          id="monster-movement-dual-reasons"
          schema={publishSchema}
          tabs={[statisticsTab]}
          defaultValues={defaultValues}
          producerBoundary={ProducerBoundary}
          validationPresentation="progressive"
          publishPresentationEnabled
          onSubmit={() => {}}
          footer={<button type="submit">Publish</button>}
        />
      </FormUiProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(screen.getByText(minCopy, { exact: false })).toBeInTheDocument()
      expect(screen.getByText(overlapCopy, { exact: false })).toBeInTheDocument()
    })
  })

  it('badges statistics with adopted producer boundary and full tab resolver fields', async () => {
    const user = userEvent.setup()
    const publishSchema = resolveMonsterFormSchema(ctx, 'publish') as ZodType<MonsterFormValues>
    const movementField = collapsedMovementAlternativeField()
    const statisticsTab = {
      id: MONSTER_FORM_TAB.statistics,
      label: 'Statistics',
      fields: [movementField],
    }
    const resolverFields = collectTabbedFormResolverItems([statisticsTab])
    const defaultValues = resolveMonsterCreateDefaultValues()
    defaultValues.name = 'Collapsed adopted'
    defaultValues.sizes = ['medium']
    defaultValues.creatureType = 'beast'
    defaultValues.alignment = 'u'
    defaultValues.challengeRating = '1/8'
    defaultValues.movement = [{ mode: 'walk', feet: 20 }]
    defaultValues.movementAlternative = { modes: ['fly'], feet: 20 }

    let session = createEmptyFormValidationProducerSession()
    session = replaceFormValidationProducerSlot(session, 'publish-action', 1, [
      {
        path: MOVEMENT_ALTERNATIVE_MODES_FIELD,
        message: 'Choose at least 2 available modes.',
        severity: 'field',
        claim: { kind: 'field', target: MOVEMENT_ALTERNATIVE_MODES_FIELD },
      },
    ])

    function EditShellProducerBoundary({ children }: { children: ReactNode }) {
      return (
        <FormValidationProducerProvider session={session} stamp={1}>
          <FormValidationInteractiveProducerBridge fields={resolverFields} />
          {children}
        </FormValidationProducerProvider>
      )
    }

    render(
      <FormUiProvider fields={resolverFields} hasAttemptedPublish publishPresentationEnabled>
        <TabbedForm
          id="monster-movement-adopted-boundary"
          schema={publishSchema}
          tabs={[statisticsTab]}
          defaultValues={defaultValues}
          producerBoundary={EditShellProducerBoundary}
          validationPresentation="progressive"
          publishPresentationEnabled
          onSubmit={() => {}}
          footer={<button type="submit">Publish</button>}
        />
      </FormUiProvider>,
    )

    expect(screen.queryByText('Choose at least 2 available modes.')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Statistics.*1 field needs attention/i }),
      ).toBeInTheDocument()
    })
  })
})
