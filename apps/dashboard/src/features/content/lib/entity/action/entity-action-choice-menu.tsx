import {
  ActionButton,
  ActionIcon,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  InteractiveList,
  MenuChoiceRow,
  cn,
} from '@rpg/ui'

import { entityActionChoiceMenuContentClasses } from './entity-action-choice-menu.variants'

export type EntityActionChoiceMenuItem = {
  id: string
  label: string
  description: string
  disabled?: boolean
  onSelect: () => void
}

type EntityActionChoiceMenuTriggerProps =
  | {
      appearance?: 'labeled' | 'group'
      triggerLabel?: string
    }
  | {
      appearance: 'icon'
      triggerLabel: string
    }

export type EntityActionChoiceMenuProps = {
  items: readonly EntityActionChoiceMenuItem[]
  menuHeading?: string
} & EntityActionChoiceMenuTriggerProps

export function EntityActionChoiceMenu({
  items,
  menuHeading,
  ...triggerProps
}: EntityActionChoiceMenuProps) {
  if (items.length === 0) {
    return null
  }

  const appearance = triggerProps.appearance ?? 'labeled'
  const labeledText = triggerProps.triggerLabel ?? 'Add'
  const trigger =
    appearance === 'icon' ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        density="compact"
        aria-label={triggerProps.triggerLabel}
      >
        <ActionIcon action="add" />
      </Button>
    ) : (
      <ActionButton action="add" variant="text" size="sm" density="compact">
        {labeledText}
      </ActionButton>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(entityActionChoiceMenuContentClasses)}>
        {menuHeading ? <DropdownMenuLabel>{menuHeading}</DropdownMenuLabel> : null}
        <InteractiveList>
          {items.map((item) => (
            <MenuChoiceRow
              key={item.id}
              heading={item.label}
              supporting={item.description}
              supportingWrap
              disabled={item.disabled}
              onSelect={() => item.onSelect()}
            />
          ))}
        </InteractiveList>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
