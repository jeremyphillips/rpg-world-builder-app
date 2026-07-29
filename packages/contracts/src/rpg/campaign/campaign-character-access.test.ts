import { describe, expect, it } from 'vitest'

import {
  CAMPAIGN_CHARACTER_ERROR_CODES,
  resolveCampaignCharacterAccess,
} from './campaign-character-access'

describe('CAMPAIGN_CHARACTER_ERROR_CODES', () => {
  it('exports stable client-inspectable codes', () => {
    expect(CAMPAIGN_CHARACTER_ERROR_CODES).toEqual([
      'campaign_not_found',
      'character_not_found',
      'character_not_in_campaign',
      'viewer_not_member',
      'forbidden',
    ])
  })
})

describe('resolveCampaignCharacterAccess', () => {
  it('grants canEdit to the character owner without control or manager role', () => {
    expect(
      resolveCampaignCharacterAccess({
        viewerOwnsCharacter: true,
        viewerControlsCharacter: false,
        viewerIsCampaignManager: false,
      }),
    ).toEqual({
      canEdit: true,
      canManage: false,
      canDelete: true,
    })
  })

  it('grants canEdit to a controller who does not own the character', () => {
    expect(
      resolveCampaignCharacterAccess({
        viewerOwnsCharacter: false,
        viewerControlsCharacter: true,
        viewerIsCampaignManager: false,
      }),
    ).toEqual({
      canEdit: true,
      canManage: false,
      canDelete: false,
    })
  })

  it('grants canEdit and canManage to campaign managers viewing peer sheets', () => {
    expect(
      resolveCampaignCharacterAccess({
        viewerOwnsCharacter: false,
        viewerControlsCharacter: false,
        viewerIsCampaignManager: true,
      }),
    ).toEqual({
      canEdit: true,
      canManage: true,
      canDelete: false,
    })
  })

  it('does not infer ownership from control assignment', () => {
    const capabilities = resolveCampaignCharacterAccess({
      viewerOwnsCharacter: false,
      viewerControlsCharacter: true,
      viewerIsCampaignManager: false,
    })

    expect(capabilities.canDelete).toBe(false)
  })

  it('does not grant edit rights to passive observers', () => {
    expect(
      resolveCampaignCharacterAccess({
        viewerOwnsCharacter: false,
        viewerControlsCharacter: false,
        viewerIsCampaignManager: false,
      }),
    ).toEqual({
      canEdit: false,
      canManage: false,
      canDelete: false,
    })
  })
})
