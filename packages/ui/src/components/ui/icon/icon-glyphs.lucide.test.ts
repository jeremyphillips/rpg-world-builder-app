import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  Link2,
  Settings2,
  Trash2,
  TriangleAlert,
} from 'lucide-react'
import { describe, expect, it } from 'vitest'

import { LUCIDE_ICON_GLYPHS } from './icon-glyphs.lucide'

describe('LUCIDE_ICON_GLYPHS', () => {
  it('registers one component per canonical name', () => {
    expect(Object.keys(LUCIDE_ICON_GLYPHS)).toHaveLength(113)
    expect(new Set(Object.values(LUCIDE_ICON_GLYPHS)).size).toBe(113)
  })

  it('uses the current Lucide export, including renamed version suffixes', () => {
    expect(LUCIDE_ICON_GLYPHS['arrow-left-right']).toBe(ArrowLeftRight)
    expect(LUCIDE_ICON_GLYPHS.check).toBe(Check)
    expect(LUCIDE_ICON_GLYPHS.trash).toBe(Trash2)
    expect(LUCIDE_ICON_GLYPHS['link-horizontal']).toBe(Link2)
    expect(LUCIDE_ICON_GLYPHS['settings-sliders']).toBe(Settings2)
    expect(LUCIDE_ICON_GLYPHS['triangle-alert']).toBe(TriangleAlert)
    expect(LUCIDE_ICON_GLYPHS['triangle-alert']).toBe(AlertTriangle)
  })
})
