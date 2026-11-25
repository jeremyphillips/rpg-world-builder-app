import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { compileOverlayPolicy } from './compile-policy'
import { systemOverlayParticipants } from './participants'

describe('system overlay policy coverage', () => {
  it.each(systemOverlayParticipants.map((participant) => participant.id))(
    '%s classifies every publish and draft collection',
    (id) => {
      const participant = systemOverlayParticipants.find((entry) => entry.id === id)
      expect(participant).toBeDefined()
      for (const schema of participant!.schemas) {
        expect(compileOverlayPolicy(schema).issues).toEqual([])
      }
    },
  )

  it('fails when an array has no decision', () => {
    const schema = z.object({ name: z.string(), extra: z.array(z.string()) })
    expect(compileOverlayPolicy(schema).issues).toEqual(['extra is an unclassified array'])
  })

  it('does not walk children of an atomic field', () => {
    const schema = z.object({
      media: z.object({ images: z.array(z.object({ id: z.string().min(1) })) }),
    })
    expect(compileOverlayPolicy(schema).issues).toEqual([])
    expect(compileOverlayPolicy(schema).policy).toMatchObject({
      kind: 'deep',
      fields: { media: { kind: 'atomic' } },
    })
  })
})
