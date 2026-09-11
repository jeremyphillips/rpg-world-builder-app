import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { pageScrollClasses } from '@/components/layout/page/page-scroll.variants'
import {
  pageShellInsetBottomClasses,
  pageShellInsetTopClasses,
} from '@/components/layout/page/page-spacing.variants'

import { ContentFormPageShell } from './content-form-page-shell'

function renderShell(ui: ReactElement) {
  return render(ui)
}

describe('ContentFormPageShell', () => {
  it('uses NarrowPage viewport shell without shell inset when preview layout is disabled', () => {
    const { container } = renderShell(
      <ContentFormPageShell usePreviewLayout={false}>
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    expect(container.firstChild).toHaveClass(
      'mx-auto',
      'max-w-4xl',
      ...pageScrollClasses.viewport.split(/\s+/),
    )
    expect(container.firstChild).not.toHaveClass(
      ...pageShellInsetTopClasses.split(/\s+/),
      ...pageShellInsetBottomClasses.split(/\s+/),
    )
  })

  it('uses WidePage viewport shell without shell inset when preview layout is enabled', () => {
    const { container } = renderShell(
      <ContentFormPageShell usePreviewLayout>
        <p>Form body</p>
      </ContentFormPageShell>,
    )

    expect(container.firstChild).toHaveClass('w-full', ...pageScrollClasses.viewport.split(/\s+/))
    expect(container.firstChild).not.toHaveClass(
      'max-w-4xl',
      ...pageShellInsetTopClasses.split(/\s+/),
      ...pageShellInsetBottomClasses.split(/\s+/),
    )
  })
})
