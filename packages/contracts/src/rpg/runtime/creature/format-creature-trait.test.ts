import { describe, expect, it } from 'vitest'

import { CREATURE_TRAIT_PRESET_IDS } from '../../content/creature/trait-presets'
import { formatMonsterStatBlockSubject } from '../monster/spell-entry-presentation'
import {
  CREATURE_TRAIT_VOCABULARY_ENTRIES,
  CREATURE_TRAIT_VOCABULARY_IDS,
} from '../../vocab/creature/trait-vocabulary'
import { formatCreatureTrait } from './format-creature-trait'

const APPROVED_DESCRIPTIONS = {
  amphibious: 'Breathes air and water.',
  'ice-walk': 'Climbs ice; no extra cost on ice or snow.',
  'sunlight-sensitivity': 'Disadvantage on checks and attacks in sunlight.',
  agile: 'Leaves reach without Opportunity Attacks.',
  amorphous: 'Moves through 1-inch spaces without slowing.',
  'earth-glide': 'Burrows through unworked earth and stone.',
  flyby: 'Flying out of reach avoids Opportunity Attacks.',
  'incorporeal-movement': 'Passes through creatures and objects.',
  'running-leap': 'Jumps 25 ft. after a 10-ft. run.',
  'spider-climb': 'Climbs walls and ceilings without checks.',
  tunneler: 'Burrows through rock; leaves a 10-ft. tunnel.',
  'web-walker': 'Ignores webs; senses creatures on the same web.',
  'lightning-absorption': 'Regains HP from Lightning damage.',
  'magic-resistance': 'Advantage on saves against magic.',
  'pack-tactics': 'Advantage when an ally is beside the target.',
  'siege-monster': 'Double damage to objects and structures.',
  'undead-fortitude': 'Con save can leave it at 1 HP instead of 0.',
  'immutable-form': 'Cannot shape-shift.',
} as const

describe('formatCreatureTrait', () => {
  it('uses the monster subject helper for pack tactics', () => {
    const subject = formatMonsterStatBlockSubject('Hell Hound')
    expect(formatCreatureTrait({ presetId: 'pack-tactics', subject })).toEqual({
      name: 'Pack Tactics',
      sentence:
        "The hell hound has Advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.",
    })
  })

  it('keeps the majority attack-roll and opportunity-attack wording', () => {
    expect(
      formatCreatureTrait({
        presetId: 'pack-tactics',
        subject: formatMonsterStatBlockSubject('Wolf'),
      })?.sentence,
    ).toContain('an attack roll')
    expect(
      formatCreatureTrait({
        presetId: 'flyby',
        subject: formatMonsterStatBlockSubject('Owl'),
      })?.sentence,
    ).toContain('an Opportunity Attack')
    expect(
      formatCreatureTrait({
        presetId: 'agile',
        subject: formatMonsterStatBlockSubject('Rat'),
      })?.sentence,
    ).toContain('an Opportunity Attack')
  })

  it('formats spider climb for any subject, including a swarm', () => {
    expect(
      formatCreatureTrait({
        presetId: 'spider-climb',
        subject: formatMonsterStatBlockSubject('Swarm of Insects'),
      })?.sentence,
    ).toBe(
      'The swarm of insects can climb difficult surfaces, including along ceilings, without needing to make an ability check.',
    )
  })

  it('formats every fixed preset from the subject helper', () => {
    const subjects = [
      formatMonsterStatBlockSubject('Hell Hound'),
      formatMonsterStatBlockSubject('Kobold Warrior'),
      formatMonsterStatBlockSubject('Pit Fiend'),
      formatMonsterStatBlockSubject('Ogre Zombie'),
    ]
    expect(CREATURE_TRAIT_PRESET_IDS).toEqual(CREATURE_TRAIT_VOCABULARY_IDS)
    for (const presetId of CREATURE_TRAIT_PRESET_IDS) {
      for (const subject of subjects) {
        const formatted = formatCreatureTrait({ presetId, subject })
        expect(formatted?.name).toBe(CREATURE_TRAIT_VOCABULARY_ENTRIES[presetId].label)
        expect(
          formatted?.sentence.startsWith('The ') || formatted?.sentence.includes(subject),
        ).toBe(true)
        expect(formatted?.sentence).not.toContain(`${subject}'s`)
      }
    }
  })

  it('keeps the approved discovery descriptions on the vocabulary', () => {
    for (const [id, description] of Object.entries(APPROVED_DESCRIPTIONS)) {
      expect(
        CREATURE_TRAIT_VOCABULARY_ENTRIES[id as keyof typeof APPROVED_DESCRIPTIONS].description,
      ).toBe(description)
    }
  })
})
