import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  isBannerAspectCrop,
  isSquareCrop,
  meetsBannerMinimumCrop,
  meetsPortraitMinimumCrop,
  resetBannerCrop,
  resetPortraitCrop,
  resetPrimaryCrop,
} from '@rpg/contracts'
import { MediaCropEditor, resolveCropPreviewLayout } from './media-crop-editor.client'

describe('MediaCropEditor', () => {
  const source = { width: 2400, height: 1600 }
  it('zooms around the center while retaining a valid square', () => {
    const onChange = vi.fn()
    render(
      <MediaCropEditor
        src="/image.png"
        source={source}
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
  it('fills the aperture for a primary full-frame crop', () => {
    const primarySource = { width: 1600, height: 900 }
    const { container } = render(
      <MediaCropEditor
        src="/image.png"
        source={primarySource}
        frame="free"
        crop={resetPrimaryCrop()}
        onChange={vi.fn()}
      />,
    )
    const img = container.querySelector<HTMLImageElement>(
      '[aria-label="Primary crop position"] img',
    )
    expect(Number.parseFloat(img?.style.width ?? '')).toBeCloseTo(75)
    expect(Number.parseFloat(img?.style.height ?? '')).toBeCloseTo(75)
    expect(Number.parseFloat(img?.style.top ?? '')).toBeCloseTo(12.5)
    expect(Number.parseFloat(img?.style.left ?? '')).toBeCloseTo(12.5)
  })

  it('covers the aperture without letterboxing for a full-frame primary crop', () => {
    const layout = resolveCropPreviewLayout(
      'free',
      { width: 1600, height: 900 },
      resetPrimaryCrop(),
    )
    expect(layout.widthPercent).toBeCloseTo(75)
    expect(layout.heightPercent).toBeCloseTo(75)
    expect(layout.topPercent).toBeCloseTo(12.5)
    expect(layout.leftPercent).toBeCloseTo(12.5)
  })

  it('zooms banner while retaining a valid 3:1 crop on non-wide sources', () => {
    const bannerSource = { width: 1800, height: 1200 }
    const onChange = vi.fn()
    render(
      <MediaCropEditor
        src="/image.png"
        source={bannerSource}
        frame="banner"
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
    render(<MediaCropEditor src="/image.png" source={source} crop={crop} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('group', { name: 'Portrait crop position' }), {
      key: 'ArrowRight',
    })
    expect(onChange.mock.calls[0]![0].x).toBeLessThan(crop.x)
    fireEvent.click(screen.getByRole('button', { name: 'Reset crop' }))
    expect(onChange).toHaveBeenLastCalledWith(resetPortraitCrop(source))
  })
})
