import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { isSquareCrop, meetsPortraitMinimumCrop, resetPortraitCrop } from '@rpg/contracts'
import { MediaCropEditor } from './media-crop-editor.client'

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
  it('offers keyboard repositioning and resets to the original centered crop', () => {
    const onChange = vi.fn()
    const crop = { x: 0.2, y: 0.2, width: 0.2, height: 0.3 }
    render(<MediaCropEditor src="/image.png" source={source} crop={crop} onChange={onChange} />)
    fireEvent.keyDown(screen.getByRole('group', { name: 'Portrait crop position' }), {
      key: 'ArrowRight',
    })
    expect(onChange.mock.calls[0]![0].x).toBeGreaterThan(crop.x)
    fireEvent.click(screen.getByRole('button', { name: 'Reset crop' }))
    expect(onChange).toHaveBeenLastCalledWith(resetPortraitCrop(source))
  })
})
