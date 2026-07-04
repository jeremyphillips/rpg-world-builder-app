import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
} from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from '../lib/character-builder-fixtures'
import { CharacterBuilderPreviewPanel } from './character-builder-preview-panel.client'

describe('CharacterBuilderPreviewPanel', () => {
  it('renders derived preview stats and warnings', () => {
    const context = createStandaloneBuilderContextFixture()
    const preview = buildCharacterPreview(
      createEmptyCharacterBuilderDraft(),
      indexCharacterBuildCatalog(context.catalog),
      context.characterCreationRules,
    )

    render(<CharacterBuilderPreviewPanel preview={preview} />)

    expect(screen.getByRole('heading', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.getByText('Strength')).toBeInTheDocument()
    expect(preview.warnings.length).toBeGreaterThan(0)
    expect(screen.getByText(preview.warnings[0]!)).toBeInTheDocument()
  })

  it('has no axe accessibility violations', async () => {
    const context = createStandaloneBuilderContextFixture()
    const preview = buildCharacterPreview(
      {
        ...createEmptyCharacterBuilderDraft(),
        identity: { name: 'Verna', alignment: 'ng' },
        class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
        abilities: {
          method: 'manual',
          scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        },
      },
      indexCharacterBuildCatalog(context.catalog),
      context.characterCreationRules,
    )

    const { container } = render(<CharacterBuilderPreviewPanel preview={preview} />)
    await expectNoAxeViolations(container)
  })
})
