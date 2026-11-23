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
        grantGroups: [
          { grants: [{ id: 'sense-1', kind: 'sense', type: 'darkvision', range: 60 }] },
        ],
      }).kind,
    ).toBe('grant')
  })

  it('preserves grant kind after editing grant fields', () => {
    const row = traitToFormRow({
      kind: 'grant',
      id: 'darkvision',
      grantGroups: [{ grants: [{ id: 'sense-2', kind: 'sense', type: 'darkvision', range: 60 }] }],
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

describe('template trait form round-trip', () => {
  it('round-trips sense template range through configSchema', () => {
    const hydrated = traitToFormRow({
      kind: 'template',
      id: 'darkvision',
      templateId: 'sense-darkvision',
      config: { range: 120 },
    })
    expect(hydrated.config?.range).toBe(120)

    const saved = traitsFromFormValues([{ ...hydrated, id: 'darkvision' }])
    expect(saved[0]).toMatchObject({
      kind: 'template',
      templateId: 'sense-darkvision',
      config: { range: 120 },
    })
  })

  it('does not coerce a missing range to 60 on save', () => {
    const row = traitToFormRow({
      kind: 'template',
      id: 'darkvision',
      templateId: 'sense-darkvision',
    })
    const saved = traitsFromFormValues([{ ...row, id: 'darkvision' }])
    expect(saved[0]?.kind === 'template' && saved[0].config).toBeUndefined()
  })

  it('round-trips legendary resistance uses object', () => {
    const hydrated = traitToFormRow({
      kind: 'template',
      id: 'legendary-resistance',
      templateId: 'legendary-resistance',
      config: { uses: { normal: 3 } },
    })

    const saved = traitsFromFormValues([{ ...hydrated, id: 'legendary-resistance' }])
    expect(saved[0]).toMatchObject({
      kind: 'template',
      templateId: 'legendary-resistance',
      config: { uses: { normal: 3 } },
    })
  })
})
