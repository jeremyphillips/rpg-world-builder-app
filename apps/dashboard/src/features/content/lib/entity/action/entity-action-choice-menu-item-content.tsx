import { cn } from '@rpg/ui'

import {
  entityActionChoiceMenuItemContentClasses,
  entityActionChoiceMenuItemDescriptionClasses,
  entityActionChoiceMenuItemLabelClasses,
} from './entity-action-choice-menu.variants'

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
    <span className={cn(entityActionChoiceMenuItemContentClasses)}>
      <span className={entityActionChoiceMenuItemLabelClasses}>{label}</span>
      <span className={entityActionChoiceMenuItemDescriptionClasses}>{description}</span>
    </span>
  )
}
