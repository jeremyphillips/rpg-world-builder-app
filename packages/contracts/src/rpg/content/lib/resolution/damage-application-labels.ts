import type { ResolutionApplicationAmount } from '../../../vocab/resolution'

/**
 * Damage-specific copy for authoring selects and stat blocks.
 * Vocabulary labels stay effect-generic (`Full effect`, `Half effect`, `None`).
 */
export const DAMAGE_APPLICATION_AMOUNT_PRESENTATION = {
  none: 'No damage',
  half: 'Half damage',
  full: 'Full damage',
} as const satisfies Record<ResolutionApplicationAmount, string>
