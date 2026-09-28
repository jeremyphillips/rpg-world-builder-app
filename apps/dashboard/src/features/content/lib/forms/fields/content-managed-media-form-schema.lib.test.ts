import { contentMediaSchema } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { withManagedContentMediaFormSchema } from './content-managed-media-form-schema.lib'

describe('withManagedContentMediaFormSchema', () => {
  it('retains media on parse', () => {
    const schema = withManagedContentMediaFormSchema(z.object({ name: z.string() }))
    const media = contentMediaSchema.parse({
      revision: 0,
      images: [{ id: 'a', assetId: 'b' }],
      roles: {},
    })

    const parsed = schema.parse({ name: 'x', media }) as unknown as { media?: typeof media }
    expect(parsed.media).toEqual(media)
  })
})
