import { DropdownMenuChoiceItemContent } from '@rpg/ui'

export type EntityActionChoiceMenuItemContentProps = {
  label: string
  description: string
}

/** @deprecated Prefer `DropdownMenuChoiceItemContent` from `@rpg/ui`. */
export function EntityActionChoiceMenuItemContent(props: EntityActionChoiceMenuItemContentProps) {
  return <DropdownMenuChoiceItemContent {...props} />
}
