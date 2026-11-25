import type { z } from 'zod'

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

/** System-patch participants. Subclasses are included even though they are not a content-type key. */
export const systemOverlayParticipants = [
  { id: 'monsters', schemas: [monsterBodySchema, monsterBodyDraftSchema] },
  { id: 'species', schemas: [speciesBodySchema, speciesBodyDraftSchema] },
  { id: 'classes', schemas: [classBodySchema, classBodyDraftSchema] },
  { id: 'subclasses', schemas: [subclassBodySchema] },
  { id: 'spells', schemas: [spellBodySchema, spellBodyDraftSchema] },
  { id: 'equipment', schemas: [equipmentBodySchema, equipmentBodyDraftSchema] },
  { id: 'feats', schemas: [featBodySchema, featBodyDraftSchema] },
  {
    id: 'skill-proficiencies',
    schemas: [skillProficiencyBodySchema, skillProficiencyBodyDraftSchema],
  },
] as const satisfies readonly { id: string; schemas: readonly z.ZodType[] }[]

export type SystemOverlayParticipantId = (typeof systemOverlayParticipants)[number]['id']
