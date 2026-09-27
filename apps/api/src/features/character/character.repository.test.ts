import { describe, expect, it, vi } from 'vitest'

import { runInTransaction } from '../../lib/mongo-transaction'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { CharacterModel } from './character.model'
import { createPcRecord } from './character.repository'
import * as toCharacterModule from './to-character'

useIntegrationDb()

describe('character.repository create records', () => {
  it('deletes the saved character when response mapping throws without a session', async () => {
    const spy = vi.spyOn(toCharacterModule, 'toCharacter').mockImplementation(() => {
      throw new Error('map failed')
    })

    await expect(
      createPcRecord({ ...minimalStandalonePcInput, name: 'Orphan PC' }, 'repo-user-1'),
    ).rejects.toThrow('map failed')

    const remaining = await CharacterModel.find({ name: 'Orphan PC' }).lean()
    expect(remaining).toHaveLength(0)

    spy.mockRestore()
  })

  it('rethrows mapping failures inside a transaction so the write rolls back', async () => {
    const spy = vi.spyOn(toCharacterModule, 'toCharacter').mockImplementation(() => {
      throw new Error('map failed in transaction')
    })

    await expect(
      runInTransaction(async (session) => {
        await createPcRecord(
          { ...minimalStandalonePcInput, name: 'Transactional Orphan PC' },
          'repo-user-2',
          { session },
        )
      }),
    ).rejects.toThrow('map failed in transaction')

    const remaining = await CharacterModel.find({ name: 'Transactional Orphan PC' }).lean()
    expect(remaining).toHaveLength(0)

    spy.mockRestore()
  })
})
