import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  isBannerAspectCrop,
  isPrimaryAspectCrop,
  isSquareCrop,
  meetsBannerMinimumCrop,
  meetsPortraitMinimumCrop,
  meetsPrimaryMinimumCrop,
  resetBannerCrop,
  resetPortraitCrop,
  resetPrimaryCrop,
  resolveMediaCropEditorConstraint,
} from '@rpg/contracts'
import { MediaCropEditor, resolveCropPreviewLayout } from './media-crop-editor.client'

describe('MediaCropEditor', () => {
  const source = { width: 2400, height: 1600 }
  const portraitConstraint = resolveMediaCropEditorConstraint('portrait')!
  const bannerConstraint = resolveMediaCropEditorConstraint('banner')!
  const primaryConstraint = resolveMediaCropEditorConstraint('primary')!

  it('zooms around the center while retaining a valid square', () => {
    const onChange = vi.fn()
    render(
      <MediaCropEditor
        src="/image.png"
        source={source}
        constraint={portraitConstraint}
        crop={resetPortraitCrop(source)}
        onChange={onChange}
      />,
    )
    fireEvent.change(screen.getByLabelText('Zoom'), { target: { value: '3' } })
    const crop = onChange.mock.calls[0]![0]
    expect(isSquareCrop(crop, source)).toBe(true)
    expect(meetsPortraitMinimumCrop(crop, source)).toBe(true)
    expect(crop.x + crop.width / 2).toBeCloseTo(0.5)
  })

  it('fills the aperture for a primary 4:3 crop', () => {
    const primarySource = { width: 1800, height: 1200 }
    const crop = resetPrimaryCrop(primarySource)
    const { container } = render(
      <MediaCropEditor
        src="/image.png"
        source={primarySource}
        constraint={primaryConstraint}
        crop={crop}
        onChange={vi.fn()}
      />,
    )
    const img = container.querySelector<HTMLImageElement>(
      '[aria-label="Primary crop position"] img',
    )
    expect(Number.parseFloat(img?.style.width ?? '')).toBeGreaterThan(70)
    expect(Number.parseFloat(img?.style.height ?? '')).toBeGreaterThan(70)
    expect(Number.parseFloat(img?.style.top ?? '')).toBeLessThan(20)
    expect(Number.parseFloat(img?.style.left ?? '')).toBeLessThan(20)
  })

  it('covers the aperture without letterboxing for a 4:3 primary crop', () => {
    const primarySource = { width: 1800, height: 1200 }
    const crop = resetPrimaryCrop(primarySource)
    const layout = resolveCropPreviewLayout(primaryConstraint.aspectRatio, primarySource, crop)
    expect(layout.widthPercent).toBeGreaterThanOrEqual(75)
    expect(layout.heightPercent).toBeGreaterThanOrEqual(75)
    expect(layout.topPercent).toBeLessThanOrEqual(12.5)
    expect(layout.leftPercent).toBeLessThanOrEqual(12.5)
  })

  it('zooms primary while retaining a valid 4:3 crop and respecting 800×600 minimum', () => {
    const primarySource = { width: 1600, height: 1200 }
    const onChange = vi.fn()
    render(
      <MediaCropEditor
        src="/image.png"
        source={primarySource}
        constraint={primaryConstraint}
        crop={resetPrimaryCrop(primarySource)}
        onChange={onChange}
      />,
    )
    fireEvent.change(screen.getByLabelText('Zoom'), { target: { value: '2' } })
    const crop = onChange.mock.calls[0]![0]
    expect(isPrimaryAspectCrop(crop, primarySource)).toBe(true)
    expect(meetsPrimaryMinimumCrop(crop, primarySource)).toBe(true)
    expect(crop.x + crop.width / 2).toBeCloseTo(0.5)
  })

  it('zooms banner while retaining a valid 3:1 crop on non-wide sources', () => {
    const bannerSource = { width: 1800, height: 1200 }
    const onChange = vi.fn()
    render(
      <MediaCropEditor
        src="/image.png"
        source={bannerSource}
        constraint={bannerConstraint}
        crop={resetBannerCrop(bannerSource)}
        onChange={onChange}
      />,
    )
    fireEvent.change(screen.getByLabelText('Zoom'), { target: { value: '1.5' } })
    const crop = onChange.mock.calls[0]![0]
    expect(isBannerAspectCrop(crop, bannerSource)).toBe(true)
    expect(meetsBannerMinimumCrop(crop, bannerSource)).toBe(true)
    expect(crop.x + crop.width / 2).toBeCloseTo(0.5)
  })

  it('offers keyboard repositioning and resets to the original centered crop', () => {
    const onChange = vi.fn()
    const crop = { x: 0.2, y: 0.2, width: 0.2, height: 0.3 }
    render(
      <MediaCropEditor
        src="/image.png"
        source={source}
        constraint={portraitConstraint}
        crop={crop}
        onChange={onChange}
      />,
    )
    fireEvent.keyDown(screen.getByRole('group', { name: 'Portrait crop position' }), {
      key: 'ArrowRight',
    })
    expect(onChange.mock.calls[0]![0].x).toBeLessThan(crop.x)
    fireEvent.click(screen.getByRole('button', { name: 'Reset crop' }))
    expect(onChange).toHaveBeenLastCalledWith(resetPortraitCrop(source))
  })
})
