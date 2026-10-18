import type { ReactElement } from 'react'

/** Title-band utility (grip, checkbox, granted icon) — aligns with the heading row. */
export type EntityAnatomyTitleLeading = {
  kind: 'title'
  content: ReactElement
}

/** Picker single-choice radio — centers on the row like trailing utility chrome. */
export type EntityAnatomySelectionLeading = {
  kind: 'selection'
  content: ReactElement
}

export type EntityAnatomyLeading = EntityAnatomyTitleLeading | EntityAnatomySelectionLeading
