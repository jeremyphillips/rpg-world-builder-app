export const fixedScoresAssignmentRootClasses = 'space-y-6'

export const fixedScoresAssignmentIntroClasses = 'space-y-1'

export const fixedScoresTokenPoolSectionClasses = 'space-y-2'

export const fixedScoresTokenPoolClasses = 'flex flex-wrap gap-3'

export const fixedScoresRemainingClasses = 'text-sm text-muted-foreground'

export const fixedScoresAbilityGridClasses =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6'

export const fixedScoresScoreTokenClasses =
  'inline-flex size-16 shrink-0 cursor-grab items-center justify-center rounded-md border border-border bg-secondary text-lg font-semibold tabular-nums touch-none active:cursor-grabbing'

export const fixedScoresScoreTokenDraggingClasses = 'opacity-40'

export const fixedScoresDragOverlayTokenClasses =
  'inline-flex size-16 items-center justify-center rounded-md border border-border bg-secondary text-lg font-semibold tabular-nums shadow-lg'

export const abilityScoreCardBaseClasses =
  'flex min-h-[8.5rem] w-full min-w-0 flex-col gap-3 rounded-md border p-4 transition-colors'

export const abilityScoreCardStateClasses = {
  empty: 'border-border bg-card',
  dragOverValid: 'border-primary ring-2 ring-primary/30 bg-card',
  filled: 'border-border bg-card',
  draggingFrom: 'border-dashed border-muted-foreground/40 bg-muted/30',
  invalidAfterAttempt: 'border-destructive ring-2 ring-destructive/30 bg-card',
  suggested: 'border-border bg-card',
} as const

export type AbilityScoreCardState = keyof typeof abilityScoreCardStateClasses

export function abilityScoreCardClasses(state: AbilityScoreCardState): string {
  return `${abilityScoreCardBaseClasses} ${abilityScoreCardStateClasses[state]}`
}

export const abilityScoreCardHeaderClasses = 'space-y-0.5'

export const abilityScoreCardAbbrClasses = 'text-sm font-semibold'

export const abilityScoreCardNameClasses = 'text-xs text-muted-foreground'

export const abilityScoreCardScoreAreaClasses =
  'flex min-h-16 flex-1 flex-col items-center justify-center gap-1'

export const abilityScoreCardPlaceholderClasses = 'text-center text-sm text-muted-foreground'

export const abilityScoreCardModifierClasses =
  'text-sm font-medium tabular-nums text-muted-foreground'

export const abilityScoreCardAssignedScoreClasses =
  'cursor-grab font-semibold tabular-nums text-[length:var(--text-heading-2)] leading-[length:var(--text-heading-2--line-height)] touch-none active:cursor-grabbing'

export const abilityScoreCardAssignedScoreDraggingClasses = 'opacity-40'

export const abilityScoreCardChooseScoreClasses = 'h-auto p-0 text-xs font-normal'
