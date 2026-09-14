import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { ContentFormPageShell } from '@/features/content/lib/forms/shells/layout/content-form-page-shell'
import {
  messagesWorkspaceBodyClasses,
  messagesWorkspaceRootClasses,
} from '@/features/message/components/workspace/messages-workspace.variants'

import { NarrowPage } from '../page/narrow-page'
import { viewportWorkspaceClasses } from '../page/viewport-workspace.variants'
import { ViewportWorkspace } from '../page/viewport-workspace'
import { WidePage } from '../page/wide-page'
import {
  appShellContentColumnClasses,
  appShellMainClasses,
  appShellRootClasses,
} from './app-shell.variants'
import {
  VIEWPORT_WORKSPACE_FILL_ATTR,
  VIEWPORT_WORKSPACE_FILL_VALUE,
} from '../page/viewport-workspace.variants'

/**
 * Document scroll is the default. Ordinary routes never establish a vertical scrollport.
 * ViewportWorkspace is the bounded exception for multi-pane editors.
 */
describe('AppShell route scroll ownership', () => {
  it('does not lock the document on the app shell root', () => {
    expect(appShellRootClasses).toContain('min-h-dvh')
    expect(appShellRootClasses).not.toContain('overflow-hidden')
    expect(appShellRootClasses).not.toMatch(/(?:^|\s)h-dvh(?:\s|$)/)
    expect(appShellRootClasses).not.toContain('max-h-dvh')
  })

  it('main is a flex column participant but not a scrollport', () => {
    expect(appShellMainClasses).toContain('min-w-0')
    expect(appShellMainClasses).toContain('flex-1')
    expect(appShellMainClasses).toContain('flex-col')
    expect(appShellMainClasses).toContain('min-h-0')
    expect(appShellMainClasses).not.toContain('overflow-y-auto')
    expect(appShellMainClasses).toContain('has-[[data-viewport-fill=workspace]]:overflow-hidden')
    expect(appShellMainClasses).not.toContain('min-h-full')
    expect(appShellMainClasses).not.toContain('h-full')
  })

  it('html, body, and #root are not viewport-locked in the dashboard mount', () => {
    document.body.innerHTML = '<div id="root"></div>'

    expect(document.documentElement.className).not.toMatch(/overflow-hidden|h-full|h-dvh/)
    expect(document.body.className).not.toMatch(/overflow-hidden|h-full|h-dvh/)
    expect(document.getElementById('root')?.className ?? '').not.toMatch(
      /overflow-hidden|h-full|h-dvh/,
    )
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

  it('ContentFormPageShell uses ViewportWorkspace without shell inset on the width shell', () => {
    const { container } = render(
      <ContentFormPageShell usePreviewLayout>
        <p>Form</p>
      </ContentFormPageShell>,
    )
    const workspace = container.firstElementChild
    expect(workspace).toHaveClass(...viewportWorkspaceClasses.split(/\s+/).filter(Boolean))

    const widthShell = workspace?.firstElementChild
    expect(widthShell).not.toHaveClass('pt-8', 'pb-8')
  })

  it('defines :has() viewport lock tokens for ViewportWorkspace routes', () => {
    expect(appShellContentColumnClasses).toContain('has-[[data-viewport-fill=workspace]]:h-dvh')
    expect(appShellContentColumnClasses).toContain('has-[[data-viewport-fill=workspace]]:max-h-dvh')
    expect(appShellContentColumnClasses).toContain(
      'has-[[data-viewport-fill=workspace]]:overflow-hidden',
    )
    expect(appShellMainClasses).toContain('has-[[data-viewport-fill=workspace]]:h-0')
    expect(appShellContentColumnClasses).not.toMatch(/(?:^|\s)h-dvh(?:\s|$)/)
  })

  it('documents messages workspace as a ViewportWorkspace pane', () => {
    expect(messagesWorkspaceRootClasses).toContain('min-h-0')
    expect(messagesWorkspaceRootClasses).toContain('flex-1')
    expect(messagesWorkspaceBodyClasses).toContain('overflow-hidden')
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
