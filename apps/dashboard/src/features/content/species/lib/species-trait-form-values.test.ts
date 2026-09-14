import { describe, expect, it } from 'vitest'

import {
  createTraitRowDefaultValues,
  traitToFormRow,
  traitsFromFormValues,
} from './species-trait-form-values'

describe('createTraitRowDefaultValues', () => {
  it('seeds a complete custom row', () => {
    expect(createTraitRowDefaultValues()).toMatchObject({
      kind: 'custom',
      overrideDisplay: false,
      name: '',
      description: '',
      grants: [],
    })
  })
})

describe('trait form row hydration', () => {
  it('always supplies kind for custom and grant traits', () => {
    expect(
      traitToFormRow({
        kind: 'custom',
        id: 'keen-senses',
        name: 'Keen Senses',
      }).kind,
    ).toBe('custom')

    expect(
      traitToFormRow({
        kind: 'grant',
        id: 'darkvision',
        grantGroups: [{ grants: [{ kind: 'sense', type: 'darkvision', range: 60 }] }],
      }).kind,
    ).toBe('grant')
  })

  it('preserves grant kind after editing grant fields', () => {
    const row = traitToFormRow({
      kind: 'grant',
      id: 'darkvision',
      grantGroups: [{ grants: [{ kind: 'sense', type: 'darkvision', range: 60 }] }],
    })
    const senseRow = row.grants.find((grant) => grant.grantType === 'senses')
    expect(senseRow).toBeDefined()
    senseRow!.senseRange = 120

    const saved = traitsFromFormValues([row])
    expect(saved[0]?.kind).toBe('grant')
    expect(
      saved[0]?.kind === 'grant' &&
        saved[0].grantGroups[0]?.grants.some(
          (grant) => grant.kind === 'sense' && grant.type === 'darkvision' && grant.range === 120,
        ),
    ).toBe(true)
  })
})
