import { describe, expect, it } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'

import {
  formatSuggestionHelper,
  resolveQuickNpcClassRowHelper,
} from './quick-npc-build-provenance.lib'

const rogueClass = {
  ...populatedBuilderCatalog.classes[0]!,
  id: 'srd-cc-5.2.1:rogue',
  slug: 'rogue',
  name: 'Rogue',
}

const fighterClass = {
  ...populatedBuilderCatalog.classes[0]!,
  id: 'srd-cc-5.2.1:fighter',
  slug: 'fighter',
  name: 'Fighter',
}

const barbarianClass = {
  ...populatedBuilderCatalog.classes[0]!,
  id: 'srd-cc-5.2.1:barbarian',
  slug: 'barbarian',
  name: 'Barbarian',
}

const context = createCampaignNpcBuilderContextFixture({
  catalog: {
    ...populatedBuilderCatalog,
    classes: [rogueClass, fighterClass, barbarianClass],
  },
})

const classOptions = [
  { value: rogueClass.id, label: 'Rogue' },
  { value: fighterClass.id, label: 'Fighter' },
  { value: barbarianClass.id, label: 'Barbarian' },
]

const lieutenantTitle = {
  id: 'omt_lieutenant',
  label: 'Lieutenant',
  priority: 40 as const,
  npcRecommendation: {
    templateId: 'criminal' as const,
    level: 6,
    classPreferenceOverrideSlugs: ['rogue'],
  },
}

describe('formatSuggestionHelper', () => {
  it('returns Suggested by when values match', () => {
    expect(
      formatSuggestionHelper({
        currentValue: 6,
        suggestedValue: 6,
        sourceLabel: 'Lieutenant',
      }),
    ).toBe('Suggested by Lieutenant.')
  })

  it('returns source suggests display when values differ', () => {
    expect(
      formatSuggestionHelper({
        currentValue: 5,
        suggestedValue: 6,
        sourceLabel: 'Lieutenant',
        suggestedDisplay: 'level 6',
      }),
    ).toBe('Lieutenant suggests level 6.')
  })
})

describe('resolveQuickNpcClassRowHelper', () => {
  it('prefers title over role and organization when selected class matches title override', () => {
    expect(
      resolveQuickNpcClassRowHelper({
        classId: rogueClass.id,
        membershipTitle: 'omt_lieutenant',
        titles: [lieutenantTitle],
        selectedTemplateId: 'criminal',
        organizationName: 'City Watch',
        organizationClassAffinityIds: [fighterClass.id],
        context,
        classOptions,
      }),
    ).toBe('Suggested by Lieutenant.')
  })

  it('uses title recommendations when selected class overrides all sources', () => {
    expect(
      resolveQuickNpcClassRowHelper({
        classId: barbarianClass.id,
        membershipTitle: 'omt_lieutenant',
        titles: [lieutenantTitle],
        selectedTemplateId: 'criminal',
        organizationName: 'City Watch',
        organizationClassAffinityIds: [fighterClass.id],
        context,
        classOptions,
      }),
    ).toBe('Lieutenant suggests Rogue.')
  })

  it('attributes Fighter to organization when only org recommends it', () => {
    const memberTitle = {
      id: 'omt_member',
      label: 'Member',
      priority: 10 as const,
      npcRecommendation: { templateId: 'criminal' as const },
    } as const

    expect(
      resolveQuickNpcClassRowHelper({
        classId: fighterClass.id,
        membershipTitle: 'omt_member',
        titles: [memberTitle],
        selectedTemplateId: 'criminal',
        organizationName: 'City Watch',
        organizationClassAffinityIds: [fighterClass.id],
        context,
        classOptions,
      }),
    ).toBe('Suggested by City Watch.')
  })
})
