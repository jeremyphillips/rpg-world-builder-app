import { ButtonDropdown } from '@rpg/ui'

import {
  CLASS_FEATURE_ACQUISITION_LABELS,
  canAddSubclassChoiceFeature,
} from '../lib/class-feature-authoring'
import { type FeatureRowForm } from '../lib/class-feature-form-fields'
import { createAsiFeature } from '../lib/class-asi-features'
import { createSubclassChoiceFeature } from '../lib/class-subclass-choice-features'
import { featureToFormRow } from '../lib/class-feature-form-fields'

const ADD_MENU_KINDS = ['custom', 'asi', 'subclass-choice'] as const

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
  const items = ADD_MENU_KINDS.map((kind) => ({
    id: kind,
    label: CLASS_FEATURE_ACQUISITION_LABELS[kind],
    disabled: kind === 'subclass-choice' ? !canAddSubclassChoiceFeature(features) : false,
  }))

  return (
    <ButtonDropdown
      label="Add feature"
      triggerPresentation="addIcon"
      groups={[]}
      items={items}
      onSelectItem={(itemId) => {
        const kind = itemId as (typeof ADD_MENU_KINDS)[number]
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
        if (kind === 'subclass-choice' && canAddSubclassChoiceFeature(features)) {
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
