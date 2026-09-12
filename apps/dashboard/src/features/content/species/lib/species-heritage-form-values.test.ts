import { describe, expect, it } from 'vitest'
import type { GrantContentTrait, SpeciesHeritage } from '@rpg/contracts'

import { heritageDraftFormSchema, heritageFormSchema } from './species-heritage-form-fields'
import {
  heritageDefaultValues,
  heritageFromFormRow,
  heritageGrantOptionToCustomFormRow,
  heritageOptionToFormRow,
  heritageToFormRow,
} from './species-heritage-form-values'

const grantDarkvision: GrantContentTrait = {
  kind: 'grant',
  id: 'darkvision',
  grantGroups: [{ grants: [{ kind: 'sense', type: 'darkvision', range: 60 }] }],
}

describe('heritage option form contract', () => {
  it('publish and draft schemas reject grant-kind options', () => {
    const grantOption = { kind: 'grant', overrideDisplay: false, grants: [] }

    expect(
      heritageFormSchema.safeParse({
        name: 'Lineage',
        choose: 1,
        options: [grantOption],
      }).success,
    ).toBe(false)

    expect(
      heritageDraftFormSchema.safeParse({
        name: 'Lineage',
        choose: 1,
        options: [grantOption],
      }).success,
    ).toBe(false)
  })

  it('publish schema defaults omitted option kind to custom', () => {
    const parsed = heritageFormSchema.parse({
      name: 'Lineage',
      choose: 1,
      options: [{ name: 'Black (Acid)', grants: [] }],
    })
    expect(parsed.options[0]?.kind).toBe('custom')
  })

  it('converts unexpected grant heritage options into authored custom rows', () => {
    const row = heritageGrantOptionToCustomFormRow(grantDarkvision)
    expect(row.kind).toBe('custom')
    expect(row.name).toBe('Darkvision')
    expect(row.description).toMatch(/60/)
  })

  it('hydrates grant heritage options as custom and saves them as custom', () => {
    const heritage: SpeciesHeritage = {
      id: 'lineage',
      name: 'Lineage',
      choose: 1,
      options: [grantDarkvision],
    }

    const formRow = heritageToFormRow(heritage)
    expect(formRow.options[0]?.kind).toBe('custom')
    expect(formRow.options[0]?.name).toBe('Darkvision')

    const saved = heritageFromFormRow({ ...formRow, id: 'lineage' }, heritage)
    expect(saved.options[0]?.kind).toBe('custom')
    expect(saved.options[0]?.kind === 'custom' && saved.options[0].name).toBe('Darkvision')
  })

  it('hydration of custom options stays custom', () => {
    expect(
      heritageOptionToFormRow({
        kind: 'custom',
        id: 'black',
        name: 'Black (Acid)',
      }).kind,
    ).toBe('custom')
  })

  it('setup defaults seed a custom option', () => {
    expect(heritageDefaultValues({}).options[0]?.kind).toBe('custom')
  })
})
