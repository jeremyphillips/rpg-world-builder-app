'use client'

import {
  isSpellcastingActiveAtLevel,
  resolveAvailableChoices,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type CharacterBuildContext,
} from '@rpg/contracts'
import { Eyebrow, InsetPanel, Text } from '@rpg/ui'

import {
  getBuilderDraftNarrative,
  CHARACTER_BUILDER_PREVIEW_SECTIONS,
  type CharacterBuilderPreviewSectionId,
} from '../../../lib/builder-preview/character-builder-preview-panel.lib'
import { narrativeFieldCount } from '../../../lib/builder-preview/narrative-preview'
import {
  getPreviewAlignmentLine,
  getPreviewIdentityName,
  getPreviewLevelClassLine,
  getPreviewSpeciesLine,
} from '../../../lib/builder-preview/preview-identity-summary'
import { CharacterBuilderPreviewAccordion } from './character-builder-preview-accordion.client'
import {
  characterBuilderPreviewIdentitySummaryClasses,
  characterBuilderPreviewPanelInsetClasses,
  characterBuilderPreviewPanelRootClasses,
} from '../character-builder-shell.variants'

export { CHARACTER_BUILDER_PREVIEW_SECTIONS }
export type { CharacterBuilderPreviewSectionId }

export type CharacterBuilderPreviewPanelProps = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  preview: CharacterBuildPreview | null
}

export function CharacterBuilderPreviewPanel({
  draft,
  context,
  catalogIndex,
  preview,
}: CharacterBuilderPreviewPanelProps) {
  const narrative = getBuilderDraftNarrative(draft)
  const narrativeCount = narrativeFieldCount(narrative)
  const characterClass = draft.class.classId
    ? catalogIndex.classes.get(draft.class.classId)
    : undefined
  const spellcastingActive =
    characterClass !== undefined &&
    isSpellcastingActiveAtLevel(characterClass.spellcasting, draft.class.level)
  const resolvedChoiceSets = preview ? resolveAvailableChoices(draft, context) : []

  return (
    <aside
      aria-labelledby="character-builder-preview-heading"
      className={characterBuilderPreviewPanelRootClasses}
    >
      <Eyebrow id="character-builder-preview-heading" size="sm" className="shrink-0">
        Preview
      </Eyebrow>

      <InsetPanel size="md" className={characterBuilderPreviewPanelInsetClasses}>
        <div className={characterBuilderPreviewIdentitySummaryClasses}>
          <Text as="p" variant="body" className="font-medium">
            {getPreviewIdentityName(draft)}
          </Text>
          <Text as="p" variant="muted" className="text-sm">
            {getPreviewLevelClassLine(draft, catalogIndex)}
          </Text>
          <Text as="p" variant="muted" className="text-sm">
            {getPreviewSpeciesLine(draft, catalogIndex)}
          </Text>
          <Text as="p" variant="muted" className="text-sm">
            {getPreviewAlignmentLine(draft)}
          </Text>
        </div>

        {!preview ? (
          <Text variant="muted">Preview will appear once builder context is ready.</Text>
        ) : (
          <CharacterBuilderPreviewAccordion
            preview={preview}
            catalogIndex={catalogIndex}
            draft={draft}
            resolvedChoiceSets={resolvedChoiceSets}
            narrative={narrative}
            narrativeCount={narrativeCount}
            hasCharacterClass={characterClass !== undefined}
            spellcastingActive={spellcastingActive}
          />
        )}
      </InsetPanel>
    </aside>
  )
}
