import type { TermAuditConfig } from './src/types'

export const VOCAB_TERM_AUDIT_CONFIG = {
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/generated/**',
    '**/*.json',
    '**/*.snap',
  ],
  contextual: [],
} as const satisfies TermAuditConfig
