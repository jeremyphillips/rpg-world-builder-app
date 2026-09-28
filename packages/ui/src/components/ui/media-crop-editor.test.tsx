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
import {
  mapAperturePointerToFocalPoint,
  MediaCropEditor,
  resolveCropRelativeGuideLayout,
  resolveCropPreviewLayout,
} from './media-crop-editor.client'

describe('mapAperturePointerToFocalPoint', () => {
  const crop = { x: 0.2, y: 0.15, width: 0.6, height: 0.45 }

  it.each([
    { name: 'top-left', relativeX: 0, relativeY: 0, expected: { x: 0.2, y: 0.15 } },
    { name: 'center', relativeX: 0.5, relativeY: 0.5, expected: { x: 0.5, y: 0.375 } },
    { name: 'bottom-right', relativeX: 1, relativeY: 1, expected: { x: 0.8, y: 0.6 } },
  ])('maps the aperture $name to source-normalized crop coordinates', (testCase) => {
    const apertureRect = { left: 40, top: 20, width: 300, height: 225 }
    expect(
      mapAperturePointerToFocalPoint({
        clientX: apertureRect.left + apertureRect.width * testCase.relativeX,
        clientY: apertureRect.top + apertureRect.height * testCase.relativeY,
        apertureRect,
        crop,
      }),
    ).toEqual(testCase.expected)
  })

  it('is independent of aperture pixel size', () => {
    const mapRelativePoint = (width: number, height: number) =>
      mapAperturePointerToFocalPoint({
        clientX: 25 + width * 0.75,
        clientY: 50 + height * 0.25,
        apertureRect: { left: 25, top: 50, width, height },
        crop,
      })

    expect(mapRelativePoint(300, 225)).toEqual(mapRelativePoint(900, 675))
  })
})

describe('resolveCropRelativeGuideLayout', () => {
  it('projects an effective frame crop relative to its authored role crop', () => {
    const layout = resolveCropRelativeGuideLayout(
      { x: 0.2, y: 0.15, width: 0.6, height: 0.45 },
      { x: 0.2, y: 0.225, width: 0.6, height: 0.3 },
    )
    expect(layout.leftPercent).toBeCloseTo(0)
    expect(layout.topPercent).toBeCloseTo(100 / 6)
    expect(layout.widthPercent).toBeCloseTo(100)
    expect(layout.heightPercent).toBeCloseTo(200 / 3)
  })
})

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

  it('maps focal dragging against the live aperture bounds', () => {
    const crop = { x: 0.2, y: 0.15, width: 0.6, height: 0.45 }
    const onFocalPointChange = vi.fn()
    const { container } = render(
      <MediaCropEditor
        src="/image.png"
        source={source}
        constraint={primaryConstraint}
        crop={crop}
        focalPoint={{ x: 0.5, y: 0.375 }}
        onChange={vi.fn()}
        onFocalPointChange={onFocalPointChange}
      />,
    )
    const aperture = container.querySelector<HTMLElement>('[data-media-crop-aperture]')!
    vi.spyOn(aperture, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 200,
      width: 300,
      height: 225,
      right: 400,
      bottom: 425,
      x: 100,
      y: 200,
      toJSON: () => ({}),
    })

    const focalHandle = screen.getByRole('button', { name: 'Focal point' })
    Object.defineProperty(focalHandle, 'setPointerCapture', { value: vi.fn() })
    const pointerDown = new Event('pointerdown', { bubbles: true })
    Object.defineProperties(pointerDown, {
      pointerId: { value: 1 },
      clientX: { value: 250 },
      clientY: { value: 312.5 },
    })
    fireEvent(focalHandle, pointerDown)
    const pointerMove = new Event('pointermove', { bubbles: true })
    Object.defineProperties(pointerMove, {
      pointerId: { value: 1 },
      clientX: { value: 250 },
      clientY: { value: 368.75 },
    })
    fireEvent(screen.getByRole('group', { name: 'Primary crop position' }), pointerMove)

    expect(onFocalPointChange).toHaveBeenCalledWith({ x: 0.5, y: 0.48750000000000004 })
  })

  it('renders the exact effective crop guide instead of the generic center guide', () => {
    const crop = { x: 0.2, y: 0.15, width: 0.6, height: 0.45 }
    const effectiveCrop = { x: 0.2, y: 0.225, width: 0.6, height: 0.3 }
    const { container } = render(
      <MediaCropEditor
        src="/image.png"
        source={source}
        constraint={primaryConstraint}
        crop={crop}
        onChange={vi.fn()}
        effectiveCropGuide={{ crop: effectiveCrop, label: 'Card crop' }}
      />,
    )

    const guide = container.querySelector<HTMLElement>('[data-effective-crop-guide]')
    const layout = resolveCropRelativeGuideLayout(crop, effectiveCrop)
    expect(guide).toHaveStyle({
      left: `${layout.leftPercent}%`,
      top: `${layout.topPercent}%`,
      width: `${layout.widthPercent}%`,
      height: `${layout.heightPercent}%`,
    })
    expect(container.querySelector('.inset-1\\/3')).toBeNull()
  })
})
