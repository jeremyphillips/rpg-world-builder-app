import { ButtonDropdown } from '@rpg/ui'
import {
  CLASS_FEATURE_KIND_ENTRIES,
  CLASS_FEATURE_KINDS,
  classSubclassChoiceAtOccurrenceLimit,
  classValidationMessages,
  isClassFeatureKind,
} from '@rpg/contracts'

import { type FeatureRowForm } from '../lib/class-feature-form-fields'
import { createAsiFeature } from '../lib/class-asi-features'
import { createSubclassChoiceFeature } from '../lib/class-subclass-choice-features'
import { featureToFormRow } from '../lib/class-feature-form-fields'
import { featureRowShowsInAddMenu } from '../lib/class-feature-authoring'
import { toAcquisitionDropdownItem } from '../../lib/acquisition'

const ADD_MENU_KINDS = CLASS_FEATURE_KINDS.filter(featureRowShowsInAddMenu)

export function ClassFeatureAddMenu({
  features,
  className,
  classSlug,
  onAddRows,
}: {
  features: FeatureRowForm[] | undefined
  className: string
  classSlug: string
  onAddRows: (rows: FeatureRowForm[]) => void
}) {
  const items = ADD_MENU_KINDS.map((kind) =>
    toAcquisitionDropdownItem({
      id: kind,
      label: CLASS_FEATURE_KIND_ENTRIES[kind].label,
      description: {
        status: 'ready',
        text: CLASS_FEATURE_KIND_ENTRIES[kind].description,
      },
      availability:
        kind === 'subclass-choice' && classSubclassChoiceAtOccurrenceLimit(features ?? [])
          ? {
              status: 'unavailable',
              code: 'occurrence',
              message: classValidationMessages.subclassChoiceFeatureDuplicate(),
            }
          : { status: 'available' },
    }),
  )

  return (
    <ButtonDropdown
      label="Add feature"
      triggerPresentation="addIcon"
      supportingWrap
      groups={[]}
      items={items}
      onSelectItem={(itemId) => {
        if (!isClassFeatureKind(itemId) || !featureRowShowsInAddMenu(itemId)) return
        const kind = itemId
        if (kind === 'custom') {
          onAddRows([
            { name: '', level: 1, grants: [], tables: [], available: true, kind: 'custom' },
          ])
          return
        }
        if (kind === 'asi') {
          onAddRows([featureToFormRow(createAsiFeature(1))])
          return
        }
        if (kind === 'subclass-choice' && !classSubclassChoiceAtOccurrenceLimit(features ?? [])) {
          onAddRows([
            featureToFormRow(
              createSubclassChoiceFeature({
                classSlug: classSlug || 'new-class',
                className: className || 'New Class',
              }),
            ),
          ])
        }
      }}
    />
  )
}
