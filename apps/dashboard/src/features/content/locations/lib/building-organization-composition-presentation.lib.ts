import type { CreateCompositionSummaryRow } from '@/lib/create-flow'

import {
  BUILDING_ORGANIZATION_COMPOSER_CHANGE_LABEL,
  type BuildingOrganizationComposerSummaryRow,
  type BuildingOrganizationComposerView,
} from './building-organizations-create-tab-controller.lib'

export function mapBuildingOrganizationCompositionSummaryRows(input: {
  composerView: BuildingOrganizationComposerView
  startEditingRelationship: () => void
  startEditingOrganization: () => void
}): CreateCompositionSummaryRow[] {
  const { composerView, startEditingRelationship, startEditingOrganization } = input

  return composerView.summaryRows.map((row) =>
    mapBuildingOrganizationCompositionSummaryRow(row, composerView, {
      startEditingRelationship,
      startEditingOrganization,
    }),
  )
}

function mapBuildingOrganizationCompositionSummaryRow(
  row: BuildingOrganizationComposerSummaryRow,
  composerView: BuildingOrganizationComposerView,
  handlers: {
    startEditingRelationship: () => void
    startEditingOrganization: () => void
  },
): CreateCompositionSummaryRow {
  const showChange =
    row.decision === 'relationship'
      ? composerView.showRelationshipChange
      : composerView.showOrganizationChange
  const onChange =
    row.decision === 'relationship'
      ? handlers.startEditingRelationship
      : handlers.startEditingOrganization

  if (!showChange) {
    return {
      id: row.id,
      label: row.label,
      value: row.value,
    }
  }

  const valueActionAriaLabel = `Change ${row.label.toLowerCase()}`

  return {
    id: row.id,
    label: row.label,
    value: row.value,
    onChange,
    changeLabel: BUILDING_ORGANIZATION_COMPOSER_CHANGE_LABEL,
    valueActionAriaLabel,
  }
}
