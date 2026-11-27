import { flattenFields, resolveFieldConfigPrimaryName } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import {
  TRAIT_DERIVED_DISPLAY_DESCRIPTION,
  TRAIT_OVERRIDE_DISPLAY_LABEL,
} from './species-trait-form-labels'
import { traitRowDraftFormSchema, traitRowFormSchema } from './species-trait-form-schema'
import {
  heritageOptionItemFields,
  traitItemFields,
  traitRowVariantTopologyFields,
} from './species-trait-form-fields'

function userFacingKindSelects(fields: ReturnType<typeof flattenFields>) {
  return fields.filter(
    (field) => resolveFieldConfigPrimaryName(field) === 'kind' && field.type === 'select',
  )
}

describe('species trait field configuration', () => {
  it('does not expose kind as a user-facing select on traits or heritage options', () => {
    expect(userFacingKindSelects(flattenFields(traitItemFields({})))).toEqual([])
    expect(userFacingKindSelects(flattenFields(heritageOptionItemFields({})))).toEqual([])
  })

  it('explains generated display on grant traits without a kind selector', () => {
    const fields = traitItemFields({})
    const derivedGroup = fields.find(
      (field) =>
        'kind' in field &&
        field.kind === 'group' &&
        field.heading?.hint === TRAIT_DERIVED_DISPLAY_DESCRIPTION,
    )
    expect(derivedGroup).toBeDefined()
    expect(JSON.stringify(fields)).toContain(TRAIT_OVERRIDE_DISPLAY_LABEL)
    expect(JSON.stringify(fields)).not.toContain('Trait kind')
  })

  it('omits a body name field for custom traits', () => {
    const names = flattenFields(traitItemFields({} as Parameters<typeof traitItemFields>[0]))
      .filter((field) => field.type === 'text')
      .map((field) => resolveFieldConfigPrimaryName(field))
    expect(names).not.toContain('name')
  })

  it('registers name on the custom branch and nameOverride on grant/template topology', () => {
    const ctx = {} as Parameters<typeof traitItemFields>[0]
    const topology = traitRowVariantTopologyFields(ctx)
    const names = flattenFields(topology)
      .filter((field) => field.type === 'text')
      .map((field) => resolveFieldConfigPrimaryName(field))
    expect(names).toContain('name')
    expect(names).toContain('nameOverride')
    expect(JSON.stringify(topology)).toContain('config.uses.normal')
  })

  it('omits grant name override from the mounted body field list', () => {
    const serialized = JSON.stringify(traitItemFields({} as Parameters<typeof traitItemFields>[0]))
    expect(serialized).not.toContain('"nameOverride"')
  })

  it('documents name as an inline-title domain exclusion on the mounted trait body', () => {
    const bodyNames = flattenFields(
      traitItemFields({} as Parameters<typeof traitItemFields>[0]),
    ).map((field) => resolveFieldConfigPrimaryName(field))
    expect(bodyNames).not.toContain('name')
    const topologyNames = flattenFields(
      traitRowVariantTopologyFields({} as Parameters<typeof traitItemFields>[0]),
    ).map((field) => resolveFieldConfigPrimaryName(field))
    expect(topologyNames).toContain('name')
  })

  it('defaults omitted kind to custom on the draft schema', () => {
    const parsed = traitRowDraftFormSchema.parse({
      name: 'Keen Senses',
      grants: [],
    })
    expect(parsed.kind).toBe('custom')
  })

  it('surfaces incomplete grant rows on grant field paths instead of the grants container', () => {
    const result = traitRowFormSchema.safeParse({
      kind: 'grant',
      overrideDisplay: false,
      grants: [{ grantType: 'senses', senseRange: 60 }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'grants.0.senseType'),
      ).toBe(true)
      expect(result.error.issues.some((issue) => issue.path.join('.') === 'grants')).toBe(false)
    }
  })

  it('surfaces empty resistance grants on the resistances field path', () => {
    const result = traitRowFormSchema.safeParse({
      kind: 'grant',
      overrideDisplay: false,
      grants: [{ grantType: 'resistances', resistances: [] }],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path.join('.') === 'grants.0.resistances'),
      ).toBe(true)
    }
  })
})
