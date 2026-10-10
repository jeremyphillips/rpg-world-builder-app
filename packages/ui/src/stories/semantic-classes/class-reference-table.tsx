import type { ReactNode } from 'react'

import { CatalogTable, type CatalogColumn } from './catalog-table'

export type ClassReferenceSpec = {
  key: string
  sample: ReactNode
  propsLabel: string
  className: string
  keyValues: string
  useCase?: string
}

const CLASS_REFERENCE_COLUMNS: CatalogColumn<ClassReferenceSpec>[] = [
  { header: 'Sample', cell: (row) => row.sample },
  {
    header: 'Props',
    cell: (row) => <span className="font-mono text-xs">{row.propsLabel}</span>,
  },
  {
    header: 'Classes',
    cell: (row) => <span className="font-mono text-xs">{row.className}</span>,
  },
  { header: 'Key values', cell: (row) => row.keyValues },
  { header: 'Use case', cell: (row) => row.useCase ?? '—' },
]

export function ClassReferenceTable({ rows }: { rows: ClassReferenceSpec[] }) {
  return <CatalogTable columns={CLASS_REFERENCE_COLUMNS} rows={rows} />
}
