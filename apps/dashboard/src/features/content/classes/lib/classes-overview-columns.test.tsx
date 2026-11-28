// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import type { ClassListItem } from '@rpg/contracts'
import { getClassBySlug } from '@rpg/catalog/classes'

import { CLASS_EDIT_SUBCLASSES_TAB, classEditSubclassesHref } from './class-edit-navigation.lib'
import { classColumns } from './classes-overview-columns'
import { CONTENT_FORM_TAB_SEARCH_PARAM } from '../../lib/forms/shells/layout/content-form-tab-search.lib'

describe('classes overview subclass overlay warning', () => {
  it('links to the subclasses tab with count copy', () => {
    const campaignId = 'camp-1'
    const classId = 'class-fighter'
    const row: ClassListItem = {
      ...getClassBySlug('srd-cc-5.2.1', 'fighter')!,
      subclasses: [],
      unresolvedSubclassOverlayCount: 2,
    }

    const columns = classColumns(campaignId)
    const subclassesColumn = columns.find((col) => col.id === 'subclasses')
    expect(subclassesColumn).toBeDefined()
    if (!subclassesColumn?.cell || typeof subclassesColumn.cell !== 'function') {
      throw new Error('expected subclasses column cell')
    }

    const cell = subclassesColumn.cell({
      row: {
        original: row,
        getValue: (key: string) => (key === 'subclasses' ? row.subclasses.length : undefined),
      },
    } as never)

    render(<MemoryRouter>{cell}</MemoryRouter>)

    const link = screen.getByRole('link', { name: /2 unresolved subclass overlays — manage/i })
    expect(link.getAttribute('href')).toBe(classEditSubclassesHref(campaignId, classId))
    expect(link.getAttribute('href')).toContain(
      `${CONTENT_FORM_TAB_SEARCH_PARAM}=${CLASS_EDIT_SUBCLASSES_TAB}`,
    )
  })
})
