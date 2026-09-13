import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { ContentFormPageShell } from '@/features/content/lib/forms/shells/layout/content-form-page-shell'
import {
  messagesWorkspaceBodyClasses,
  messagesWorkspaceRootClasses,
} from '@/features/message/components/workspace/messages-workspace.variants'

import { NarrowPage } from '../page/narrow-page'
import {
  PAGE_SCROLL_CONTAINER_ATTR,
  PAGE_SCROLL_CONTAINER_VALUE,
  pageScrollFillWrapperClasses,
  pageScrollShellClasses,
  pageScrollStickyFooterClearanceClasses,
  viewportShellClasses,
} from '../page/page-scroll.variants'
import { PageScrollShell } from '../page/page-scroll-shell'
import { ViewportShell } from '../page/viewport-shell'
import { WidePage } from '../page/wide-page'
import { appShellMainClasses } from './app-shell.variants'

/**
 * AppShell `<main>` is a permanent frame (`overflow-hidden`). Route-level mode roots
 * own scroll semantics beneath it:
 *
 * - `PageScrollShell` — route scrollport (`overflow-y-auto`)
 * - `ViewportShell` — route scroll boundary (`overflow-hidden`)
 * - `messagesWorkspaceRootClasses` — messages workspace custom viewport shell
 */
describe('AppShell route scroll ownership', () => {
  it('main is a non-scrolling frame', () => {
    expect(appShellMainClasses).toContain('overflow-hidden')
    expect(appShellMainClasses).not.toContain('overflow-y-auto')
  })

  it('PageScrollShell is the route scrollport with a separate fill wrapper', () => {
    const { container } = render(
      <MemoryRouter>
        <PageScrollShell>
          <p>Body</p>
        </PageScrollShell>
      </MemoryRouter>,
    )

    const scrollport = container.querySelector(
      `[${PAGE_SCROLL_CONTAINER_ATTR}="${PAGE_SCROLL_CONTAINER_VALUE}"]`,
    )
    expect(scrollport).toHaveClass(...pageScrollShellClasses.split(/\s+/))
    expect(scrollport).toHaveClass(pageScrollStickyFooterClearanceClasses)
    expect(scrollport?.firstElementChild).toHaveClass(...pageScrollFillWrapperClasses.split(/\s+/))
  })

  it('WidePage has no overflow classes', () => {
    const { container } = render(
      <WidePage>
        <p>Body</p>
      </WidePage>,
    )
    const root = container.firstElementChild
    expect(root).not.toHaveClass('overflow-y-auto', 'overflow-hidden')
  })

  it('NarrowPage has no overflow classes', () => {
    const { container } = render(
      <NarrowPage>
        <p>Body</p>
      </NarrowPage>,
    )
    const root = container.firstElementChild
    expect(root).not.toHaveClass('overflow-y-auto', 'overflow-hidden')
  })

  it('ContentFormPageShell uses ViewportShell fill chain without shell inset on the width shell', () => {
    const { container } = render(
      <ContentFormPageShell usePreviewLayout>
        <p>Form</p>
      </ContentFormPageShell>,
    )
    const boundary = container.firstElementChild
    expect(boundary).toHaveClass(...viewportShellClasses.split(/\s+/))
    expect(boundary?.firstElementChild).toHaveClass('flex-1', 'min-h-0')

    const widthShell = boundary?.firstElementChild?.firstElementChild
    expect(widthShell).not.toHaveClass('pt-8', 'pb-8')
  })

  it('documents messages workspace as a viewport shell exception', () => {
    expect(messagesWorkspaceRootClasses).toContain('flex-1')
    expect(messagesWorkspaceBodyClasses).toContain('overflow-hidden')
  })

  it('ViewportShell is the route scroll boundary', () => {
    const { container } = render(
      <ViewportShell>
        <p>Body</p>
      </ViewportShell>,
    )
    expect(container.firstElementChild).toHaveClass(...viewportShellClasses.split(/\s+/))
  })
})
