import { describe, expect, it } from 'vitest'

import {
  CHILL_TOUCH_RESOLUTION,
  ELDRITCH_BLAST_RESOLUTION,
  SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  resolveContentCampaignAccess,
} from '@rpg/contracts'

import { omitDuplicateDeniedFields } from './duplicate-content-policy'
import { transformDuplicateSource } from './duplicate-content-transform'
import { asResolvedContentSlug } from '../slug/resolve-unique-content-slug'
import { classWriteConfig } from '../../classes/classes.config'
import { featWriteConfig } from '../../feats/feats.config'
import { organizationWriteConfig } from '../../organizations/organizations.config'
import { spellWriteConfig } from '../../spells/spells.config'

describe('omitDuplicateDeniedFields', () => {
  it('strips envelope, overlay, and operational fields', () => {
    const result = omitDuplicateDeniedFields({
      id: 'abc',
      slug: 'fighter',
      rulesetId: 'srd-cc-5.2.1',
      source: 'homebrew',
      status: 'published',
      campaignId: 'camp',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      campaignAccess: resolveContentCampaignAccess({
        available: false,
        visibilityMode: 'dm_only',
        participantIds: ['pc-1'],
      }),
      modeling: {
        status: 'meaningful-partial',
        blocker: { code: 'spell-blocked', note: 'blocked for test' },
      },
      name: 'Fighter',
      hitDie: 10,
    })

    expect(result).toEqual({ name: 'Fighter', hitDie: 10 })
  })

  it('strips sourcePresetId but preserves members.titles on organization duplicate input', () => {
    const result = omitDuplicateDeniedFields({
      id: 'org-1',
      slug: 'river-bank',
      name: 'River Bank',
      organizationDomain: 'commercial',
      sourcePresetId: 'bank',
      members: {
        classAffinityIds: [],
        speciesAffinityIds: [],
        titles: [
          {
            id: 'omt_abc',
            sourceTitleId: 'treasurer',
            label: 'Treasurer',
            priority: 50,
          },
        ],
      },
    })

    expect(result).not.toHaveProperty('sourcePresetId')
    expect(result.members).toEqual({
      classAffinityIds: [],
      speciesAffinityIds: [],
      titles: [
        {
          id: 'omt_abc',
          sourceTitleId: 'treasurer',
          label: 'Treasurer',
          priority: 50,
        },
      ],
    })
  })
})

describe('transformDuplicateSource', () => {
  const destinationSlug = asResolvedContentSlug('berserker-copy')

  it('strips campaignAccess before create-input parse', () => {
    const parsed = transformDuplicateSource({
      source: {
        id: 'feat-1',
        slug: 'custom-feat',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'camp',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'Custom Feat',
        category: 'origin',
        repeatable: { allowed: false },
        campaignAccess: resolveContentCampaignAccess({
          available: false,
          visibilityMode: 'dm_only',
          participantIds: [],
        }),
      } as never,
      requestedName: 'Custom Feat Copy',
      destinationSlug,
      contentType: 'feats',
      writeConfig: featWriteConfig,
    })

    expect(parsed).not.toHaveProperty('campaignAccess')
    expect(parsed.name).toBe('Custom Feat Copy')
    expect(parsed.slug).toBe(destinationSlug)
  })

  it('regenerates class feature ids for duplicate', () => {
    const parsed = transformDuplicateSource({
      source: {
        id: 'class-1',
        slug: 'berserker',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'camp',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'Berserker',
        primaryAbilities: ['str'],
        hitDie: 12,
        proficiencies: {
          savingThrows: ['str', 'con'],
          armor: { categories: [], items: [] },
          weapons: { categories: ['simple'], items: [] },
          skills: { categories: [], items: [] },
        },
        features: [{ kind: 'custom', id: 'rage', name: 'Rage', level: 1 }],
      } as never,
      requestedName: 'Berserker Copy',
      destinationSlug,
      contentType: 'classes',
      writeConfig: classWriteConfig,
    })

    expect((parsed.features as Array<{ id: string; name: string }>)[0]).toMatchObject({
      name: 'Rage',
      level: 1,
    })
    expect((parsed.features as Array<{ id: string }>)[0]?.id).not.toBe('rage')
  })

  it('remaps spell resolution effect ids atomically', () => {
    const parsed = transformDuplicateSource({
      source: {
        id: 'spell-1',
        slug: 'custom-bolt',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'camp',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'Custom Bolt',
        school: 'evocation',
        level: 0,
        classIds: ['wizard'],
        castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
        range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
        duration: { kind: 'instantaneous' },
        components: { verbal: true, somatic: true },
        resolution: ELDRITCH_BLAST_RESOLUTION,
      } as never,
      requestedName: 'Custom Bolt Copy',
      destinationSlug,
      contentType: 'spells',
      writeConfig: spellWriteConfig,
    })

    const resolution = parsed.resolution as typeof ELDRITCH_BLAST_RESOLUTION
    expect(resolution.effects[0]?.id).not.toBe(SPELL_RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID)
    expect(resolution.outcomes[0]?.applications[0]?.effectId).toBe(resolution.effects[0]?.id)
  })

  it('parses create input without modeling overlay', () => {
    const parsed = transformDuplicateSource({
      source: {
        id: 'spell-2',
        slug: 'touch',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'camp',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'Touch',
        school: 'necromancy',
        level: 0,
        classIds: ['wizard'],
        castingTime: { normal: { value: 1, unit: 'action' }, canBeCastAsRitual: false },
        range: { kind: 'distance', value: { value: 60, unit: 'ft' } },
        duration: { kind: 'instantaneous' },
        components: { verbal: true, somatic: true },
        modeling: {
          status: 'meaningful-partial',
          blocker: { code: 'spell-blocked', note: 'blocked for test' },
        },
        resolution: CHILL_TOUCH_RESOLUTION,
      } as never,
      requestedName: 'Touch Copy',
      destinationSlug,
      contentType: 'spells',
      writeConfig: spellWriteConfig,
    })

    expect(parsed).not.toHaveProperty('modeling')
  })

  it('parses organization duplicate input without sourcePresetId', () => {
    const parsed = transformDuplicateSource({
      source: {
        id: 'org-1',
        slug: 'river-bank',
        rulesetId: 'srd-cc-5.2.1',
        source: 'homebrew',
        status: 'published',
        campaignId: 'camp',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        name: 'River Bank',
        organizationDomain: 'commercial',
        sourcePresetId: 'bank',
        functions: ['finance'],
        practices: ['banking'],
        members: {
          classAffinityIds: [],
          speciesAffinityIds: [],
          titles: [
            {
              id: 'omt_abc',
              sourceTitleId: 'treasurer',
              label: 'Treasurer',
              priority: 50,
            },
          ],
        },
        connections: { locations: [] },
      } as never,
      requestedName: 'River Bank Copy',
      destinationSlug: asResolvedContentSlug('river-bank-copy'),
      contentType: 'organizations',
      writeConfig: organizationWriteConfig,
    })

    expect(parsed).not.toHaveProperty('sourcePresetId')
    expect((parsed.members as { titles: unknown[] }).titles).toHaveLength(1)
    expect((parsed.members as { titles: Array<{ label: string }> }).titles[0]?.label).toBe(
      'Treasurer',
    )
  })
})
