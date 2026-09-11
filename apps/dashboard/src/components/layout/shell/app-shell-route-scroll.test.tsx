import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { ContentFormPageShell } from '@/features/content/lib/forms/shells/layout/content-form-page-shell'
import {
  messagesWorkspaceBodyClasses,
  messagesWorkspaceRootClasses,
} from '@/features/message/components/workspace/messages-workspace.variants'

import { NarrowPage } from '../page/narrow-page'
import { pageScrollClasses } from '../page/page-scroll.variants'
import { WidePage } from '../page/wide-page'

/**
 * AppShell `<main>` is `overflow-hidden`; every routed leaf (or its layout wrapper)
 * must expose a descendant scroll owner. Known tokens:
 *
 * - `pageScrollClasses.page` — normal list/detail routes (`overflow-y-auto`)
 * - `pageScrollClasses.viewport` — viewport-bound shells (forms, builders, messages)
 * - `messagesWorkspaceRootClasses` — messages workspace custom viewport shell
 */
describe('AppShell route scroll ownership', () => {
  it('WidePage defaults to page scroll', () => {
    const { container } = render(
      <WidePage>
        <p>Body</p>
      </WidePage>,
    )
    expect(container.firstElementChild).toHaveClass('overflow-y-auto')
  })

  it('NarrowPage defaults to page scroll', () => {
    const { container } = render(
      <NarrowPage>
        <p>Body</p>
      </NarrowPage>,
    )
    expect(container.firstElementChild).toHaveClass('overflow-y-auto')
  })

  it('ContentFormPageShell uses viewport scroll without shell inset', () => {
    const { container } = render(
      <ContentFormPageShell usePreviewLayout>
        <p>Form</p>
      </ContentFormPageShell>,
    )
    const root = container.firstElementChild
    expect(root).toHaveClass(...pageScrollClasses.viewport.split(/\s+/))
    expect(root).not.toHaveClass('pt-8', 'pb-8')
  })

  it('documents messages workspace as a viewport shell exception', () => {
    expect(messagesWorkspaceRootClasses).toContain('flex-1')
    expect(messagesWorkspaceBodyClasses).toContain('overflow-hidden')
  })
})
