'use client'

import { AnatomyFieldRowCluster, type RowFieldItem } from '@rpg/ui/form'

/** Dashboard wrapper for the shared anatomy row range cluster slot. */
export function MonsterAttackRangeClusterSlot({
  idPrefix,
  namePrefix,
  fields,
}: {
  idPrefix: string
  namePrefix?: string
  fields: readonly RowFieldItem[]
}) {
  return (
    <AnatomyFieldRowCluster
      idPrefix={idPrefix}
      namePrefix={namePrefix}
      fields={fields}
      gap="compact"
    />
  )
}
