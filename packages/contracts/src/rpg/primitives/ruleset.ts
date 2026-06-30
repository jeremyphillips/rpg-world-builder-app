import { z } from 'zod'

// ---------------------------------------------------------------------------
// System ruleset identity — names the content catalog version. Shared so the
// API and dashboard agree on which catalog to load; the value also names the
// seed directory and prefixes deterministic system content ids
// ("<rulesetId>:<slug>").
// ---------------------------------------------------------------------------

export const SYSTEM_RULESET_IDS = ['srd-cc-5.2.1'] as const

export const systemRulesetIdSchema = z.enum(SYSTEM_RULESET_IDS)

export type SystemRulesetId = z.infer<typeof systemRulesetIdSchema>

export const DEFAULT_SYSTEM_RULESET_ID = 'srd-cc-5.2.1' satisfies SystemRulesetId
