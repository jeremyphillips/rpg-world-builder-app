import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { ContentFormPageShell } from '@/features/content/lib/forms/shells/layout/content-form-page-shell'
import {
  messagesWorkspaceBodyClasses,
  messagesWorkspaceRootClasses,
} from '@/features/message/components/workspace/messages-workspace.variants'

import { pageShellInsetTopClasses } from '../page/page-spacing.variants'
import { PageShell } from '../page/page-shell'
import { viewportWorkspaceClasses } from '../page/viewport-workspace.variants'
import { ViewportWorkspace } from '../page/viewport-workspace'
import {
  VIEWPORT_WORKSPACE_FILL_ATTR,
  VIEWPORT_WORKSPACE_FILL_VALUE,
} from '../page/viewport-workspace.variants'

function appShellSource(): string {
  return readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'app-shell.tsx'), 'utf8')
}

/**
 * Document scroll is the default. Ordinary routes never establish a vertical scrollport.
 * ViewportWorkspace is the bounded exception for multi-pane editors.
 */
describe('AppShell route scroll ownership', () => {
  it('maps the app shell to dash-app-shell blocks', () => {
    expect(appShellSource()).toContain('className="dash-app-shell"')
    expect(appShellSource()).toContain('className="dash-app-shell__column"')
    expect(appShellSource()).toContain('className="dash-app-shell__main"')
  })

  it('main is a flex column participant but not a scrollport', () => {
    const { container } = render(
      <main className="dash-app-shell__main">
        <p>Body</p>
      </main>,
    )
    const main = container.querySelector('main')
    expect(main).toHaveClass('dash-app-shell__main')
    expect(main).not.toHaveClass('overflow-y-auto')
  })

  it('html, body, and #root are not viewport-locked in the dashboard mount', () => {
    document.body.innerHTML = '<div id="root"></div>'

    expect(document.documentElement.className).not.toMatch(/overflow-hidden|h-full|h-dvh/)
    expect(document.body.className).not.toMatch(/overflow-hidden|h-full|h-dvh/)
    expect(document.getElementById('root')?.className ?? '').not.toMatch(
      /overflow-hidden|h-full|h-dvh/,
    )
  })

  it('PageShell full width has no overflow classes', () => {
    const { container } = render(
      <PageShell width="full">
        <p>Body</p>
      </PageShell>,
    )
    const root = container.firstElementChild
    expect(root).not.toHaveClass('overflow-y-auto', 'overflow-hidden')
  })

  it('PageShell narrow width has no overflow classes', () => {
    const { container } = render(
      <PageShell width="narrow">
        <p>Body</p>
      </PageShell>,
    )
    const root = container.firstElementChild
    expect(root).not.toHaveClass('overflow-y-auto', 'overflow-hidden')
  })

  it('ContentFormPageShell uses ViewportWorkspace without shell inset on the width shell', () => {
    const { container } = render(
      <ContentFormPageShell scrollMode="viewport" pageWidth="wide">
        <p>Form</p>
      </ContentFormPageShell>,
    )
    const workspace = container.firstElementChild
    expect(workspace).toHaveClass(...viewportWorkspaceClasses.split(/\s+/).filter(Boolean))

    const widthShell = workspace?.firstElementChild
    expect(widthShell).not.toHaveClass('pt-8', 'pb-8')
  })

  it('defines viewport lock on dash-app-shell column and main for ViewportWorkspace routes', () => {
    expect(appShellSource()).toContain('dash-app-shell__column')
    expect(appShellSource()).toContain('dash-app-shell__main')
  })

  it('documents messages workspace as a ViewportWorkspace pane', () => {
    expect(messagesWorkspaceRootClasses).toContain('min-h-0')
    expect(messagesWorkspaceRootClasses).toContain('flex-1')
    expect(messagesWorkspaceBodyClasses).toContain('overflow-hidden')
  })

  it('ContentFormPageShell document mode does not mount ViewportWorkspace', () => {
    const { container } = render(
      <ContentFormPageShell scrollMode="document" pageWidth="narrow">
        <p>Form</p>
      </ContentFormPageShell>,
    )
    const root = container.firstElementChild
    expect(root).not.toHaveClass(...viewportWorkspaceClasses.split(/\s+/).filter(Boolean))
    expect(root).toHaveClass(...pageShellInsetTopClasses.split(/\s+/))
  })

  it('ViewportWorkspace is a bounded workspace that flex-fills main', () => {
    const { container } = render(
      <ViewportWorkspace>
        <p>Body</p>
      </ViewportWorkspace>,
    )
    const root = container.firstElementChild
    expect(root).toHaveClass(...viewportWorkspaceClasses.split(/\s+/).filter(Boolean))
    expect(root).toHaveAttribute(VIEWPORT_WORKSPACE_FILL_ATTR, VIEWPORT_WORKSPACE_FILL_VALUE)
  })
})
