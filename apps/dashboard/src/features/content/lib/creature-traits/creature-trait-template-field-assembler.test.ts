import {
  CREATURE_TRAIT_TEMPLATE_IDS,
  getCreatureTraitTemplate,
  type CreatureTraitTemplateHost,
} from '@rpg/contracts'
import { resolveDependsOnWatchName, type FormItem } from '@rpg/ui/form'
import { describe, expect, it, vi } from 'vitest'

import * as legendaryFields from './legendary-resistance-trait-fields'
import { monsterTraitTemplateFields } from '../../monsters/lib/traits/monster-trait-form-fields'
import { senseRangeJoinedPairField } from '../forms/fields/content-sense-range-form-fields'
import {
  assembleCreatureTraitTemplateFields,
  validateTraitTemplateConfigFields,
} from './creature-trait-template-field-assembler'

const HOSTS = ['species', 'monster'] as const satisfies readonly CreatureTraitTemplateHost[]
const LEGENDARY_RESISTANCE = 'legendary-resistance'
const DARKVISION = 'sense-darkvision'
const NORMAL_USES = 'config.uses.normal'
const LAIR_USES = 'config.uses.inLair'

function fieldName(field: FormItem): string | undefined {
  return 'name' in field && typeof field.name === 'string' ? field.name : undefined
}

function listedFieldNames(fields: readonly FormItem[]): Array<string | undefined> {
  return fields.flatMap((field) => {
    if ('kind' in field && field.kind === 'group' && field.name === 'config.uses') {
      return field.fields.map(fieldName)
    }
    return [fieldName(field)]
  })
}

function findField(fields: readonly FormItem[], name: string): FormItem | undefined {
  for (const field of fields) {
    if (fieldName(field) === name) return field
    if ('kind' in field && field.kind === 'group') {
      const nested = findField(field.fields, name)
      if (nested) return nested
    }
  }
  return undefined
}

function numberField(name: string) {
  return { type: 'number', name, label: 'Fixture value' } as const
}

describe('assembleCreatureTraitTemplateFields', () => {
  it.each(CREATURE_TRAIT_TEMPLATE_IDS)('classifies every host for %s', (templateId) => {
    const template = getCreatureTraitTemplate(templateId)!
    for (const host of HOSTS) {
      const fields = assembleCreatureTraitTemplateFields({ templateId, host })
      if (!template.hosts.includes(host)) {
        expect(fields).toEqual([])
      } else {
        expect(fields.filter((field) => fieldName(field) === 'details')).toHaveLength(1)
      }
    }
  })

  it.each(HOSTS)('rejects an empty configurable contribution on %s', (host) => {
    using fields = vi
      .spyOn(legendaryFields, 'legendaryResistanceTemplateUseFields')
      .mockReturnValueOnce([] as never)

    expect(() =>
      assembleCreatureTraitTemplateFields({ templateId: LEGENDARY_RESISTANCE, host }),
    ).toThrow(`Configurable trait template ${LEGENDARY_RESISTANCE} has no fields on ${host}.`)
    expect(fields).toHaveBeenCalledOnce()
  })

  it('adds only Details for a fieldless template', () => {
    const fields = assembleCreatureTraitTemplateFields({
      templateId: 'magic-resistance',
      host: 'monster',
    })
    expect(fields.map(fieldName)).toEqual(['details'])
  })

  it('keeps legendary resistance use fields in order across both supported hosts', () => {
    const exampleConfig = { uses: { normal: 5, inLair: 7 } }
    expect(
      getCreatureTraitTemplate(LEGENDARY_RESISTANCE)?.configSchema.parse(exampleConfig),
    ).toEqual(exampleConfig)

    const species = assembleCreatureTraitTemplateFields({
      templateId: LEGENDARY_RESISTANCE,
      host: 'species',
    })
    expect(listedFieldNames(species)).toEqual([NORMAL_USES, LAIR_USES, 'details'])

    const monster = monsterTraitTemplateFields(LEGENDARY_RESISTANCE)
    expect(listedFieldNames(monster)).toEqual([NORMAL_USES, LAIR_USES, 'details'])
    const visibility = findField(monster, LAIR_USES)?.visibility
    if (!visibility) throw new Error('Missing lair visibility')
    const [dependency] = visibility.dependsOn
    expect(resolveDependsOnWatchName(dependency!, 'traits.0')).toBe('lair.enabled')
    expect(visibility.visibleWhen({ [dependency!]: true })).toBe(true)
    expect(visibility.visibleWhen({ [dependency!]: false })).toBe(false)
  })

  it('binds a non-default species sense range with a static feet label', () => {
    const [range] = assembleCreatureTraitTemplateFields({ templateId: DARKVISION, host: 'species' })
    expect(range).toMatchObject({
      type: 'joinedPair',
      start: {
        name: 'config.range',
        options: expect.arrayContaining([{ value: 90, label: '90' }]),
      },
      end: { kind: 'label' },
    })
    expect(getCreatureTraitTemplate(DARKVISION)?.configSchema.parse({ range: 90 })).toEqual({
      range: 90,
    })
  })

  it.each(['sense-unknown', 'toString'])('omits fields for unknown template %s', (templateId) => {
    expect(assembleCreatureTraitTemplateFields({ templateId, host: 'species' })).toEqual([])
  })

  it('rejects a duplicate path across joined and ordinary fields', () => {
    const rangePath = 'config.range'
    expect(() =>
      validateTraitTemplateConfigFields(
        [senseRangeJoinedPairField({ amountName: rangePath }), numberField(rangePath)],
        DARKVISION,
      ),
    ).toThrow(/Duplicate/)
  })

  it.each(['config.uses.unknown', 'config.uses', 'uses.normal'])(
    'rejects invalid config binding %s even when the template has required inputs',
    (path) => {
      expect(() =>
        validateTraitTemplateConfigFields([numberField(path)], LEGENDARY_RESISTANCE),
      ).toThrow(/not a field on/)
    },
  )

  it.each(['details', 'details.extra'])('reserves %s for the owning surface', (path) => {
    expect(() =>
      validateTraitTemplateConfigFields([numberField(path)], LEGENDARY_RESISTANCE),
    ).toThrow(/reserved/)
  })
})
