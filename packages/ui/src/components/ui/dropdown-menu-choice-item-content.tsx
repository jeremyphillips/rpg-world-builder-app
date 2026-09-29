import { cn } from '../../lib/utils'

import {
  dropdownMenuChoiceItemContentClasses,
  dropdownMenuChoiceItemDescriptionClasses,
  dropdownMenuChoiceItemLabelClasses,
} from './dropdown-menu-choice.variants'

export type DropdownMenuChoiceItemContentProps = {
  label: string
  description: string
}

/** Label plus helper description for choice-style dropdown menu rows. */
export function DropdownMenuChoiceItemContent({
  label,
  description,
}: DropdownMenuChoiceItemContentProps) {
  return (
    <span className={cn(dropdownMenuChoiceItemContentClasses)}>
      <span className={dropdownMenuChoiceItemLabelClasses}>{label}</span>
      <span className={dropdownMenuChoiceItemDescriptionClasses}>{description}</span>
    </span>
  )
}
