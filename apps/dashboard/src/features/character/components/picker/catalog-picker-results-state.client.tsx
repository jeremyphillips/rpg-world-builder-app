'use client'

import { InsetPanel } from '@rpg/ui'

export type CatalogPickerResultsStateProps = {
  message: string
}

/** Dashed empty-state panel for catalog pickers when there are no selectable rows. */
export function CatalogPickerResultsState({ message }: CatalogPickerResultsStateProps) {
  return (
    <InsetPanel
      borderStyle="dashed"
      surface={{}}
      size="md"
      align="center"
      className="py-8"
      role="status"
    >
      <InsetPanel.Text>{message}</InsetPanel.Text>
    </InsetPanel>
  )
}
