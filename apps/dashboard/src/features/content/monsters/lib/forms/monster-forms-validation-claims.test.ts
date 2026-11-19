import { monsterFormsSchema } from '@rpg/contracts'
import { collectTabbedFormResolverItems } from '@rpg/ui/form'
import {
  assertRegistryCoverage,
  collectIssueClaimReport,
  expectIssuesClaimedByControls,
} from '@rpg/ui/form/test-utils'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { buildMonsterTabs } from '../monster-form-fields'
import {
  monsterClaimCtx,
  monsterClaimFields,
  monsterClaimSchema,
  monsterClaimValues,
} from '../actions/validation/monster-action-claim-fixtures'

const validAction = {
  id: 'action',
  kind: 'special',
  name: 'Roar',
  description: '<p>The creature roars.</p>',
}

const baseValues = {
  ...monsterClaimValues(validAction, 'created'),
  actions: [],
}

function report(forms: unknown) {
  return collectIssueClaimReport({
    schema: monsterClaimSchema,
    values: { ...baseValues, forms },
    fields: monsterClaimFields,
  })
}

describe('monster forms validation claims', () => {
  it('registers the published forms schema and routes forms issues to Creature Details', () => {
    const fields = collectTabbedFormResolverItems(buildMonsterTabs(monsterClaimCtx))
    assertRegistryCoverage(z.strictObject({ forms: monsterFormsSchema }), fields, {
      exemptPaths: [/^forms\.profileFormId$/, /^forms\.definedForms\.\*\.id$/],
    })

    const tab = buildMonsterTabs(monsterClaimCtx).find(
      (candidate) => candidate.id === 'creatureDetails',
    )
    expect(tab).toMatchObject({ label: 'Creature Details', errorPaths: ['forms'] })
  })

  it.each([
    {
      name: 'missing defined name',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'profile' },
        definedForms: [{ id: 'bear' }],
      },
      expected: [{ path: 'forms.definedForms.0.name', targetRole: 'control' }],
    },
    {
      name: 'duplicate and profile-colliding names',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'profile', name: 'Bear' },
        definedForms: [
          { id: 'bear', name: 'Bear' },
          { id: 'other', name: 'Bear' },
        ],
      },
      expected: [
        { path: 'forms.trueForm.name', targetRole: 'slotOwner' },
        { path: 'forms.definedForms.0.name', targetRole: 'control' },
        { path: 'forms.definedForms.1.name', targetRole: 'control' },
      ],
    },
    {
      name: 'unresolved true form',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'missing' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      },
      expected: [{ path: 'forms.trueForm.formId', targetRole: 'control' }],
    },
    {
      name: 'no alternate destination',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'bear' },
        definedForms: [{ id: 'bear', name: 'Bear' }],
      },
      expected: [{ path: 'forms.definedForms', targetRole: 'array' }],
    },
    {
      name: 'true-form overrides',
      forms: {
        profileFormId: 'profile',
        trueForm: { kind: 'defined', formId: 'bear' },
        definedForms: [
          { id: 'bear', name: 'Bear', overrides: { sizes: ['large'] } },
          { id: 'wolf', name: 'Wolf' },
        ],
      },
      expected: [{ path: 'forms.trueForm.formId', targetRole: 'control' }],
    },
  ])('claims published $name issues with real controls or slots', ({ forms, expected }) => {
    const claims = report(forms)
    expectIssuesClaimedByControls(claims)
    expect(claims).toEqual(
      expect.arrayContaining(expected.map((entry) => expect.objectContaining(entry))),
    )
  })
})
