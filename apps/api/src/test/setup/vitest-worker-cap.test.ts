import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { createVitest } from 'vitest/node'
import { afterAll, describe, expect, it } from 'vitest'

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '../../../../..')
const apiRoot = resolve(repoRoot, 'apps/api')

/** Vitest's public ResolvedConfig type omits this field; the resolver still sets it. */
function readFileParallelism(config: object): boolean {
  if (!('fileParallelism' in config) || typeof config.fileParallelism !== 'boolean') {
    throw new Error('resolved Vitest config is missing fileParallelism')
  }
  return config.fileParallelism
}

async function resolveProject(configFile: string) {
  const previous = process.env.VITEST_MAX_WORKERS
  delete process.env.VITEST_MAX_WORKERS
  const vitest = await createVitest('test', {
    root: apiRoot,
    config: resolve(apiRoot, configFile),
    watch: false,
    run: false,
  })
  if (previous === undefined) {
    delete process.env.VITEST_MAX_WORKERS
  } else {
    process.env.VITEST_MAX_WORKERS = previous
  }
  return vitest
}

describe('vitest worker cap resolution', () => {
  const contexts: Awaited<ReturnType<typeof createVitest>>[] = []

  afterAll(async () => {
    await Promise.all(contexts.map((vitest) => vitest.close()))
  })

  it('resolves an ordinary project to 4 workers and bail 0', async () => {
    const vitest = await resolveProject('vitest.unit.config.ts')
    contexts.push(vitest)
    const config = vitest.getRootProject().config
    expect(config.maxWorkers).toBe(4)
    expect(config.bail).toBe(0)
    expect(readFileParallelism(config)).toBe(true)
  })

  it('keeps API integration at 2 workers', async () => {
    const vitest = await resolveProject('vitest.integration.config.ts')
    contexts.push(vitest)
    const config = vitest.getRootProject().config
    expect(config.maxWorkers).toBe(2)
    expect(readFileParallelism(config)).toBe(true)
  })

  it('keeps the serial project serial', async () => {
    const vitest = await resolveProject('vitest.integration-serial.config.ts')
    contexts.push(vitest)
    const config = vitest.getRootProject().config
    expect(readFileParallelism(config)).toBe(false)
    expect(config.maxWorkers).toBe(1)
  })

  it('does not inject VITEST_MAX_WORKERS from repo scripts', () => {
    const files = [
      resolve(repoRoot, 'package.json'),
      ...readdirSync(resolve(repoRoot, '.husky'))
        .filter((name) => !name.startsWith('_') && name !== '.gitignore')
        .map((name) => resolve(repoRoot, '.husky', name)),
      ...readdirSync(resolve(repoRoot, '.github/workflows')).map((name) =>
        resolve(repoRoot, '.github/workflows', name),
      ),
    ]
    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toContain('VITEST_MAX_WORKERS')
    }
  })
})
