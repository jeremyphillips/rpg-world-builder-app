import type { CatalogLayer, ResolvedSubclass } from '@rpg/contracts'

import type { MasterDetailEditorIdentity } from '../../../components/master-detail/master-detail-editor-shell'
import type { MasterDetailItemMeta } from '../../../lib/master-detail/master-detail-item-meta'
import type { MasterDetailAvailabilityPresentation } from '../../../lib/master-detail/master-detail-availability.types'
import {
  isDraftSubclassId,
  isSubclassDeletable,
  UNTITLED_SUBCLASS_LABEL,
} from './subclass-editor-constants'
import type { SubclassFormValues } from './subclass-form-fields'
import type { SubclassListItem } from './subclass-editor-state'

export function subclassMasterDetailMeta(
  subclassId: string,
  source: CatalogLayer | 'unsaved',
  modified: boolean,
): MasterDetailItemMeta {
  return {
    provenance: source === 'system' ? 'system' : 'homebrew',
    persistence: source === 'unsaved' || isDraftSubclassId(subclassId) ? 'new' : 'persisted',
    ...(modified ? { eyebrow: 'Modified' as const } : {}),
  }
}

function resolveSubclassSelectionSource(
  selectedId: string,
  selectedEntity: ResolvedSubclass | undefined,
): CatalogLayer {
  if (selectedEntity?.catalogLayer) return selectedEntity.catalogLayer
  return isDraftSubclassId(selectedId) ? 'homebrew' : 'system'
}

function resolveSubclassDisplayName(
  selectedValues: SubclassFormValues,
  selectedListItem: SubclassListItem,
): string {
  const trimmedName = selectedValues.name?.trim()
  if (trimmedName) return trimmedName
  if (selectedListItem.name) return selectedListItem.name
  return UNTITLED_SUBCLASS_LABEL
}

export function buildSubclassSelectedIdentity({
  selectedId,
  selectedValues,
  selectedListItem,
  selectedEntity,
  selectedAvailability,
  modifiedIds,
  onAvailabilityChange,
}: {
  selectedId: string | null
  selectedValues: SubclassFormValues | null
  selectedListItem: SubclassListItem | undefined
  selectedEntity: ResolvedSubclass | undefined
  selectedAvailability: MasterDetailAvailabilityPresentation | undefined
  modifiedIds: ReadonlySet<string>
  onAvailabilityChange?: () => void
}): MasterDetailEditorIdentity | undefined {
  if (!selectedId || !selectedValues || !selectedAvailability || !selectedListItem) {
    return undefined
  }

  const source = resolveSubclassSelectionSource(selectedId, selectedEntity)

  return {
    title: resolveSubclassDisplayName(selectedValues, selectedListItem),
    meta: subclassMasterDetailMeta(
      selectedId,
      selectedListItem.catalogLayer,
      modifiedIds.has(selectedId),
    ),
    deletable: isSubclassDeletable(source, selectedId),
    availability: selectedAvailability,
    onAvailabilityChange,
  }
}
