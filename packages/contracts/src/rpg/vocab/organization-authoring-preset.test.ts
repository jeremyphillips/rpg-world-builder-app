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
          "functions": [
            "education",
            "training",
            "research",
          ],
          "label": "Academy",
          "practices": [],
        },
        "adventurers_guild": {
          "description": "Closest starting point for an adventurer hall, company, or monster hunters guild.",
          "discoveryTerms": [
            "monster hunters' guild",
            "adventuring company",
            "treasure hunters",
          ],
          "domain": "occupational",
          "form": "guild",
          "functions": [],
          "label": "Adventurers' guild",
          "practices": [],
        },
        "army": {
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
          "functions": [
            "warfare",
            "defense",
          ],
          "label": "Army",
          "practices": [],
        },
        "bank": {
          "description": "Closest starting point for moneylenders, pawnbrokers, and tax farmers.",
          "discoveryTerms": [
            "moneylenders",
            "pawnbrokers",
            "tax farmers",
            "insurance company",
          ],
          "domain": "commercial",
          "form": "company",
          "functions": [
            "finance",
          ],
          "label": "Bank",
          "practices": [
            "banking",
          ],
        },
        "church": {
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
          "functions": [
            "worship",
            "ministry",
          ],
          "label": "Church",
          "practices": [],
        },
        "city_council": {
          "description": "Closest starting point for parliament, senate, and privy council.",
          "discoveryTerms": [
            "parliament",
            "senate",
            "privy council",
          ],
          "domain": "government",
          "form": "association",
          "functions": [],
          "label": "City council",
          "practices": [],
        },
        "city_watch": {
          "description": "Closest starting point for civic policing and crown law enforcement.",
          "discoveryTerms": [
            "marshals",
          ],
          "domain": "government",
          "functions": [
            "policing",
          ],
          "label": "City watch",
          "practices": [],
        },
        "craft_guild": {
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
          "functions": [
            "standards",
            "training",
          ],
          "label": "Craft guild",
          "practices": [
            "apprenticeship",
          ],
        },
        "gang": {
          "description": "Closest starting point for street gangs, protection rackets, and prison crews.",
          "discoveryTerms": [
            "protection racket",
            "wreckers",
            "prison gang",
          ],
          "domain": "criminal",
          "functions": [],
          "label": "Gang",
          "practices": [],
        },
        "government_ministry": {
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
          "functions": [
            "administration",
          ],
          "label": "Government ministry",
          "practices": [],
        },
        "knightly_order": {
          "description": "Chivalric membership organized around martial discipline and sworn service.",
          "domain": "military",
          "form": "order",
          "functions": [
            "warfare",
            "defense",
          ],
          "label": "Knightly order",
          "practices": [],
        },
        "mercenary_company": {
          "description": "Closest starting point for ranger company and other hired fighting enterprises.",
          "discoveryTerms": [
            "ranger company",
          ],
          "domain": "military",
          "form": "company",
          "functions": [
            "warfare",
          ],
          "label": "Mercenary company",
          "practices": [],
        },
        "mutual_aid_society": {
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
          "functions": [
            "aid",
          ],
          "label": "Mutual aid society",
          "practices": [],
        },
        "political_party": {
          "description": "Closest starting point for reform league and advocacy society.",
          "discoveryTerms": [
            "reform league",
            "advocacy society",
          ],
          "domain": "political",
          "form": "association",
          "functions": [
            "advocacy",
          ],
          "label": "Political party",
          "practices": [],
        },
        "religious_order": {
          "description": "Closest starting point for monastery and rule-bound faith communities.",
          "discoveryTerms": [
            "monastery",
          ],
          "domain": "religious",
          "form": "order",
          "functions": [
            "worship",
            "ministry",
          ],
          "label": "Religious order",
          "practices": [],
        },
        "scholarly_society": {
          "description": "Closest starting point for explorers' society, guild of scholars, and museum society.",
          "discoveryTerms": [
            "explorers' society",
            "guild of scholars",
            "museum society",
            "research institute",
          ],
          "domain": "academic",
          "form": "association",
          "functions": [
            "research",
          ],
          "label": "Scholarly society",
          "practices": [],
        },
        "shipping_company": {
          "description": "Closest starting point for caravan operators, coach lines, and courier services.",
          "discoveryTerms": [
            "caravan company",
            "coach line",
            "courier service",
          ],
          "domain": "commercial",
          "form": "company",
          "functions": [
            "transport",
          ],
          "label": "Shipping company",
          "practices": [],
        },
        "smuggling_ring": {
          "description": "Closest starting point for fencing networks and counterfeiting rings.",
          "discoveryTerms": [
            "fencing network",
            "counterfeiting ring",
            "criminal syndicate",
          ],
          "domain": "criminal",
          "form": "network",
          "functions": [],
          "label": "Smuggling ring",
          "practices": [
            "smuggling",
          ],
        },
        "thieves_guild": {
          "description": "Closest starting point for beggars' guild and urban criminal guilds.",
          "discoveryTerms": [
            "beggars' guild",
          ],
          "domain": "criminal",
          "form": "guild",
          "functions": [],
          "label": "Thieves' guild",
          "practices": [],
        },
        "trading_company": {
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
          "functions": [
            "trade",
          ],
          "label": "Trading company",
          "practices": [],
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
    values.functions = ['finance']
    values.practices = []

    expect(values).toEqual({
      organizationDomain: 'political',
      organizationForm: 'network',
      functions: ['finance'],
      practices: [],
    })
    expect(values).not.toHaveProperty('authoringPresetId')
    expect(values).not.toHaveProperty('description')
    expect(values).not.toHaveProperty('discoveryTerms')
  })

  it('projects force on the Army recipe', () => {
    expect(applyOrganizationAuthoringPreset('army')).toEqual({
      organizationDomain: 'military',
      organizationForm: 'force',
      functions: ['warfare', 'defense'],
      practices: [],
    })
  })

  it.each([
    [
      'academy',
      {
        organizationDomain: 'academic',
        organizationForm: 'association',
        functions: ['education', 'training', 'research'],
        practices: [],
      },
    ],
    [
      'bank',
      {
        organizationDomain: 'commercial',
        organizationForm: 'company',
        functions: ['finance'],
        practices: ['banking'],
      },
    ],
    [
      'craft_guild',
      {
        organizationDomain: 'occupational',
        organizationForm: 'guild',
        functions: ['standards', 'training'],
        practices: ['apprenticeship'],
      },
    ],
    [
      'smuggling_ring',
      {
        organizationDomain: 'criminal',
        organizationForm: 'network',
        functions: [],
        practices: ['smuggling'],
      },
    ],
    [
      'church',
      {
        organizationDomain: 'religious',
        organizationForm: 'congregation',
        functions: ['worship', 'ministry'],
        practices: [],
      },
    ],
    [
      'knightly_order',
      {
        organizationDomain: 'military',
        organizationForm: 'order',
        functions: ['warfare', 'defense'],
        practices: [],
      },
    ],
    [
      'government_ministry',
      {
        organizationDomain: 'government',
        organizationForm: 'office',
        functions: ['administration'],
        practices: [],
      },
    ],
    [
      'trading_company',
      {
        organizationDomain: 'commercial',
        organizationForm: 'company',
        functions: ['trade'],
        practices: [],
      },
    ],
    [
      'religious_order',
      {
        organizationDomain: 'religious',
        organizationForm: 'order',
        functions: ['worship', 'ministry'],
        practices: [],
      },
    ],
    [
      'city_council',
      {
        organizationDomain: 'government',
        organizationForm: 'association',
        functions: [],
        practices: [],
      },
    ],
    [
      'political_party',
      {
        organizationDomain: 'political',
        organizationForm: 'association',
        functions: ['advocacy'],
        practices: [],
      },
    ],
    [
      'adventurers_guild',
      {
        organizationDomain: 'occupational',
        organizationForm: 'guild',
        functions: [],
        practices: [],
      },
    ],
    [
      'thieves_guild',
      {
        organizationDomain: 'criminal',
        organizationForm: 'guild',
        functions: [],
        practices: [],
      },
    ],
    [
      'shipping_company',
      {
        organizationDomain: 'commercial',
        organizationForm: 'company',
        functions: ['transport'],
        practices: [],
      },
    ],
    [
      'city_watch',
      {
        organizationDomain: 'government',
        functions: ['policing'],
        practices: [],
      },
    ],
    [
      'mutual_aid_society',
      {
        organizationDomain: 'community',
        organizationForm: 'association',
        functions: ['aid'],
        practices: [],
      },
    ],
    ['gang', { organizationDomain: 'criminal', functions: [], practices: [] }],
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
