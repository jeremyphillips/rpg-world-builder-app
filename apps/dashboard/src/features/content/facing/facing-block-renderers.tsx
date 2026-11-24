import type { ComponentProps } from 'react'
import type { FacingBody } from '@rpg/ui'

import { ContentTableView } from '../components/tables/content-table-view'

/** Required block adapters for dashboard facing hosts. */
export const facingBlockRenderers: Required<
  Pick<ComponentProps<typeof FacingBody>, 'renderTable'>
> = {
  renderTable: (table) => <ContentTableView table={table} />,
}
