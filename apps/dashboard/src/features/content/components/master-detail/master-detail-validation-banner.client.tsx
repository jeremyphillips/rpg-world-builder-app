'use client'

import { Text } from '@rpg/ui'

import { MASTER_DETAIL_UNSELECTED_ROW_ERROR_MESSAGE } from '../lib/master-detail/master-detail-constants'

export interface MasterDetailValidationBannerProps {
  visible: boolean
}

/**
 * Surfaces validation errors on unselected master-detail list rows after a
 * failed submit. Pair with `showMasterDetailUnselectedRowErrors` and per-row
 * `hasError` on `MasterDetailListPanel` items.
 */
export function MasterDetailValidationBanner({ visible }: MasterDetailValidationBannerProps) {
  if (!visible) return null

  return (
    <Text variant="destructive" role="alert" className="text-sm">
      {MASTER_DETAIL_UNSELECTED_ROW_ERROR_MESSAGE}
    </Text>
  )
}
