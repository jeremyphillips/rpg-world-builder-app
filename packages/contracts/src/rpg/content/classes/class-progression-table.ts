/** Player-facing class progression table heading shared by dashboard and rules text. */
export const CLASS_PROGRESSION_TABLE_LABEL = 'Class Progression' as const

export function classProgressionTableReference(): string {
  return `the ${CLASS_PROGRESSION_TABLE_LABEL} table`
}

export function classProgressionColumnReference(progression: {
  label: string
  showInTable: boolean
}): string | undefined {
  if (!progression.showInTable) return undefined
  return `the ${progression.label} column of the ${CLASS_PROGRESSION_TABLE_LABEL} table`
}
