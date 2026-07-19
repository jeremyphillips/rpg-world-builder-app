export type BuildCatalogDisclosureLabelInput = {
  name: string
  sourceLabel?: string
  entryIndex?: number
}

/** Accessible disclosure trigger label for catalog collapsible rows. */
export function buildCatalogDisclosureLabel({
  name,
  sourceLabel,
  entryIndex,
}: BuildCatalogDisclosureLabelInput): string {
  const fallbackSource =
    sourceLabel ?? (entryIndex !== undefined ? `entry ${entryIndex + 1}` : undefined)

  return fallbackSource ? `${name}, ${fallbackSource}` : name
}
