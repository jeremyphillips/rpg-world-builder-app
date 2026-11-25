import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { overlayAtomic } from './annotate'
import { compileOverlayPolicy } from './compile-policy'
import { compileSystemOverlayParticipants, systemOverlayParticipants } from './participants'

describe('system overlay policy coverage', () => {
  it.each(
    systemOverlayParticipants.map(
      (participant) => [participant.id, participant.schemas.length] as const,
    ),
  )('%s compiles every publish and draft body schema', (id, schemaCount) => {
    const compiled = compileSystemOverlayParticipants()
    const forParticipant = compiled.filter((entry) => entry.participantId === id)
    expect(forParticipant).toHaveLength(schemaCount)
    for (const entry of forParticipant) {
      expect(entry.policy).toBeDefined()
    }
  })

  it('compiles all participants in one pass', () => {
    expect(() => compileSystemOverlayParticipants()).not.toThrow()
  })

  it('fails when an array has no decision', () => {
    const schema = z.object({ name: z.string(), extra: z.array(z.string()) })
    const result = compileOverlayPolicy(schema)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.issues).toEqual(['extra is an unannotated array'])
  })

  it('does not walk children of an atomic field', () => {
    const schema = z.object({
      media: overlayAtomic(
        z.object({ images: z.array(z.object({ id: z.string().min(1) })) }),
        'test media boundary',
      ),
    })
    const result = compileOverlayPolicy(schema)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.policy).toMatchObject({
      kind: 'deep',
      fields: { media: { kind: 'atomic' } },
    })
  })
})
