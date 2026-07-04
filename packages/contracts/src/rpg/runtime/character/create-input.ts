import type { z } from 'zod'

import { pcCharacterSchema } from './sheet'

// ---------------------------------------------------------------------------
// CreateCharacterInput — the wire shape the client sends to POST /api/characters.
//
// Server-assigned fields (id, userId, createdAt, updatedAt) are omitted; the
// API derives userId from the session cookie and rejects any client-supplied
// value. MVP restrictions (characterType: 'pc', campaignId: null,
// supported rulesetId) are enforced server-side — this schema intentionally
// stays permissive so it serves as the single client → server contract without
// coupling to API-layer rules.
// ---------------------------------------------------------------------------

export const createCharacterInputSchema = pcCharacterSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
})

export type CreateCharacterInput = z.infer<typeof createCharacterInputSchema>
