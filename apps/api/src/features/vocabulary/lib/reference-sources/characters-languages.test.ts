import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../../campaign/participation/campaign-character-participation.repository', () => ({
  listOpenParticipationsForCampaign: vi.fn(),
}))

vi.mock('../../../character/character.model', () => ({
  CharacterModel: {
    find: vi.fn(),
  },
}))

import { listOpenParticipationsForCampaign } from '../../../campaign/participation/campaign-character-participation.repository'
import { CharacterModel } from '../../../character/character.model'

import { indexCharacterLanguageBlockersByLanguageId } from './characters-languages'

const listParticipationsMock = vi.mocked(listOpenParticipationsForCampaign)
const characterFindMock = vi.mocked(CharacterModel.find)

describe('indexCharacterLanguageBlockersByLanguageId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listParticipationsMock.mockResolvedValue([
      {
        characterId: 'char_visible',
        roster: { status: 'active' },
      },
      {
        characterId: 'char_hidden',
        roster: { status: 'active' },
      },
    ] as Awaited<ReturnType<typeof listOpenParticipationsForCampaign>>)

    characterFindMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: 'char_visible',
            name: 'Visible PC',
            characterType: 'pc',
            proficiencies: { languages: [{ language: 'elvish' }] },
          },
        ]),
      }),
    } as unknown as ReturnType<typeof CharacterModel.find>)
  })

  it('scopes viewer_display to visible characters', async () => {
    const index = await indexCharacterLanguageBlockersByLanguageId({
      campaignId: 'camp_1',
      purpose: 'viewer_display',
      viewer: {
        userId: 'user_1',
        role: 'pc',
        controlledCharacterIds: ['char_visible'],
      },
    })

    expect(characterFindMock).toHaveBeenCalledWith({
      _id: { $in: ['char_visible'] },
      'proficiencies.languages.0': { $exists: true },
    })
    expect(index.get('elvish')).toHaveLength(1)
  })

  it('loads all active characters for authoritative_guard', async () => {
    characterFindMock.mockReturnValue({
      select: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue([
          {
            _id: 'char_visible',
            name: 'Visible PC',
            characterType: 'pc',
            proficiencies: { languages: [{ language: 'elvish' }] },
          },
          {
            _id: 'char_hidden',
            name: 'Hidden PC',
            characterType: 'pc',
            proficiencies: { languages: [{ language: 'elvish' }] },
          },
        ]),
      }),
    } as unknown as ReturnType<typeof CharacterModel.find>)

    const index = await indexCharacterLanguageBlockersByLanguageId({
      campaignId: 'camp_1',
      purpose: 'authoritative_guard',
    })

    expect(characterFindMock).toHaveBeenCalledWith({
      _id: { $in: ['char_visible', 'char_hidden'] },
      'proficiencies.languages.0': { $exists: true },
    })
    expect(index.get('elvish')).toHaveLength(2)
  })
})
