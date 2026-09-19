import { cn, establishSurfaceCurrent } from '@rpg/ui'

export const builderStepChooseClassPromptCardClasses = cn(
  'w-full min-w-0 rounded-md border border-border-subtle p-4',
  'bg-surface-faint',
  establishSurfaceCurrent('surface-faint'),
)

/** 16px column gap between icon and copy. */
export const builderStepChooseClassPromptBodyClasses = 'flex items-start gap-4'

export const builderStepChooseClassPromptContentClasses = 'flex min-w-0 flex-1 flex-col gap-1'

/** Tight heading-to-subheading stack — ContentCard secondary rhythm. */
export const builderStepChooseClassPromptTextStackClasses = 'flex flex-col gap-1'

export const builderStepChooseClassPromptHeadingClasses = 'text-base font-semibold text-foreground'

export const builderStepChooseClassPromptSubheadingClasses = 'text-sm text-muted-foreground'

export const builderStepChooseClassPromptActionClasses = 'h-auto w-fit shrink-0 self-start px-0'
