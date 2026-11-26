/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react'
import { beforeAll, describe, expect, it } from 'vitest'
import type { ZodType } from 'zod'
import {
  TabbedForm,
  collectTabbedFormResolverItems,
  makeResolver,
  prepareFormIssues,
  resolveTabValidationState,
} from '@rpg/ui/form'
import { getMonsterBySlug } from '@rpg/catalog/monsters'

import { makeContentFormCtx } from '../../../lib/fixtures/content-form-ctx'
import { augmentTabsWithHoistedName } from '../../../lib/forms/shells/layout/content-schema-form-tabs.lib'
import {
  MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_BASE_HINT,
  MOVEMENT_ALTERNATIVE_AVAILABLE_MODES_SPIDER_CLIMB_HINT,
  MOVEMENT_ALTERNATIVE_MODES_FIELD,
  movementWithHoverGroup,
} from '../../../lib/forms/fields/content-movement-form-fields'
import { evaluateContentPublishValidation } from '../../../lib/forms/validation/content-publish-validation.lib'
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

describe('movement alternative optional disclosure', () => {
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
})
