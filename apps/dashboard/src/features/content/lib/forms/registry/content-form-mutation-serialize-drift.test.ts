import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const contentEditShellPath = fileURLToPath(
  new URL('../shells/edit/content-edit-shell.tsx', import.meta.url),
)
const contentCreateShellPath = fileURLToPath(
  new URL('../shells/create/content-create-shell.tsx', import.meta.url),
)
const organizationCreateModalPath = fileURLToPath(
  new URL(
    '../../../organizations/components/create/organization-create-modal.tsx',
    import.meta.url,
  ),
)
const locationCreateFormPath = fileURLToPath(
  new URL('../../../locations/components/create/location-create-form.tsx', import.meta.url),
)
const subclassTabSavePath = fileURLToPath(
  new URL('../../../classes/lib/subclasses/subclass-tab-save.lib.ts', import.meta.url),
)

const MUTATION_BOUNDARY_FILES = [
  contentEditShellPath,
  contentCreateShellPath,
  organizationCreateModalPath,
  locationCreateFormPath,
] as const

const RAW_TO_INPUT_AT_MUTATION_BOUNDARY = /\b(?:def|[\w]+FormDef)\.toInput\s*\(/

describe('content form mutation serialize drift guard', () => {
  it.each(MUTATION_BOUNDARY_FILES)('requires serializeContentFormInput in %s', (filePath) => {
    const source = readFileSync(filePath, 'utf8')
    expect(source).toContain('serializeContentFormInput')
    expect(source).not.toMatch(RAW_TO_INPUT_AT_MUTATION_BOUNDARY)
  })

  it('serialize helper attaches expectedMediaRevision when media is included', () => {
    const serializePath = fileURLToPath(
      new URL('./content-form-serialize-input.lib.ts', import.meta.url),
    )
    const source = readFileSync(serializePath, 'utf8')
    expect(source).toContain('catalogContentMediaExpectedRevisionField')
  })

  it('allows raw toInput on subclass tab save (no managed media)', () => {
    const source = readFileSync(subclassTabSavePath, 'utf8')
    expect(source).toContain('subclassFormDef.toInput')
    expect(source).not.toContain('serializeContentFormInput')
  })
})
