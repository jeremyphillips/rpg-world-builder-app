import { describe, expect, it } from 'vitest'

import {
  getNpcAuthoringTemplateClassAffinityIds,
  getNpcAuthoringTemplateEntry,
  getNpcAuthoringTemplateLabel,
  NPC_AUTHORING_TEMPLATE_ENTRIES,
  NPC_AUTHORING_TEMPLATE_IDS,
  NPC_AUTHORING_TEMPLATE_TERM,
  npcAuthoringTemplateIdSchema,
} from './npc-authoring-template'
import { ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES } from './preset-member-class-affinities'

describe('NPC authoring template vocabulary', () => {
  it('registers taxonomy term metadata', () => {
    expect(NPC_AUTHORING_TEMPLATE_TERM.label).toBe('NPC Authoring Template')
  })

  it('defines the exact template id set', () => {
    expect(NPC_AUTHORING_TEMPLATE_IDS).toEqual([
      'civilian',
      'manual_worker',
      'artisan',
      'merchant',
      'administrator',
      'civic_leader',
      'scholar',
      'technical_specialist',
      'healer',
      'performer',
      'maritime_crew',
      'maritime_officer',
      'guard',
      'scout',
      'investigator',
      'covert_operator',
      'martial_specialist',
      'martial_officer',
      'martial_commander',
      'arcane_practitioner',
      'divine_practitioner',
      'nature_practitioner',
    ])
    expect(npcAuthoringTemplateIdSchema.safeParse('veteran').success).toBe(false)
  })

  it('requires label and description on every entry without fixed level or priority', () => {
    for (const [id, entry] of Object.entries(NPC_AUTHORING_TEMPLATE_ENTRIES)) {
      expect(id).toMatch(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
      expect(entry.label.trim()).not.toBe('')
      expect(entry.description.trim()).not.toBe('')
      expect(entry).not.toHaveProperty('level')
      expect(entry).not.toHaveProperty('priority')
    }
  })

  it('resolves entries and labels by template id', () => {
    expect(getNpcAuthoringTemplateEntry('martial_specialist')).toMatchObject({
      label: 'Martial specialist',
      classAffinityIds: ['fighter', 'barbarian'],
    })
    expect(getNpcAuthoringTemplateEntry('missing_template')).toBeUndefined()
    expect(getNpcAuthoringTemplateLabel('custom')).toBe('custom')
  })

  it('may define canonical class affinity slug seeds on mechanical archetypes', () => {
    expect(getNpcAuthoringTemplateClassAffinityIds('covert_operator')).toEqual(['rogue'])
    expect(getNpcAuthoringTemplateClassAffinityIds('civilian')).toEqual([])
    expect(getNpcAuthoringTemplateEntry('divine_practitioner')?.classAffinityIds).toEqual([
      'cleric',
    ])
    expect(getNpcAuthoringTemplateEntry('nature_practitioner')?.classAffinityIds).toEqual(['druid'])
  })

  it('restricts template class affinity slugs to the shared canonical class seed vocabulary', () => {
    const canonicalSlugs = new Set<string>(
      Object.values(ORGANIZATION_PRESET_MEMBER_CLASS_AFFINITIES).flatMap((slugs) => [...slugs]),
    )

    for (const id of NPC_AUTHORING_TEMPLATE_IDS) {
      for (const slug of getNpcAuthoringTemplateClassAffinityIds(id)) {
        expect(canonicalSlugs.has(slug), `${id} → ${slug}`).toBe(true)
      }
    }
  })
})
