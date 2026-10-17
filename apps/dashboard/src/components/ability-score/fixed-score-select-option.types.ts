export type StandardArrayScoreOperation = 'current' | 'assign' | 'move' | 'swap' | 'invalid'

export type FixedScoreSelectOption = {
  score: number
  operation: StandardArrayScoreOperation
  secondaryLabel?: string
  ariaLabel: string
}
