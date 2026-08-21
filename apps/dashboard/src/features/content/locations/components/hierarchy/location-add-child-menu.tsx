import type { LocationKind } from '@rpg/contracts'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@rpg/ui'
import { Plus } from 'lucide-react'

import {
  childAuthoringTypesForParentKind,
  getLocationAuthoringTypeLabel,
} from '../../lib/create/location-create-shortcuts'
import type { LocationAuthoringType } from '../../lib/location-authoring-type'

type LocationAddChildMenuTriggerProps =
  | {
      /** Compact ghost labeled trigger (panel or subgroup header). */
      appearance?: 'labeled' | 'group'
      triggerLabel?: string
    }
  | {
      appearance: 'icon'
      triggerLabel: string
    }

export type LocationAddChildMenuProps = {
  parentKind: LocationKind
  onSelectAuthoringType: (authoringType: LocationAuthoringType) => void
  /**
   * Optional subset of types already resolved for this context (e.g. settlement direct
   * places). Intersected with canonical `childAuthoringTypesForParentKind` — cannot widen
   * eligibility beyond hierarchy SSOT.
   */
  allowedAuthoringTypes?: readonly LocationAuthoringType[]
  /** Optional context above type items (e.g. "Add to Dock Ward"). */
  menuHeading?: string
} & LocationAddChildMenuTriggerProps

/** Detail-page menu of child location types derived from contracts hierarchy. */
export function LocationAddChildMenu({
  parentKind,
  onSelectAuthoringType,
  allowedAuthoringTypes,
  menuHeading,
  ...triggerProps
}: LocationAddChildMenuProps) {
  const canonicalTypes = childAuthoringTypesForParentKind(parentKind)
  const childTypes =
    allowedAuthoringTypes === undefined
      ? canonicalTypes
      : canonicalTypes.filter((type) => allowedAuthoringTypes.includes(type))

  if (childTypes.length === 0) {
    return null
  }

  const appearance = triggerProps.appearance ?? 'labeled'
  const labeledText = triggerProps.triggerLabel ?? 'Add location'
  const trigger =
    appearance === 'icon' ? (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        density="compact"
        aria-label={triggerProps.triggerLabel}
      >
        <Plus aria-hidden />
      </Button>
    ) : (
      <Button type="button" variant="ghost" size="sm" density="compact">
        <Plus aria-hidden />
        {labeledText}
      </Button>
    )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {menuHeading ? <DropdownMenuLabel>{menuHeading}</DropdownMenuLabel> : null}
        {childTypes.map((authoringType) => (
          <DropdownMenuItem
            key={authoringType}
            onSelect={() => onSelectAuthoringType(authoringType)}
          >
            {getLocationAuthoringTypeLabel(authoringType, { parentKind })}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
