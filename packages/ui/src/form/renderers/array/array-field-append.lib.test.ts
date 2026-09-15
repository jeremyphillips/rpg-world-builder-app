import { describe, expect, it } from 'vitest'

import type { ArrayConfig, FormItem } from '../../field-config'
import {
  assertAppendPayload,
  buildArrayAddMenuExpandKeys,
  buildVisibleItemDefaults,
  mergeArrayAddMenuDefaults,
  resolveArrayAppendDefaults,
} from './array-field-append.lib'

const grantLikeFields: FormItem[] = [
  {
    type: 'select',
    name: 'language',
    label: 'Language',
    options: [],
    visibility: {
      dependsOn: ['grantType'],
      visibleWhen: (values) => values.grantType === 'languages',
    },
  },
  {
    type: 'select',
    name: 'senseType',
    label: 'Sense type',
    options: [],
    visibility: {
      dependsOn: ['grantType'],
      visibleWhen: (values) => values.grantType === 'senses',
    },
  },
  {
    kind: 'group',
    visibility: {
      dependsOn: ['grantType'],
      visibleWhen: (values) => values.grantType === 'weaponProficiency',
    },
    fields: [
      {
        type: 'select',
        name: 'proficiencySource',
        label: 'Source',
        options: [],
      },
      {
        type: 'combobox',
        name: 'weaponProficiencySlugs',
        label: 'Weapons',
        multiple: true,
        options: [],
        visibility: {
          dependsOn: ['proficiencySource'],
          visibleWhen: (values) => values.proficiencySource === 'specific',
        },
      },
    ],
  },
]

describe('array-field-append.lib', () => {
  it('resolves appendDefaults when configured', () => {
    const config = {
      kind: 'array',
      name: 'items',
      legend: 'Items',
      fields: [],
      appendDefaults: () => ({ kind: 'custom' }),
    } satisfies ArrayConfig

    expect(resolveArrayAppendDefaults(config, { kind: 'default' }, [])).toEqual({ kind: 'custom' })
    expect(resolveArrayAppendDefaults(config, { kind: 'default' }, [{ kind: 'existing' }])).toEqual(
      {
        kind: 'custom',
      },
    )
  })

  it('falls back to static defaults when appendDefaults is omitted', () => {
    const config = {
      kind: 'array',
      name: 'items',
      legend: 'Items',
      fields: [],
    } satisfies ArrayConfig
    expect(resolveArrayAppendDefaults(config, { kind: 'default' }, [])).toEqual({ kind: 'default' })
  })

  it('merges add-menu defaults over static item defaults', () => {
    expect(
      mergeArrayAddMenuDefaults(
        {
          id: 'movement-bonus',
          label: 'Movement bonus',
          appendDefaults: () => ({ grantType: 'movement', movementMode: 'walk' }),
        },
        { grantType: 'languages', unlockLevel: 1 },
        grantLikeFields,
      ),
    ).toEqual({
      grantType: 'movement',
      movementMode: 'walk',
      unlockLevel: 1,
    })
  })

  it('prunes hidden enum defaults for weapon proficiency rows', () => {
    const merged = mergeArrayAddMenuDefaults(
      {
        id: 'weapon-specific',
        label: 'Weapon proficiency',
        appendDefaults: () => ({
          grantType: 'weaponProficiency',
          proficiencySource: 'specific',
        }),
      },
      {
        grantType: '',
        language: '',
        senseType: '',
        spellAbility: '',
        weaponProficiencySlugs: [],
      },
      grantLikeFields,
    )

    expect(merged).toMatchObject({
      grantType: 'weaponProficiency',
      proficiencySource: 'specific',
      weaponProficiencySlugs: [],
    })
    expect(merged).not.toHaveProperty('language')
    expect(merged).not.toHaveProperty('senseType')
  })

  it('buildVisibleItemDefaults preserves explicit discriminator keys', () => {
    expect(
      buildVisibleItemDefaults(
        grantLikeFields,
        {
          grantType: 'weaponProficiency',
          proficiencySource: 'specific',
          language: '',
        },
        { preserveKeys: ['grantType', 'proficiencySource'] },
      ),
    ).toEqual({
      grantType: 'weaponProficiency',
      proficiencySource: 'specific',
    })
  })

  it('rejects non-object append payloads', () => {
    expect(() => assertAppendPayload(null)).toThrow(/plain object/)
    expect(() => assertAppendPayload(new Event('click'))).toThrow(/plain object/)
  })

  it('builds validation session expand keys for a new row', () => {
    expect(buildArrayAddMenuExpandKeys('grants', 2, { id: 'row-2' }, 'id')).toEqual([
      'grants:row-2',
    ])
  })
})
