import type { ContentValidationIntent } from '../content-validation-intent'
import { classBodyDraftSchema, classBodySchema, subclassBodySchema } from '../../classes/class'
import { equipmentBodyDraftSchema, equipmentBodySchema } from '../../equipment'
import { featBodyDraftSchema, featBodySchema } from '../../feat'
import { monsterBodyDraftSchema, monsterBodySchema } from '../../monster'
import {
  skillProficiencyBodyDraftSchema,
  skillProficiencyBodySchema,
} from '../../skill-proficiency'
import { speciesBodyDraftSchema, speciesBodySchema } from '../../species'
import { spellBodyDraftSchema, spellBodySchema } from '../../spell/body'
import { requireCompiledOverlayPolicy } from './compile-policy'
import type { OverlayPolicyNode } from './policy'
import type { SystemOverlayParticipantId } from './participants'

const publishPolicies = {
  monsters: requireCompiledOverlayPolicy(monsterBodySchema, { participantId: 'monsters' }),
  species: requireCompiledOverlayPolicy(speciesBodySchema, { participantId: 'species' }),
  classes: requireCompiledOverlayPolicy(classBodySchema, { participantId: 'classes' }),
  subclasses: requireCompiledOverlayPolicy(subclassBodySchema, { participantId: 'subclasses' }),
  spells: requireCompiledOverlayPolicy(spellBodySchema, { participantId: 'spells' }),
  equipment: requireCompiledOverlayPolicy(equipmentBodySchema, { participantId: 'equipment' }),
  feats: requireCompiledOverlayPolicy(featBodySchema, { participantId: 'feats' }),
  'skill-proficiencies': requireCompiledOverlayPolicy(skillProficiencyBodySchema, {
    participantId: 'skill-proficiencies',
  }),
} as const satisfies Record<SystemOverlayParticipantId, OverlayPolicyNode>

const draftPolicies = {
  monsters: requireCompiledOverlayPolicy(monsterBodyDraftSchema, { participantId: 'monsters' }),
  species: requireCompiledOverlayPolicy(speciesBodyDraftSchema, { participantId: 'species' }),
  classes: requireCompiledOverlayPolicy(classBodyDraftSchema, { participantId: 'classes' }),
  subclasses: publishPolicies.subclasses,
  spells: requireCompiledOverlayPolicy(spellBodyDraftSchema, { participantId: 'spells' }),
  equipment: requireCompiledOverlayPolicy(equipmentBodyDraftSchema, { participantId: 'equipment' }),
  feats: requireCompiledOverlayPolicy(featBodyDraftSchema, { participantId: 'feats' }),
  'skill-proficiencies': requireCompiledOverlayPolicy(skillProficiencyBodyDraftSchema, {
    participantId: 'skill-proficiencies',
  }),
} as const satisfies Record<SystemOverlayParticipantId, OverlayPolicyNode>

export function overlayPolicyForParticipant(
  participantId: SystemOverlayParticipantId,
  validationIntent: ContentValidationIntent = 'publish',
): OverlayPolicyNode {
  return validationIntent === 'draft'
    ? draftPolicies[participantId]
    : publishPolicies[participantId]
}
