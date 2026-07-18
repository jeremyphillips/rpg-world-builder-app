import { describe, expect, it } from 'vitest'

import {
  NAME_SUBJECT_KIND_ENTRIES,
  NAME_SUBJECT_KIND_UI_IDS,
  NAME_SUBJECT_KINDS,
} from './subject-kind'

describe('name subject kind vocabulary', () => {
  it('keeps UI entry keys within the full subject kind enum', () => {
    for (const kind of NAME_SUBJECT_KIND_UI_IDS) {
      expect(NAME_SUBJECT_KINDS).toContain(kind)
    }
  })

  it('labels every UI entry', () => {
    for (const kind of NAME_SUBJECT_KIND_UI_IDS) {
      expect(NAME_SUBJECT_KIND_ENTRIES[kind].label.length).toBeGreaterThan(0)
    }
  })
})
