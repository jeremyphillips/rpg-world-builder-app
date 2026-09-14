import type { ContentSource, ContentStatus, ResolvedSubclass } from '@rpg/contracts'

import type { MasterDetailEditorIdentity } from '../../../components/master-detail/master-detail-editor-shell'
import type { MasterDetailAvailabilityPresentation } from '../../../lib/master-detail/master-detail-availability.types'
import {
  isDraftSubclassId,
  isSubclassDeletable,
  UNTITLED_SUBCLASS_LABEL,
} from './subclass-editor-constants'
import type { SubclassFormValues } from './subclass-form-fields'
import type { SubclassListItem } from './subclass-editor-state'

const SOURCE_BADGE_LABEL = {
  system: 'System',
  homebrew: 'Homebrew',
  unsaved: 'Unsaved',
} as const

export function resolveSubclassSourceLabel(
  subclassId: string,
  source: ContentSource,
  status: ContentStatus,
): string {
  const listSource =
    isDraftSubclassId(subclassId) || (source === 'homebrew' && status === 'draft')
      ? 'unsaved'
      : source

  return SOURCE_BADGE_LABEL[listSource]
}

function resolveSubclassSelectionSource(
  selectedId: string,
  selectedEntity: ResolvedSubclass | undefined,
): ContentSource {
  if (selectedEntity?.source) return selectedEntity.source
  return isDraftSubclassId(selectedId) ? 'homebrew' : 'system'
}

function resolveSubclassSelectionStatus(
  selectedId: string,
  selectedEntity: ResolvedSubclass | undefined,
): ContentStatus {
  if (selectedEntity?.status) return selectedEntity.status
  return isDraftSubclassId(selectedId) ? 'draft' : 'published'
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
  onAvailabilityChange: () => void
}): MasterDetailEditorIdentity | undefined {
  if (!selectedId || !selectedValues || !selectedAvailability || !selectedListItem) {
    return undefined
  }

  const source = resolveSubclassSelectionSource(selectedId, selectedEntity)
  const status = resolveSubclassSelectionStatus(selectedId, selectedEntity)

  return {
    title: resolveSubclassDisplayName(selectedValues, selectedListItem),
    meta: {
      ...(modifiedIds.has(selectedId) ? { eyebrow: 'Modified' } : {}),
      sourceLabel: resolveSubclassSourceLabel(selectedId, source, status),
    },
    deletable: isSubclassDeletable(source, selectedId),
    availability: selectedAvailability,
    onAvailabilityChange,
  }
}
