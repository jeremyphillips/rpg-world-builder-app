import { describe, expect, it, vi, beforeEach } from 'vitest'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  mergeQuickNpcGeneratedNarrativeOntoInput,
  QuickNpcNarrativeGenerationFailedError,
} from './quick-npc-narrative-on-create.lib'
import { prepareQuickNpcAuthoringCreate } from './quick-npc-authoring-submit.lib'
import { quickNpcAuthoringTabDefaultValues } from './quick-npc-form-fields'
import {
  quickNpcStandaloneCreateContext,
  quickNpcStandaloneSetupValues,
} from './quick-npc-test-fixtures'

const generateCharacterNarrativeMock = vi.hoisted(() => vi.fn())
const buildNarrativeContextMock = vi.hoisted(() => vi.fn())

vi.mock('@rpg/character-narrative-integrations', () => ({
  buildNarrativeContext: buildNarrativeContextMock,
  generateCharacterNarrative: generateCharacterNarrativeMock,
}))

const quickFighter = {
  ...populatedBuilderCatalog.classes[0]!,
  characterCreation: {
    proficiencies: {
      skills: {
        choices: [{ id: 'class-skills', choose: 1, from: ['athletics'] }],
      },
    },
  },
}

function preparedFixture(alignment: 'ln' | 'cg' = 'ln') {
  const buildContext = createCampaignNpcBuilderContextFixture({
    catalog: {
      ...populatedBuilderCatalog,
      classes: [quickFighter],
    },
  })

  return prepareQuickNpcAuthoringCreate({
    createContext: quickNpcStandaloneCreateContext(),
    setup: quickNpcStandaloneSetupValues({
      npcTemplateId: 'guard',
      speciesId: populatedBuilderCatalog.species[0]!.id,
      classId: quickFighter.id,
      level: 1,
    }),
    tabValues: {
      ...quickNpcAuthoringTabDefaultValues,
      gender: 'male',
      name: 'Guard Captain',
      alignment,
    },
    buildContext,
  })
}

describe('mergeQuickNpcGeneratedNarrativeOntoInput', () => {
  beforeEach(() => {
    generateCharacterNarrativeMock.mockReset()
    buildNarrativeContextMock.mockReset()
    buildNarrativeContextMock.mockImplementation((input) => input)
  })

  it('merges generated narrative onto the prepared create input', async () => {
    generateCharacterNarrativeMock.mockResolvedValue({
      ok: true,
      narrative: {
        personalityTraits: ['Calm'],
        ideals: ['Duty'],
        bonds: ['Unit'],
        flaws: ['Rigid'],
        backstoryParagraphs: ['A', 'B', 'C'],
      },
      omittedReferenceIds: [],
    })

    const prepared = preparedFixture()
    const input = await mergeQuickNpcGeneratedNarrativeOntoInput({
      prepared,
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: { ...populatedBuilderCatalog, classes: [quickFighter] },
      }),
      locations: [],
      characters: [],
    })

    expect(input.narrative).toMatchObject({
      personalityTraits: ['Calm'],
      backstory: '<p>A</p><p>B</p><p>C</p>',
    })
    expect(buildNarrativeContextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        draft: prepared.draft,
      }),
    )
  })

  it('throws when generation fails', async () => {
    generateCharacterNarrativeMock.mockResolvedValue({
      ok: false,
      reason: 'No fragments matched.',
    })

    await expect(
      mergeQuickNpcGeneratedNarrativeOntoInput({
        prepared: preparedFixture(),
        buildContext: createCampaignNpcBuilderContextFixture({
          catalog: { ...populatedBuilderCatalog, classes: [quickFighter] },
        }),
        locations: [],
        characters: [],
      }),
    ).rejects.toBeInstanceOf(QuickNpcNarrativeGenerationFailedError)
  })
})

describe('prepareQuickNpcAuthoringCreate narrative context inputs', () => {
  beforeEach(() => {
    buildNarrativeContextMock.mockReset()
    buildNarrativeContextMock.mockImplementation((input) => input)
  })

  it('uses draft alignment from authoring tab values in buildNarrativeContext', async () => {
    generateCharacterNarrativeMock.mockResolvedValue({
      ok: true,
      narrative: {
        personalityTraits: ['Calm'],
        ideals: ['Duty'],
        bonds: ['Unit'],
        flaws: ['Rigid'],
        backstoryParagraphs: ['A', 'B', 'C'],
      },
      omittedReferenceIds: [],
    })

    const lawful = preparedFixture('ln')
    await mergeQuickNpcGeneratedNarrativeOntoInput({
      prepared: lawful,
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: { ...populatedBuilderCatalog, classes: [quickFighter] },
      }),
      locations: [],
      characters: [],
    })

    expect(buildNarrativeContextMock.mock.calls[0]![0].draft.identity.alignment).toBe('ln')

    buildNarrativeContextMock.mockClear()
    const chaotic = preparedFixture('cg')
    await mergeQuickNpcGeneratedNarrativeOntoInput({
      prepared: chaotic,
      buildContext: createCampaignNpcBuilderContextFixture({
        catalog: { ...populatedBuilderCatalog, classes: [quickFighter] },
      }),
      locations: [],
      characters: [],
    })

    expect(buildNarrativeContextMock.mock.calls[0]![0].draft.identity.alignment).toBe('cg')
  })
})
