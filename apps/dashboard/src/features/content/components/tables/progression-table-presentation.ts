export type ProgressionTablePresentation = {
  name?: string
  columns: Array<{ key: string; label?: string }>
  rows: Array<{ level?: number; values: Record<string, string | undefined> }>
}
