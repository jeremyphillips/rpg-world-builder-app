import { cn } from '@rpg/ui'

export type EntityActionChoiceMenuItemContentProps = {
  label: string
  description: string
}

/** Label plus required helper description for choice menu rows. */
export function EntityActionChoiceMenuItemContent({
  label,
  description,
}: EntityActionChoiceMenuItemContentProps) {
  return (
    <span className={cn('flex min-w-0 flex-col gap-0.5')}>
      <span className="text-sm">{label}</span>
      <span className="text-xs leading-snug text-muted-foreground">{description}</span>
    </span>
  )
}
