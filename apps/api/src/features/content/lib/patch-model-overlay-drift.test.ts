import { overlayPolicyForParticipant, systemOverlayParticipants } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { classRegistration } from '../classes/classes.config'
import { equipmentRegistration } from '../equipment/equipment.config'
import { featRegistration } from '../feats/feats.config'
import { monstersRegistration } from '../monsters/monsters.config'
import { skillProficiencyRegistration } from '../skill-proficiencies/skill-proficiencies.config'
import { speciesRegistration } from '../species/species.config'
import { spellRegistration } from '../spells/spells.config'
import { subclassContentConfig } from '../subclasses/subclasses.config'

const PATCH_READ_CONFIGS = [
  monstersRegistration.read,
  speciesRegistration.read,
  classRegistration.read,
  spellRegistration.read,
  equipmentRegistration.read,
  featRegistration.read,
  skillProficiencyRegistration.read,
  subclassContentConfig,
] as const

const PARTICIPANT_IDS = new Set(systemOverlayParticipants.map((p) => p.id))

/** Ensures configuration defects fail in CI before stored patches can masquerade as row failures. */
describe('patch model overlay participant drift', () => {
  it.each(PATCH_READ_CONFIGS.map((readConfig) => [readConfig.type, readConfig] as const))(
    '%s overlayParticipantId is registered with publish and draft policies',
    (_type, readConfig) => {
      const participantId = readConfig.overlayParticipantId
      expect(participantId).toBeDefined()
      expect(PARTICIPANT_IDS.has(participantId!)).toBe(true)
      expect(() => overlayPolicyForParticipant(participantId!, 'publish')).not.toThrow()
      expect(() => overlayPolicyForParticipant(participantId!, 'draft')).not.toThrow()
    },
  )
})
