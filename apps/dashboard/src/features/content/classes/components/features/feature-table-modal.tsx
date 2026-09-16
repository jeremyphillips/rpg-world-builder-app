import { Modal } from '@rpg/ui'

import {
  FEATURE_TABLE_MODAL_CREATE_TITLE,
  FEATURE_TABLE_MODAL_EDIT_TITLE,
} from './feature-tables-section-copy'

export type FeatureTableModalMode = 'create' | 'edit'

export type FeatureTableModalProps = {
  open: boolean
  mode: FeatureTableModalMode
  onOpenChange: (open: boolean) => void
}

function resolveFeatureTableModalTitle(mode: FeatureTableModalMode): string {
  return mode === 'create' ? FEATURE_TABLE_MODAL_CREATE_TITLE : FEATURE_TABLE_MODAL_EDIT_TITLE
}

export function FeatureTableModal({ open, mode, onOpenChange }: FeatureTableModalProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="xl" layout="stable" stableSize="tall">
        <Modal.Header headline={resolveFeatureTableModalTitle(mode)} />
        <Modal.Body />
      </Modal.Content>
    </Modal.Root>
  )
}
