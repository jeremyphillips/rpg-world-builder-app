/** Standard D&D ability modifier: ⌊(score − 10) / 2⌋. */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}
