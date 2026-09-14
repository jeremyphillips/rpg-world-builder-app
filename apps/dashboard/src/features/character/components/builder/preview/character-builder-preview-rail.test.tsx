import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  resolveAvailableChoices,
} from '@rpg/contracts'

import {
  createStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  PREVIEW_CHOOSE_ALIGNMENT,
  PREVIEW_CHOOSE_SPECIES,
  PREVIEW_UNNAMED_CHARACTER,
} from '../../../lib/builder-preview/preview-identity-summary'
import { CharacterBuilderPreviewRail } from './character-builder-preview-rail'
import { CharacterBuilderPreviewRailView } from './character-builder-preview-rail-view'
import { projectBuilderPreviewRail } from '../../../lib/builder-preview/builder-preview-projection.lib'

describe('CharacterBuilderPreviewRail', () => {
  const context = createStandaloneBuilderContextFixture()
  const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)
  const draft = createEmptyCharacterBuilderDraft()
  const resolvedChoiceSets = resolveAvailableChoices(draft, context)
  const preview = buildCharacterPreview(
    draft,
    catalogIndex,
    context.characterCreationRules,
    context.rulesetId,
    { resolvedChoiceSets },
  )

  const railProps = {
    draft,
    context,
    catalogIndex,
    preview,
    resolvedChoiceSets,
    currentStepId: 'identity' as const,
    canCreateCharacter: false,
    validationVisibleStepIds: [] as const,
    validationIssues: [] as const,
  }

  it('renders PreviewRail identity, sections, and footer from the shared projection', () => {
    render(<CharacterBuilderPreviewRail {...railProps} />)

    expect(screen.getByRole('heading', { name: 'Character preview' })).toBeInTheDocument()
    expect(screen.getByText(PREVIEW_UNNAMED_CHARACTER)).toBeInTheDocument()
    expect(screen.getByText('Level 1 · Choose class')).toBeInTheDocument()
    expect(screen.getByText(PREVIEW_CHOOSE_SPECIES)).toBeInTheDocument()
    expect(screen.getByText(PREVIEW_CHOOSE_ALIGNMENT)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sections' })).toBeInTheDocument()
    expect(screen.getByText('Narrative')).toBeInTheDocument()
    expect(screen.getByText('Builder incomplete')).toBeInTheDocument()
  })

  it('renders the same projection in card and plain chrome', () => {
    const projection = projectBuilderPreviewRail({
      draft,
      context,
      catalogIndex,
      preview,
      resolvedChoiceSets,
      currentStepId: 'identity',
      manualOpenSection: null,
      canCreateCharacter: false,
      validationVisibleStepIds: [],
      validationIssues: [],
    })!

    const sharedViewProps = {
      projection,
      preview,
      draft,
      catalogIndex,
      resolvedChoiceSets,
      openSectionId: projection.openSectionId,
      onOpenSectionChange: () => undefined,
    }

    const { unmount: unmountCard } = render(
      <CharacterBuilderPreviewRailView {...sharedViewProps} chrome="card" layout="fill" />,
    )
    expect(screen.getByText(PREVIEW_UNNAMED_CHARACTER)).toBeInTheDocument()
    expect(screen.getByText('Builder incomplete')).toBeInTheDocument()
    unmountCard()

    render(
      <CharacterBuilderPreviewRailView
        {...sharedViewProps}
        chrome="plain"
        layout="fill"
        hideHeader
      />,
    )
    expect(screen.queryByRole('heading', { name: 'Character preview' })).not.toBeInTheDocument()
    expect(screen.getByText(PREVIEW_UNNAMED_CHARACTER)).toBeInTheDocument()
    expect(screen.getByText('Builder incomplete')).toBeInTheDocument()
  })
})
