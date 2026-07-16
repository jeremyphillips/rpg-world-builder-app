export const fixedScoresAssignmentRootClasses = 'space-y-6'

export const fixedScoresAssignmentIntroClasses = 'space-y-1'

export const fixedScoresTokenPoolSectionClasses = 'space-y-2'

export const fixedScoresScorePoolHeaderClasses = 'flex items-center justify-between gap-2'

/** Dashed container for unassigned score tokens — expandable token set. */
export const fixedScoresScorePoolContainerClasses =
  'flex flex-col gap-2 rounded-md border border-dashed border-muted-foreground/20 bg-muted/5 p-4 transition-colors'

export const fixedScoresScorePoolContainerDragOverClasses = 'border-primary/50 bg-muted/10'

export const fixedScoresScorePoolContainerTokensClasses =
  'flex min-h-16 flex-wrap items-center gap-3'

export const fixedScoresScorePoolContainerProgressClasses = 'text-sm text-muted-foreground'

export const fixedScoresAbilityGridClasses = 'grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6'

export const abilityScoreCardBaseClasses =
  'flex min-h-[8.5rem] w-full min-w-0 flex-col gap-1 rounded-md border p-4 transition-colors'

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

export const abilityScoreCardScoreAreaClasses = 'flex flex-col items-center gap-1'

export const abilityScoreCardScoreSlotClasses = 'relative grid min-h-16 w-full place-items-center'

export const abilityScoreCardScorePlaceholderOverlayClasses =
  'absolute inset-0 flex items-center justify-center'

export const abilityScoreCardChooseScoreSectionClasses = 'flex w-full justify-center'

export const abilityScoreCardModifierClasses =
  'text-sm font-medium tabular-nums text-muted-foreground'

export const abilityScoreCardChooseScoreClasses =
  'h-auto p-0 text-xs font-normal text-muted-foreground'
