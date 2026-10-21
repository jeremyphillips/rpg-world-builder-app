/** Formats a signed modifier for attack/damage display (e.g. "+3", "-1"). */
export function formatSignedModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : String(modifier)
}
