import type { ReactNode } from 'react'

export type CatalogColumn<Row> = {
  header: string
  cell: (row: Row) => ReactNode
}

export function CatalogTable<Row extends { key: string }>({
  columns,
  rows,
}: {
  columns: CatalogColumn<Row>[]
  rows: Row[]
}) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b text-left">
          {columns.map((column) => (
            <th key={column.header} scope="col" className="py-2 pr-4 font-medium last:pr-0">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b align-top">
            {columns.map((column) => (
              <td key={column.header} className="py-3 pr-4 last:pr-0">
                {column.cell(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
