/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'

import {
  DIALOG_INITIAL_FOCUS_SELECTOR,
  focusDialogInitialTarget,
  handleDialogOpenAutoFocus,
  isDialogFocusTarget,
} from './dialog-focus.lib'

function createFocusEvent(panel: HTMLElement): Event {
  return {
    preventDefault: () => undefined,
    defaultPrevented: false,
    currentTarget: panel,
  } as unknown as Event
}

describe('dialog focus policy', () => {
  it('focuses the panel when no explicit target exists', () => {
    document.body.innerHTML = `
      <div id="panel" tabindex="-1">
        <button type="button" id="action">Action</button>
      </div>
    `

    const panel = document.getElementById('panel') as HTMLElement
    focusDialogInitialTarget(createFocusEvent(panel))

    expect(document.activeElement).toBe(panel)
  })

  it('focuses an explicit data-dialog-initial-focus target when focusable', () => {
    document.body.innerHTML = `
      <div id="panel" tabindex="-1">
        <input id="field" data-dialog-initial-focus />
        <button type="button">Action</button>
      </div>
    `

    const panel = document.getElementById('panel') as HTMLElement
    const field = document.getElementById('field') as HTMLElement
    focusDialogInitialTarget(createFocusEvent(panel))

    expect(document.activeElement).toBe(field)
  })

  it('falls back to the panel when the explicit target is disabled', () => {
    document.body.innerHTML = `
      <div id="panel" tabindex="-1">
        <input id="field" data-dialog-initial-focus disabled />
      </div>
    `

    const panel = document.getElementById('panel') as HTMLElement
    focusDialogInitialTarget(createFocusEvent(panel))

    expect(document.activeElement).toBe(panel)
  })

  it('falls back to the panel when the explicit target has tabindex -1', () => {
    document.body.innerHTML = `
      <div id="panel" tabindex="-1">
        <div id="field" data-dialog-initial-focus tabindex="-1"></div>
      </div>
    `

    const panel = document.getElementById('panel') as HTMLElement
    focusDialogInitialTarget(createFocusEvent(panel))

    expect(document.activeElement).toBe(panel)
  })

  it('treats disabled and negative tabindex targets as unfocusable', () => {
    document.body.innerHTML = `
      <button id="disabled" disabled></button>
      <div id="negative" tabindex="-1"></div>
      <input id="focusable" />
    `

    expect(isDialogFocusTarget(document.getElementById('disabled') as HTMLElement)).toBe(false)
    expect(isDialogFocusTarget(document.getElementById('negative') as HTMLElement)).toBe(false)
    expect(isDialogFocusTarget(document.getElementById('focusable') as HTMLElement)).toBe(true)
  })

  it('respects consumer preventDefault on handleDialogOpenAutoFocus', () => {
    document.body.innerHTML = `<div id="panel" tabindex="-1"><button>Action</button></div>`
    const panel = document.getElementById('panel') as HTMLElement
    const event = {
      preventDefault() {
        ;(this as { defaultPrevented: boolean }).defaultPrevented = true
      },
      defaultPrevented: false,
      currentTarget: panel,
    } as unknown as Event

    handleDialogOpenAutoFocus(event, (nextEvent) => {
      nextEvent.preventDefault()
    })

    expect(event.defaultPrevented).toBe(true)
    expect(document.activeElement).not.toBe(panel)
  })

  it('exports the initial-focus selector contract', () => {
    expect(DIALOG_INITIAL_FOCUS_SELECTOR).toBe('[data-dialog-initial-focus]')
  })
})
