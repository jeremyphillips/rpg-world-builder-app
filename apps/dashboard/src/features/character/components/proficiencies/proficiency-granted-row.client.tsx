'use client'

import type { ProficiencyGrantedRow as ProficiencyGrantedRowModel } from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { BuilderInventoryRow } from '../builder/builder-inventory-row.client'

export type ProficiencyGrantedRowProps = {
  row: ProficiencyGrantedRowModel
}

export function ProficiencyGrantedRow({ row }: ProficiencyGrantedRowProps) {
  return (
    <BuilderInventoryRow label={<Text as="span">{row.label}</Text>} sourceLabel={row.sourceLabel} />
  )
}
