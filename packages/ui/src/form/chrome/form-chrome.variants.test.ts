import { describe, expect, it } from 'vitest'

import {
  formDockedActionsBarBlockSizeContractClasses,
  formDockedActionsBarClasses,
  formDockedFooterFloorGapContractClasses,
  formDockedScrollTopChromeBlockSizeContractClasses,
  formStickyScrollBodyClipClasses,
  formStickyScrollBodyScrollerClasses,
  formStickyScrollShellClasses,
  formStickyScrollShellWithDockedFooterClasses,
  formTabbedAsideBodyClasses,
  formTabbedAsideGridClasses,
  formTabbedAsideGridColsAt2xlClasses,
  formTabbedAsideGridColsBelow2xlClasses,
  formTabbedAsideGridMaxWidthAt2xlClasses,
  formTabbedAsideGridMaxWidthBelow2xlClasses,
  formTabbedAsideSlotBottomInsetClasses,
  formTabbedAsideSlotClasses,
  formTabbedAsideSlotTopInsetClasses,
  formViewportScrollBodyTopInsetClasses,
  RPG_CONTENT_BOTTOM_INSET_VAR,
  RPG_CONTENT_FLOOR_GAP_VAR,
  RPG_CONTENT_TOP_INSET_VAR,
  RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR,
} from './form-chrome.variants'

describe('formTabbedAside layout tokens', () => {
  it('bounds the xl grid row to the viewport flex shell', () => {
    expect(formTabbedAsideGridClasses).toContain('xl:grid-rows-[minmax(0,1fr)]')
    expect(formTabbedAsideGridClasses).toContain('xl:h-full')
  })

  it('uses a narrower preview-rail column below 2xl', () => {
    expect(formTabbedAsideGridClasses).toContain(formTabbedAsideGridColsBelow2xlClasses)
    expect(formTabbedAsideGridClasses).toContain(formTabbedAsideGridColsAt2xlClasses)
  })

  it('keeps the preview-rail grid centered with a capped max width', () => {
    expect(formTabbedAsideGridClasses).toContain('mx-auto')
    expect(formTabbedAsideGridClasses).not.toContain('xl:mx-0')
    expect(formTabbedAsideGridClasses).toContain(formTabbedAsideGridMaxWidthBelow2xlClasses)
    expect(formTabbedAsideGridClasses).toContain(formTabbedAsideGridMaxWidthAt2xlClasses)
  })

  it('fills grid cells for scroll + docked footer columns', () => {
    expect(formTabbedAsideBodyClasses).toContain('xl:h-full')
    expect(formTabbedAsideBodyClasses).toContain('min-h-0')
    expect(formTabbedAsideSlotClasses).toContain('xl:h-full')
    expect(formTabbedAsideSlotClasses).toContain('xl:flex')
    expect(formTabbedAsideSlotClasses).toContain('xl:flex-col')
  })

  it('applies vertical inset on the preview-rail column only', () => {
    expect(formTabbedAsideSlotTopInsetClasses).toBe('xl:pt-8')
    expect(formTabbedAsideSlotBottomInsetClasses).toBe('xl:pb-8')
    expect(formTabbedAsideSlotClasses).toContain(formTabbedAsideSlotTopInsetClasses)
    expect(formTabbedAsideSlotClasses).toContain(formTabbedAsideSlotBottomInsetClasses)
  })

  it('defines scroll-body top inset that scrolls with form content', () => {
    expect(formViewportScrollBodyTopInsetClasses).toBe('pt-8')
  })
})

describe('docked form footer geometry', () => {
  it('keeps the base sticky scroll shell free of bottom inset publishing', () => {
    expect(formStickyScrollShellClasses).not.toContain(RPG_CONTENT_BOTTOM_INSET_VAR)
    expect(formStickyScrollShellClasses).not.toContain(RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR)
  })

  it('publishes bottom inset only on the docked-footer shell composition', () => {
    expect(formStickyScrollShellWithDockedFooterClasses).toContain(
      formDockedActionsBarBlockSizeContractClasses,
    )
    expect(formStickyScrollShellWithDockedFooterClasses).toContain(
      formDockedFooterFloorGapContractClasses,
    )
    expect(formStickyScrollShellWithDockedFooterClasses).toContain(
      formDockedScrollTopChromeBlockSizeContractClasses,
    )
    expect(formStickyScrollShellWithDockedFooterClasses).toContain(
      `[${RPG_CONTENT_BOTTOM_INSET_VAR}:calc(var(${RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR})+var(${RPG_CONTENT_FLOOR_GAP_VAR}))]`,
    )
    expect(formStickyScrollShellWithDockedFooterClasses).toContain(RPG_CONTENT_TOP_INSET_VAR)
    expect(formDockedActionsBarBlockSizeContractClasses).toContain(
      `[${RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR}:69px]`,
    )
  })

  it('splits the sticky scroll slot into a clip container and inner scroller', () => {
    expect(formStickyScrollBodyClipClasses).toContain('form-scroll-body-container')
    expect(formStickyScrollBodyClipClasses).toContain('overflow-hidden')
    expect(formStickyScrollBodyClipClasses).not.toContain('overflow-y-auto')
    expect(formStickyScrollBodyScrollerClasses).toContain('overflow-y-auto')
    expect(formStickyScrollBodyScrollerClasses).not.toContain('form-scroll-body-container')
  })

  it('derives docked actions bar min-height from the shared block-size contract', () => {
    expect(formDockedActionsBarClasses).toContain(formDockedActionsBarBlockSizeContractClasses)
    expect(formDockedActionsBarClasses).toContain(
      `min-h-[var(${RPG_FORM_DOCKED_ACTIONS_BAR_BLOCK_SIZE_VAR})]`,
    )
  })
})
