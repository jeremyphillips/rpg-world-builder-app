/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import { performInvalidSubmitFocus } from './navigate-invalid-submit-focus.lib'
import type { InvalidSubmitNavigation } from '../errors/resolve-invalid-submit-navigation'

function mockElement({
  id,
  focusable = true,
}: {
  id?: string
  focusable?: boolean
} = {}): HTMLElement {
  const element = document.createElement('div')
  if (id) element.id = id
  if (focusable) {
    element.focus = vi.fn()
  }
  element.scrollIntoView = vi.fn()
  if (id) document.body.appendChild(element)
  return element
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('performInvalidSubmitFocus', () => {
  it('focuses the resolved control id first', () => {
    const control = mockElement({ id: 'form-notes' })
    const navigation = {
      firstIssue: { path: 'notes', message: 'Required', severity: 'field' as const },
      expandKeys: [],
      focusControlId: 'form-notes',
    } satisfies InvalidSubmitNavigation

    performInvalidSubmitFocus(navigation, 'form')

    expect(control.focus).toHaveBeenCalled()
  })

  it('falls back to a top-level scalar control id', () => {
    const control = mockElement({ id: 'form-identity-notes' })
    const navigation = {
      firstIssue: { path: 'notes', message: 'Required', severity: 'field' as const },
      expandKeys: [],
    } satisfies InvalidSubmitNavigation

    performInvalidSubmitFocus(navigation, 'form-identity')

    expect(control.focus).toHaveBeenCalled()
  })

  it('focuses the first eligible control inside an array row', () => {
    const row = document.createElement('div')
    row.setAttribute('data-array-item-prefix', 'grants.0')
    row.scrollIntoView = vi.fn()
    const input = document.createElement('input')
    input.focus = vi.fn()
    row.appendChild(input)
    document.body.appendChild(row)

    const navigation = {
      firstIssue: {
        path: 'grants.0.label',
        message: 'Required',
        severity: 'field' as const,
        itemPrefix: 'grants.0',
      },
      expandKeys: [],
    } satisfies InvalidSubmitNavigation

    performInvalidSubmitFocus(navigation, 'form-grants')

    expect(input.focus).toHaveBeenCalled()
  })

  it('falls back to the tab panel and trigger selectors', () => {
    const panel = document.createElement('div')
    panel.setAttribute('data-tab-panel', 'notes')
    panel.focus = vi.fn()
    panel.scrollIntoView = vi.fn()
    document.body.appendChild(panel)

    const navigation = {
      firstIssue: { path: 'notes', message: 'Required', severity: 'field' as const },
      expandKeys: [],
    } satisfies InvalidSubmitNavigation

    performInvalidSubmitFocus(navigation, 'form', {
      tabPanelSelector: '[data-tab-panel="notes"]',
      tabTriggerSelector: '[data-tab-trigger="notes"]',
    })

    expect(panel.focus).toHaveBeenCalled()
  })
})
