import { describe, expect, it } from 'vitest'

import {
  applyOrganizationAuthoringPreset,
  ORGANIZATION_AUTHORING_PRESETS,
} from './organization-authoring-preset'

describe('organization authoring presets', () => {
  it('freezes the six deterministic recipes', () => {
    expect(ORGANIZATION_AUTHORING_PRESETS).toMatchInlineSnapshot(`
      {
        "academy": {
          "activities": [
            "education",
            "training",
            "research",
          ],
          "domain": "academic",
          "form": "association",
          "label": "Academy",
        },
        "army": {
          "activities": [
            "warfare",
            "defense",
          ],
          "domain": "military",
          "label": "Army",
        },
        "bank": {
          "activities": [
            "banking",
            "finance",
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
          "domain": "religious",
          "form": "congregation",
          "label": "Church",
        },
        "craft_guild": {
          "activities": [
            "standards",
            "apprenticeship",
            "training",
          ],
          "domain": "occupational",
          "form": "guild",
          "label": "Craft guild",
        },
        "smuggling_ring": {
          "activities": [
            "smuggling",
          ],
          "domain": "criminal",
          "form": "network",
          "label": "Smuggling ring",
        },
      }
    `)
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
  })

  it('omits an equivocal form from the Army recipe', () => {
    expect(applyOrganizationAuthoringPreset('army')).toEqual({
      organizationDomain: 'military',
      activities: ['warfare', 'defense'],
    })
  })
})
