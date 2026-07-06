'use client'

import {
  isSpellcastingActiveAtLevel,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type StandaloneBuildContext,
} from '@rpg/contracts'
import { Eyebrow, Text } from '@rpg/ui'

import {
  getBuilderDraftNarrative,
  CHARACTER_BUILDER_PREVIEW_SECTIONS,
  type CharacterBuilderPreviewSectionId,
} from '../lib/character-builder-preview-panel.lib'
import { narrativeFieldCount } from '../lib/narrative-preview'
import {
  getPreviewAlignmentLine,
  getPreviewIdentityName,
  getPreviewLevelClassLine,
  getPreviewSpeciesLine,
} from '../lib/preview-identity-summary'
import { CharacterBuilderPreviewAccordion } from './character-builder-preview-accordion.client'
import {
  characterBuilderPreviewIdentitySummaryClasses,
  characterBuilderPreviewPanelBodyClasses,
  characterBuilderPreviewPanelBodyInnerClasses,
  characterBuilderPreviewPanelRootClasses,
} from './character-builder-shell.variants'

export { CHARACTER_BUILDER_PREVIEW_SECTIONS }
export type { CharacterBuilderPreviewSectionId }

export type CharacterBuilderPreviewPanelProps = {
  draft: CharacterBuilderDraft
  context: StandaloneBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  preview: CharacterBuildPreview | null
}

export function CharacterBuilderPreviewPanel({
  draft,
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

  return (
    <aside
      aria-labelledby="character-builder-preview-heading"
      className={characterBuilderPreviewPanelRootClasses}
    >
      <Eyebrow id="character-builder-preview-heading" size="sm" className="shrink-0">
        Preview
      </Eyebrow>

      <div className={characterBuilderPreviewPanelBodyClasses}>
        <div className={characterBuilderPreviewPanelBodyInnerClasses}>
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
              narrative={narrative}
              narrativeCount={narrativeCount}
              skillChoiceCount={
                characterClass?.characterCreation?.proficiencies?.skills?.choices?.[0]?.choose
              }
              hasCharacterClass={characterClass !== undefined}
              spellcastingActive={spellcastingActive}
            />
          )}
        </div>
      </div>
    </aside>
  )
}
