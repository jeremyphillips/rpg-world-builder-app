import { z } from 'zod'

// ---------------------------------------------------------------------------
// Canonical PC / NPC identity vocabulary (builder characterKind, sheet characterType).
// ---------------------------------------------------------------------------

export const CHARACTER_PC_NPC_IDS = ['pc', 'npc'] as const

export const characterPcNpcSchema = z.enum(CHARACTER_PC_NPC_IDS)

export type CharacterPcNpc = (typeof CHARACTER_PC_NPC_IDS)[number]

export type CharacterKind = CharacterPcNpc
export type CharacterType = CharacterPcNpc

export const characterKindSchema = characterPcNpcSchema
export const characterTypeSchema = characterPcNpcSchema

/** @deprecated Import `CHARACTER_PC_NPC_IDS` for new code. */
export const CHARACTER_KINDS = CHARACTER_PC_NPC_IDS

/** @deprecated Import `CHARACTER_PC_NPC_IDS` for new code. */
export const CHARACTER_TYPES = CHARACTER_PC_NPC_IDS

/** Closed pc/npc ids in canonical order. */
export const CHARACTER_TYPE_IDS = CHARACTER_PC_NPC_IDS
