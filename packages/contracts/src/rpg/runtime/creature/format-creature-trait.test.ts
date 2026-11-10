import { describe, expect, it } from 'vitest'

import {
  CREATURE_TRAIT_PRESET_IDS,
  isConfigurableCreatureTraitPreset,
} from '../../content/creature/trait-presets'
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
    expect(formatCreatureTrait({ subject, trait: { preset: 'pack-tactics' } })).toEqual({
      name: 'Pack Tactics',
      sentence:
        "The hell hound has Advantage on an attack roll against a creature if at least one of its allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition.",
    })
  })

  it('keeps the majority attack-roll and opportunity-attack wording', () => {
    expect(
      formatCreatureTrait({
        trait: { preset: 'pack-tactics' },
        subject: formatMonsterStatBlockSubject('Wolf'),
      })?.sentence,
    ).toContain('an attack roll')
    expect(
      formatCreatureTrait({
        trait: { preset: 'flyby' },
        subject: formatMonsterStatBlockSubject('Owl'),
      })?.sentence,
    ).toContain('an Opportunity Attack')
    expect(
      formatCreatureTrait({
        trait: { preset: 'agile' },
        subject: formatMonsterStatBlockSubject('Rat'),
      })?.sentence,
    ).toContain('an Opportunity Attack')
  })

  it('formats spider climb for any subject, including a swarm', () => {
    expect(
      formatCreatureTrait({
        subject: formatMonsterStatBlockSubject('Swarm of Insects'),
        trait: { preset: 'spider-climb' },
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
      if (isConfigurableCreatureTraitPreset(presetId)) continue
      for (const subject of subjects) {
        const formatted = formatCreatureTrait({ subject, trait: { preset: presetId } })
        expect(formatted?.name).toBe(CREATURE_TRAIT_VOCABULARY_ENTRIES[presetId].label)
        expect(
          formatted?.sentence.startsWith('The ') || formatted?.sentence.includes(subject),
        ).toBe(true)
        expect(formatted?.sentence).not.toContain('The the ')
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
    expect(CREATURE_TRAIT_VOCABULARY_ENTRIES['standing-leap'].description).toBe(
      'Long- and high-jumps without a run.',
    )
    expect(CREATURE_TRAIT_VOCABULARY_ENTRIES.swarm.description).toBe(
      'Occupies spaces; passes through tiny gaps.',
    )
    expect(CREATURE_TRAIT_VOCABULARY_ENTRIES['regeneration-halt'].description).toBe(
      'Acid or Fire interrupts regeneration.',
    )
    expect(CREATURE_TRAIT_VOCABULARY_ENTRIES['regeneration-halt'].label).toBe(
      'Regeneration (Acid/Fire)',
    )
  })

  it('formats configurable presets from the subject without a doubled article', () => {
    const subject = formatMonsterStatBlockSubject('Hell Hound')
    expect(
      formatCreatureTrait({
        subject,
        trait: { preset: 'legendary-resistance', uses: 3, lair: false },
      }),
    ).toEqual({
      name: 'Legendary Resistance (3/Day)',
      sentence: 'If the hell hound fails a saving throw, it can choose to succeed instead.',
    })
    expect(
      formatCreatureTrait({
        subject,
        trait: { preset: 'legendary-resistance', uses: 4, lair: true },
      })?.name,
    ).toBe('Legendary Resistance (4/Day, or 5/Day in Lair)')
    expect(
      formatCreatureTrait({
        subject,
        trait: { preset: 'hold-breath', count: 60, unit: 'minute' },
      })?.sentence,
    ).toBe('The hell hound can hold its breath for 1 hour.')
    expect(
      formatCreatureTrait({
        subject,
        trait: { preset: 'illumination', radius: 20 },
      })?.sentence,
    ).toBe(
      'The hell hound sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet.',
    )
    expect(
      formatCreatureTrait({
        subject,
        trait: { preset: 'standing-leap', longJump: 15 },
      })?.sentence,
    ).toBe(
      'With or without a running start, the hell hound can Long Jump up to 15 feet and High Jump up to 7.5 feet.',
    )
    expect(
      formatCreatureTrait({ subject, trait: { preset: 'swarm', noun: 'bat' } })?.sentence,
    ).toBe(
      "The hell hound can occupy another creature's space and vice versa, and it can move through any opening large enough for a Tiny bat. It can't regain Hit Points or gain Temporary Hit Points.",
    )
    expect(
      formatCreatureTrait({ subject, trait: { preset: 'regeneration', hitPoints: 10 } })?.sentence,
    ).toBe(
      'The hell hound regains 10 Hit Points at the start of each of its turns if it has at least 1 Hit Point.',
    )
    expect(
      formatCreatureTrait({
        subject,
        trait: { preset: 'regeneration-halt', hitPoints: 5 },
      })?.name,
    ).toBe('Regeneration')
    expect(formatCreatureTrait({ subject, trait: { preset: 'swarm' } })).toBeUndefined()
    expect(
      formatCreatureTrait({
        subject: formatMonsterStatBlockSubject('Giant Octopus'),
        trait: {
          preset: 'water-breathing',
          outsideWaterBreathAmount: 1,
          outsideWaterBreathUnit: 'hour',
        },
      })?.sentence,
    ).toBe(
      'The giant octopus can breathe only underwater. It can hold its breath for 1 hour outside water.',
    )
    expect(
      formatCreatureTrait({
        subject: formatMonsterStatBlockSubject('Hunter Shark'),
        trait: { preset: 'water-breathing', outsideWaterBreathAmount: 1 },
      })?.sentence,
    ).toBe('The hunter shark can breathe only underwater.')
  })
})
