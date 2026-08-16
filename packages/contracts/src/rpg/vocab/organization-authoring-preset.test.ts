import { describe, expect, it } from 'vitest'

import {
  applyOrganizationAuthoringPreset,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  ORGANIZATION_AUTHORING_PRESETS,
} from './organization-authoring-preset'

describe('organization authoring presets', () => {
  it('freezes the twenty v2 recipes with discovery metadata', () => {
    expect(ORGANIZATION_AUTHORING_PRESET_IDS).toHaveLength(20)
    expect(ORGANIZATION_AUTHORING_PRESETS).toMatchInlineSnapshot(`
      {
        "academy": {
          "activities": [
            "education",
            "training",
            "research",
          ],
          "description": "Closest starting point for university, mage college, and teaching bodies.",
          "discoveryTerms": [
            "university",
            "mage college",
            "bardic college",
            "seminary",
            "wizard circle",
          ],
          "domain": "academic",
          "form": "association",
          "label": "Academy",
        },
        "adventurers_guild": {
          "activities": [],
          "description": "Closest starting point for an adventurer hall, company, or monster hunters guild.",
          "discoveryTerms": [
            "monster hunters' guild",
            "adventuring company",
            "treasure hunters",
          ],
          "domain": "occupational",
          "form": "guild",
          "label": "Adventurers' guild",
        },
        "army": {
          "activities": [
            "warfare",
            "defense",
          ],
          "description": "Closest starting point for navy, militia, marines, and other armed hosts.",
          "discoveryTerms": [
            "navy",
            "militia",
            "marines",
            "sky fleet",
            "garrison",
            "legion",
            "crusading host",
            "royal guard",
            "warband",
            "pirate crew",
          ],
          "domain": "military",
          "form": "force",
          "label": "Army",
        },
        "bank": {
          "activities": [
            "banking",
            "finance",
          ],
          "description": "Closest starting point for moneylenders, pawnbrokers, and tax farmers.",
          "discoveryTerms": [
            "moneylenders",
            "pawnbrokers",
            "tax farmers",
            "insurance company",
          ],
          "domain": "commercial",
          "form": "company",
          "label": "Bank",
        },
        "church": {
          "activities": [
            "worship",
            "ministry",
          ],
          "description": "Closest starting point for temple, cult, and gathered faith communities.",
          "discoveryTerms": [
            "temple",
            "temple organization",
            "cult",
            "druid circle",
            "heretical sect",
            "witches' coven",
            "missionary society",
            "pilgrimage society",
            "inquisitorial office",
          ],
          "domain": "religious",
          "form": "congregation",
          "label": "Church",
        },
        "city_council": {
          "activities": [],
          "description": "Closest starting point for parliament, senate, and privy council.",
          "discoveryTerms": [
            "parliament",
            "senate",
            "privy council",
          ],
          "domain": "government",
          "form": "association",
          "label": "City council",
        },
        "city_watch": {
          "activities": [
            "defense",
          ],
          "description": "Closest starting point for civic policing and crown law enforcement.",
          "discoveryTerms": [
            "marshals",
          ],
          "domain": "government",
          "label": "City watch",
        },
        "craft_guild": {
          "activities": [
            "standards",
            "apprenticeship",
            "training",
          ],
          "description": "Closest starting point for scribes, alchemists, and professional trade guilds.",
          "discoveryTerms": [
            "merchant guild",
            "labor union",
            "professional college",
            "hunters lodge",
            "scribes guild",
            "entertainers guild",
            "alchemists guild",
            "cartographers guild",
            "pilots guild",
            "advocates guild",
            "apothecaries guild",
            "theater troupe",
            "teamsters guild",
            "river boatmen",
            "market association",
            "shopkeepers association",
            "factors guild",
            "ranchers association",
            "surgeons college",
          ],
          "domain": "occupational",
          "form": "guild",
          "label": "Craft guild",
        },
        "gang": {
          "activities": [],
          "description": "Closest starting point for street gangs, protection rackets, and prison crews.",
          "discoveryTerms": [
            "protection racket",
            "wreckers",
            "prison gang",
          ],
          "domain": "criminal",
          "label": "Gang",
        },
        "government_ministry": {
          "activities": [
            "administration",
          ],
          "description": "Closest starting point for customs service, provincial administration, and executive departments.",
          "discoveryTerms": [
            "royal court",
            "magistracy",
            "exchequer",
            "diplomatic corps",
            "mint",
            "postal service",
            "customs service",
            "provincial governorate",
            "colonial administration",
          ],
          "domain": "government",
          "form": "office",
          "label": "Government ministry",
        },
        "knightly_order": {
          "activities": [
            "warfare",
            "defense",
          ],
          "description": "Chivalric membership organized around martial discipline and sworn service.",
          "domain": "military",
          "form": "order",
          "label": "Knightly order",
        },
        "mercenary_company": {
          "activities": [
            "warfare",
          ],
          "description": "Closest starting point for ranger company and other hired fighting enterprises.",
          "discoveryTerms": [
            "ranger company",
          ],
          "domain": "military",
          "form": "company",
          "label": "Mercenary company",
        },
        "mutual_aid_society": {
          "activities": [],
          "description": "Closest starting point for burial societies, civic leagues, and reciprocal support bodies.",
          "discoveryTerms": [
            "orphanage society",
            "famine relief society",
            "burial society",
            "civic league",
            "festival guild",
            "sporting club",
            "hospice society",
          ],
          "domain": "community",
          "form": "association",
          "label": "Mutual aid society",
        },
        "political_party": {
          "activities": [],
          "description": "Closest starting point for reform league and advocacy society.",
          "discoveryTerms": [
            "reform league",
            "advocacy society",
          ],
          "domain": "political",
          "form": "association",
          "label": "Political party",
        },
        "religious_order": {
          "activities": [
            "worship",
            "ministry",
          ],
          "description": "Closest starting point for monastery and rule-bound faith communities.",
          "discoveryTerms": [
            "monastery",
          ],
          "domain": "religious",
          "form": "order",
          "label": "Religious order",
        },
        "scholarly_society": {
          "activities": [
            "research",
          ],
          "description": "Closest starting point for explorers' society, guild of scholars, and museum society.",
          "discoveryTerms": [
            "explorers' society",
            "guild of scholars",
            "museum society",
            "research institute",
          ],
          "domain": "academic",
          "form": "association",
          "label": "Scholarly society",
        },
        "shipping_company": {
          "activities": [
            "transport",
          ],
          "description": "Closest starting point for caravan operators, coach lines, and courier services.",
          "discoveryTerms": [
            "caravan company",
            "coach line",
            "courier service",
          ],
          "domain": "commercial",
          "form": "company",
          "label": "Shipping company",
        },
        "smuggling_ring": {
          "activities": [
            "smuggling",
          ],
          "description": "Closest starting point for fencing networks and counterfeiting rings.",
          "discoveryTerms": [
            "fencing network",
            "counterfeiting ring",
            "criminal syndicate",
          ],
          "domain": "criminal",
          "form": "network",
          "label": "Smuggling ring",
        },
        "thieves_guild": {
          "activities": [],
          "description": "Closest starting point for beggars' guild and urban criminal guilds.",
          "discoveryTerms": [
            "beggars' guild",
          ],
          "domain": "criminal",
          "form": "guild",
          "label": "Thieves' guild",
        },
        "trading_company": {
          "activities": [
            "trade",
          ],
          "description": "Closest starting point for merchant house and chartered company.",
          "discoveryTerms": [
            "merchant house",
            "chartered company",
            "auction house",
            "warehouse combine",
            "bazaar syndicate",
            "company of merchant adventurers",
            "fur company",
            "foundry works",
            "textile manufactory",
            "shipyard company",
            "glassworks",
            "farming cooperative",
            "millers cooperative",
            "logging company",
            "fishing fleet",
          ],
          "domain": "commercial",
          "form": "company",
          "label": "Trading company",
        },
      }
    `)
  })

  it('requires a description on every preset', () => {
    for (const preset of Object.values(ORGANIZATION_AUTHORING_PRESETS)) {
      expect(preset.description.trim()).not.toBe('')
    }
  })

  it('returns an editable recipe without durable preset provenance', () => {
    const values = applyOrganizationAuthoringPreset('smuggling_ring')
    values.organizationDomain = 'political'
    values.activities = ['finance']

    expect(values).toEqual({
      organizationDomain: 'political',
      organizationForm: 'network',
      activities: ['finance'],
    })
    expect(values).not.toHaveProperty('authoringPresetId')
    expect(values).not.toHaveProperty('description')
    expect(values).not.toHaveProperty('discoveryTerms')
  })

  it('projects force on the Army recipe', () => {
    expect(applyOrganizationAuthoringPreset('army')).toEqual({
      organizationDomain: 'military',
      organizationForm: 'force',
      activities: ['warfare', 'defense'],
    })
  })

  it.each([
    [
      'government_ministry',
      {
        organizationDomain: 'government',
        organizationForm: 'office',
        activities: ['administration'],
      },
    ],
    [
      'trading_company',
      { organizationDomain: 'commercial', organizationForm: 'company', activities: ['trade'] },
    ],
    [
      'religious_order',
      {
        organizationDomain: 'religious',
        organizationForm: 'order',
        activities: ['worship', 'ministry'],
      },
    ],
    [
      'city_council',
      { organizationDomain: 'government', organizationForm: 'association', activities: [] },
    ],
    [
      'political_party',
      { organizationDomain: 'political', organizationForm: 'association', activities: [] },
    ],
    [
      'adventurers_guild',
      { organizationDomain: 'occupational', organizationForm: 'guild', activities: [] },
    ],
    [
      'thieves_guild',
      { organizationDomain: 'criminal', organizationForm: 'guild', activities: [] },
    ],
    [
      'shipping_company',
      { organizationDomain: 'commercial', organizationForm: 'company', activities: ['transport'] },
    ],
    ['city_watch', { organizationDomain: 'government', activities: ['defense'] }],
    [
      'mutual_aid_society',
      { organizationDomain: 'community', organizationForm: 'association', activities: [] },
    ],
    ['gang', { organizationDomain: 'criminal', activities: [] }],
  ] as const)('projects %s from the confirmed v1 subset', (id, expected) => {
    expect(applyOrganizationAuthoringPreset(id)).toEqual(expected)
  })

  it('does not attach transport discovery terms to Trading company', () => {
    expect(ORGANIZATION_AUTHORING_PRESETS.trading_company.discoveryTerms ?? []).not.toEqual(
      expect.arrayContaining(['shipping', 'caravan', 'coach', 'courier']),
    )
    expect(ORGANIZATION_AUTHORING_PRESETS.shipping_company.discoveryTerms).toEqual(
      expect.arrayContaining(['caravan company', 'coach line', 'courier service']),
    )
  })
})
