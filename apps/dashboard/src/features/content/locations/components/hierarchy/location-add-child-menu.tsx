import type { LocationKind } from '@rpg/contracts'

import { EntityActionChoiceMenu } from '../../../lib/entity/action/entity-action-choice-menu'
import {
  childAuthoringTypesForParentKind,
  getLocationAuthoringTypeLabel,
} from '../../lib/create/location-create-shortcuts'
import { resolveLocationAuthoringOptionDescription } from '../../lib/location-authoring-option-description.lib'
import type { LocationAuthoringType } from '../../lib/location-authoring-type'

type LocationAddChildMenuTriggerProps =
  | {
      /** Compact text labeled trigger (panel or subgroup header). */
      appearance?: 'labeled' | 'group'
      triggerLabel?: string
    }
  | {
      appearance: 'icon'
      triggerLabel: string
    }

export type LocationAddChildMenuProps = {
  parentKind: LocationKind
  /** Parent form authoring type — drives contextual option descriptions. */
  parentAuthoringType: LocationAuthoringType
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
  parentAuthoringType,
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

  const appearance = triggerProps.appearance ?? 'labeled'
  const labeledText = triggerProps.triggerLabel ?? 'Add location'

  return (
    <EntityActionChoiceMenu
      appearance={appearance}
      triggerLabel={labeledText}
      menuHeading={menuHeading}
      items={childTypes.map((authoringType) => ({
        id: authoringType,
        label: getLocationAuthoringTypeLabel(authoringType, { parentKind }),
        description: resolveLocationAuthoringOptionDescription({
          parentAuthoringType,
          childAuthoringType: authoringType,
        }),
        onSelect: () => onSelectAuthoringType(authoringType),
      }))}
    />
  )
}
