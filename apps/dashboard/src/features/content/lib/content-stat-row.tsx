export type ContentStatRowProps = {
  label: string
  value: string
}

/**
 * Reusable label/value row for content detail pages.
 * Used by class, species, monster, spell, and equipment detail routes.
 *
 * @example
 * <ContentStatRow label="Hit Die" value="d12 per level" />
 */
export function ContentStatRow({ label, value }: ContentStatRowProps) {
  return (
    <p className="text-sm">
      <span className="font-medium">{label}: </span>
      <span className="text-muted-foreground">{value}</span>
    </p>
  )
}
