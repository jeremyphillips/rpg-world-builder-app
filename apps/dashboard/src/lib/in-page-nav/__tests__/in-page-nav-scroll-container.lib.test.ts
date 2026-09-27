/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest'

import {
  IN_PAGE_SECTION_NAV_PANEL_ATTR,
  isInPageNavScrollContainer,
  resolveInPageNavScrollContainer,
} from '../in-page-nav-scroll-container.lib'

describe('resolveInPageNavScrollContainer', () => {
  it('returns a nested overflow scrollport instead of the document', () => {
    const scrollport = document.createElement('div')
    scrollport.style.overflowY = 'auto'
    Object.defineProperty(scrollport, 'scrollHeight', { value: 400, configurable: true })
    Object.defineProperty(scrollport, 'clientHeight', { value: 200, configurable: true })

    const anchor = document.createElement('div')
    anchor.id = 'section-a'
    scrollport.append(anchor)
    document.body.append(scrollport)

    expect(resolveInPageNavScrollContainer(anchor)).toBe(scrollport)

    scrollport.remove()
  })

  it('skips the in-page section nav panel when searching for a scrollport', () => {
    const scrollport = document.createElement('div')
    scrollport.style.overflowY = 'auto'
    Object.defineProperty(scrollport, 'scrollHeight', { value: 400, configurable: true })
    Object.defineProperty(scrollport, 'clientHeight', { value: 200, configurable: true })

    const navPanel = document.createElement('nav')
    navPanel.setAttribute(IN_PAGE_SECTION_NAV_PANEL_ATTR, '')
    Object.defineProperty(navPanel, 'scrollHeight', { value: 400, configurable: true })
    Object.defineProperty(navPanel, 'clientHeight', { value: 100, configurable: true })

    const anchor = document.createElement('div')
    anchor.id = 'leaf-a'
    scrollport.append(navPanel, anchor)
    document.body.append(scrollport)

    expect(isInPageNavScrollContainer(navPanel)).toBe(false)
    expect(resolveInPageNavScrollContainer(anchor)).toBe(scrollport)

    scrollport.remove()
  })
})
