import { describe, expect, it } from 'vitest'

import {
  GRANT_TEMPLATE_GROUP_IDS,
  GRANT_TEMPLATE_GROUPS,
  GRANT_TEMPLATES,
  getGrantTemplateById,
  getGrantTemplatesForTypes,
  resolveGrantTemplateDuplicatePolicy,
  resolveGrantTemplateRepeatable,
  resolveGrantTemplateVocabRef,
} from './grant-template-registry'
import { GRANT_TYPES, grantRowFormSchema } from './grant-form-schema'

const PROFICIENCY_GRANT_TYPES = new Set([
  'weaponProficiency',
  'toolProficiency',
  'skillProficiency',
  'armorTraining',
])

const AUTHORING_SHAPE_GRANT_TYPES = new Set([...PROFICIENCY_GRANT_TYPES, 'movement'])

describe('grant template registry', () => {
  it('defines one template per consumer grant type', () => {
    const covered = new Set(GRANT_TEMPLATES.map((template) => template.grantType))
    for (const grantType of GRANT_TYPES) {
      expect(covered.has(grantType)).toBe(true)
    }
    expect(GRANT_TEMPLATES).toHaveLength(GRANT_TYPES.length)
  })

  it('uses valid group ids and unique template ids', () => {
    const groupIds = new Set(GRANT_TEMPLATE_GROUP_IDS)
    const templateIds = new Set<string>()

    for (const template of GRANT_TEMPLATES) {
      expect(groupIds.has(template.groupId)).toBe(true)
      expect(templateIds.has(template.id)).toBe(false)
      templateIds.add(template.id)
      expect(template.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    }
  })

  it('maps groups to the expected labels', () => {
    expect(GRANT_TEMPLATE_GROUPS).toEqual([
      { id: 'proficiencies', label: 'Proficiencies & training' },
      { id: 'character-options', label: 'Character options' },
      { id: 'combat-traits', label: 'Combat & traits' },
    ])
  })

  it('createDefault sets grantType and parses for fully validatable rows', () => {
    for (const template of GRANT_TEMPLATES) {
      const defaults = template.createDefault()
      expect(defaults.grantType).toBe(template.grantType)

      if (AUTHORING_SHAPE_GRANT_TYPES.has(template.grantType)) {
        continue
      }

      const result = grantRowFormSchema.safeParse(defaults)
      expect(result.success, JSON.stringify(result.error?.issues ?? [])).toBe(true)
    }
  })

  it('createDefault matches authoring shapes for proficiency and movement templates', () => {
    expect(getGrantTemplateById('skill-proficiency')?.createDefault()).toMatchObject({
      grantType: 'skillProficiency',
      proficiencySource: 'specific',
    })
    expect(getGrantTemplateById('movement-bonus')?.createDefault()).toMatchObject({
      grantType: 'movement',
      movementMode: 'walk',
      movementOperation: 'bonus',
      movementValue: '5',
    })
  })

  it('defaults repeatable and duplicatePolicy when omitted', () => {
    for (const template of GRANT_TEMPLATES) {
      expect(resolveGrantTemplateRepeatable(template)).toBe(true)
      expect(resolveGrantTemplateDuplicatePolicy(template)).toBe('allow')
    }
  })

  it('filters templates by consumer grant types', () => {
    const filtered = getGrantTemplatesForTypes(['movement', 'languages', 'featChoice'])
    expect(filtered.map((template) => template.grantType)).toEqual([
      'languages',
      'featChoice',
      'movement',
    ])
  })

  it('harvests vocab ref labels for search metadata', () => {
    const senseTemplate = getGrantTemplateById('special-sense')
    expect(senseTemplate?.vocabRefs?.length).toBeGreaterThan(0)

    const darkvision = senseTemplate?.vocabRefs?.find(
      (ref) => ref.kind === 'sense' && ref.id === 'darkvision',
    )
    expect(darkvision).toBeDefined()
    expect(resolveGrantTemplateVocabRef(darkvision!).label).toBe('Darkvision')
  })
})
