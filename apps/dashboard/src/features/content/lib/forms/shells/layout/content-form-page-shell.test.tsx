import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import {
  pageShellInsetBottomClasses,
  pageShellInsetTopClasses,
} from '@/components/layout/page/page-spacing.variants'
import {
  viewportWorkspaceClasses,
  viewportWorkspacePaneClasses,
} from '@/components/layout/page/viewport-workspace.variants'

import { contentFormPageShellBodyClasses } from './content-form-page-shell.variants'
import { ContentFormPageShell } from './content-form-page-shell'

function renderShell(ui: ReactElement) {
  return render(ui)
}

function expectViewportWorkspaceChain(container: HTMLElement) {
  const workspace = container.firstElementChild
  expect(workspace).toHaveClass(...viewportWorkspaceClasses.split(/\s+/).filter(Boolean))
  expect(workspace).toHaveClass('flex', 'flex-1', 'flex-col', 'overflow-hidden')
  expect(workspace).not.toHaveClass(...pageShellInsetBottomClasses.split(/\s+/))

  const widthShell = workspace?.firstElementChild
  expect(widthShell).toHaveClass(...viewportWorkspacePaneClasses.split(/\s+/))
  expect(widthShell).toHaveClass('flex-1', 'min-h-0', 'flex-col')
  expect(widthShell).not.toHaveClass('h-full', 'overflow-hidden')
  expect(widthShell).not.toHaveClass(
    ...pageShellInsetTopClasses.split(/\s+/),
    ...pageShellInsetBottomClasses.split(/\s+/),
  )

  return { workspace, widthShell }
}

describe('ContentFormPageShell', () => {
  it('uses NarrowPage with page inset when scrollMode is document', () => {
    const { container } = renderShell(
      <ContentFormPageShell scrollMode="document" pageWidth="narrow">
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    const root = container.firstElementChild
    expect(root).toHaveClass('mx-auto', 'max-w-4xl')
    expect(root).toHaveClass(...pageShellInsetTopClasses.split(/\s+/))
    expect(root).not.toHaveClass(...viewportWorkspaceClasses.split(/\s+/))
    expect(root?.textContent).toBe('Form body')
  })

  it('uses ViewportWorkspace, body wrapper, and WidePage when scrollMode is viewport', () => {
    const { container } = renderShell(
      <ContentFormPageShell scrollMode="viewport" pageWidth="wide">
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    const { widthShell } = expectViewportWorkspaceChain(container)
    expect(widthShell).toHaveClass('w-full')
    expect(widthShell).not.toHaveClass('max-w-4xl')

    const body = widthShell?.firstElementChild
    expect(body).toHaveClass(...contentFormPageShellBodyClasses.split(/\s+/))
    expect(body?.textContent).toBe('Form body')
  })
})
