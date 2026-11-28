import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { overlayAtomic } from './annotate'
import { overlayDeleteIdRows, overlayRestoreIdRows } from './overlay-presets'
import { compileOverlayPolicy, requireCompiledOverlayPolicy } from './compile-policy'
import { monsterBodySchema } from '../../monster'
import { systemOverlayParticipants } from './participants'

describe('overlay policy negative probes', () => {
  it('rejects unannotated arrays', () => {
    const schema = z.object({ mystery: z.array(z.string()) })
    const result = compileOverlayPolicy(schema)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues[0]).toContain('unannotated array')
  })

  it('rejects identity rows without a compatible id key', () => {
    const schema = z.object({
      features: overlayRestoreIdRows(z.object({ label: z.string() })),
    })
    const result = compileOverlayPolicy(schema)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues.some((issue) => issue.includes('id'))).toBe(true)
  })

  it('rejects optional identity keys', () => {
    const schema = z.object({
      features: overlayDeleteIdRows(
        z.object({ id: z.string().min(1).optional(), name: z.string() }),
      ),
    })
    const result = compileOverlayPolicy(schema)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues.some((issue) => issue.includes('optional'))).toBe(true)
  })

  it('rejects atomic objects that contain annotated collections', () => {
    const schema = z.object({
      media: overlayAtomic(
        z.object({ images: overlayRestoreIdRows(z.object({ id: z.string().min(1) })) }),
        'invalid nested collection',
      ),
    })
    const result = compileOverlayPolicy(schema)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues.some((issue) => issue.includes('annotated collection'))).toBe(true)
  })

  it('requireCompiledOverlayPolicy throws on failure', () => {
    expect(() => requireCompiledOverlayPolicy(z.object({ rows: z.array(z.string()) }))).toThrow(
      /Overlay policy compile failed/,
    )
  })

  it('participant fixture compiles for registration', () => {
    const result = compileOverlayPolicy(monsterBodySchema)
    expect(result.ok).toBe(true)
    expect(systemOverlayParticipants.some((p) => p.id === 'monsters')).toBe(true)
  })
})
