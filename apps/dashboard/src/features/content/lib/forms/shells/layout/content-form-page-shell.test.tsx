import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import {
  pageShellInsetBottomClasses,
  pageShellInsetTopClasses,
} from '@/components/layout/page/page-spacing.variants'
import {
  viewportFillClasses,
  viewportShellClasses,
} from '@/components/layout/page/page-scroll.variants'

import { contentFormPageShellBodyClasses } from './content-form-page-shell.variants'
import { ContentFormPageShell } from './content-form-page-shell'

function renderShell(ui: ReactElement) {
  return render(ui)
}

function expectViewportFillChain(container: HTMLElement) {
  const boundary = container.firstElementChild
  expect(boundary).toHaveClass(...viewportShellClasses.split(/\s+/))
  expect(boundary).not.toHaveClass(...pageShellInsetBottomClasses.split(/\s+/))

  const fillWrapper = boundary?.firstElementChild
  expect(fillWrapper).toHaveClass(...viewportFillClasses.split(/\s+/))

  const widthShell = fillWrapper?.firstElementChild
  expect(widthShell).toHaveClass(...viewportFillClasses.split(/\s+/))
  expect(widthShell).not.toHaveClass(
    ...pageShellInsetTopClasses.split(/\s+/),
    ...pageShellInsetBottomClasses.split(/\s+/),
  )

  return { boundary, fillWrapper, widthShell }
}

describe('ContentFormPageShell', () => {
  it('uses ViewportShell fill chain and NarrowPage without shell inset when preview is disabled', () => {
    const { container } = renderShell(
      <ContentFormPageShell usePreviewLayout={false}>
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    const { widthShell } = expectViewportFillChain(container)
    expect(widthShell).toHaveClass('mx-auto', 'max-w-4xl')
    expect(widthShell?.firstElementChild?.textContent).toBe('Form body')
  })

  it('uses ViewportShell fill chain, body wrapper, and WidePage when preview is enabled', () => {
    const { container } = renderShell(
      <ContentFormPageShell usePreviewLayout>
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    const { widthShell } = expectViewportFillChain(container)
    expect(widthShell).toHaveClass('w-full')
    expect(widthShell).not.toHaveClass('max-w-4xl')

    const body = widthShell?.firstElementChild
    expect(body).toHaveClass(...contentFormPageShellBodyClasses.split(/\s+/))
    expect(body?.textContent).toBe('Form body')
  })
})
