import type { ConnectionTopLevelSectionId } from './connection-section-catalog'

export type ConnectionSheetEditCopy = {
  editLabel: string
  removeLabel: string
  modalTitle: string
  addModalTitle: string
}

export const CONNECTION_SHEET_EDIT_COPY: Record<
  ConnectionTopLevelSectionId,
  ConnectionSheetEditCopy
> = {
  people: {
    editLabel: 'Edit relationship',
    removeLabel: 'Remove relationship',
    modalTitle: 'Edit relationship',
    addModalTitle: 'Add person connection',
  },
  organizations: {
    editLabel: 'Edit membership',
    removeLabel: 'Remove membership',
    modalTitle: 'Edit membership',
    addModalTitle: 'Add organization connection',
  },
  places: {
    editLabel: 'Edit residence',
    removeLabel: 'Remove residence',
    modalTitle: 'Edit residence',
    addModalTitle: 'Add place connection',
  },
  property: {
    editLabel: 'Edit ownership',
    removeLabel: 'Remove ownership',
    modalTitle: 'Edit ownership',
    addModalTitle: 'Add property connection',
  },
}

export function resolveConnectionSheetEditCopy(
  sectionId: ConnectionTopLevelSectionId,
): ConnectionSheetEditCopy {
  return CONNECTION_SHEET_EDIT_COPY[sectionId]
}
