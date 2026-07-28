import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

import type { HttpError } from '../../lib/http-error'
import { previewDndBeyondCharacter } from './dnd-beyond-acquisition.service'

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../packages/contracts/src/character-import/dnd-beyond/fixtures/character-133058471.json',
)
const fixtureJson = readFileSync(fixturePath, 'utf8')

function mockFetchWith(body: unknown, status = 200): typeof fetch {
  return vi.fn().mockResolvedValue(
    new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    }),
  )
}

describe('previewDndBeyondCharacter', () => {
  it('returns an import result for a valid upstream payload', async () => {
    const fetchImpl = mockFetchWith(JSON.parse(fixtureJson))
    const result = await previewDndBeyondCharacter('133058471', fetchImpl)

    expect(result.extraction.name.value).toBe('Presto')
    expect(result.source.characterId).toBe('133058471')
    expect(result.source.requestedPayloadVersion).toBe('character-v5')
    expect(result.source.supportedPayloadVersion).toBe('character-v5')
  })

  it('maps UnsupportedApiVersion envelopes to unsupported-api-version', async () => {
    const fetchImpl = mockFetchWith({
      error: {
        code: 'UnsupportedApiVersion',
        message: 'Version 5 is no longer supported',
        innerError: null,
      },
    })

    await expect(previewDndBeyondCharacter('133058471', fetchImpl)).rejects.toMatchObject({
      status: 502,
      code: 'unsupported-api-version',
      details: {
        requestedPayloadVersion: 'character-v5',
        supportedPayloadVersion: 'character-v5',
      },
    } satisfies Partial<HttpError>)
  })

  it('maps success:false envelopes to character-unavailable', async () => {
    const fetchImpl = mockFetchWith({
      success: false,
      message: 'Private character',
      data: null,
    })

    await expect(previewDndBeyondCharacter('133058471', fetchImpl)).rejects.toMatchObject({
      status: 404,
      code: 'character-unavailable',
    })
  })

  it('maps schema drift to invalid-upstream-payload', async () => {
    const fetchImpl = mockFetchWith({
      success: true,
      message: null,
      data: {
        id: 'not-a-number',
      },
    })

    await expect(previewDndBeyondCharacter('133058471', fetchImpl)).rejects.toMatchObject({
      status: 502,
      code: 'invalid-upstream-payload',
    })
  })
})
