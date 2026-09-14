import type {
  CharacterBuildCatalogIndex,
  CharacterBuildPreview,
  CharacterBuilderDraft,
  ChoiceSet,
} from '@rpg/contracts'
import { PreviewRail, Text, type PreviewRailLayout } from '@rpg/ui'
import { User } from 'lucide-react'

import { getBuilderDraftNarrative } from '../../../lib/builder-preview/character-builder-preview-panel.lib'
import type { BuilderPreviewRailProjection } from '../../../lib/builder-preview/builder-preview-projection.lib'
import {
  BUILDER_PREVIEW_HEADER_TITLE,
  BUILDER_PREVIEW_SECTIONS_DESCRIPTION,
  BUILDER_PREVIEW_SECTIONS_TITLE,
} from '../../../lib/builder-preview/builder-preview-rail-copy'
import {
  CharacterBuilderPreviewAbilitiesBody,
  CharacterBuilderPreviewCombatBody,
  CharacterBuilderPreviewEquipmentBody,
  CharacterBuilderPreviewNarrativeBody,
  CharacterBuilderPreviewProficienciesBody,
  CharacterBuilderPreviewSpellsBody,
} from './character-builder-preview-rail-section-bodies'

export type CharacterBuilderPreviewRailViewProps = {
  chrome: 'card' | 'plain'
  layout?: PreviewRailLayout
  hideHeader?: boolean
  projection: BuilderPreviewRailProjection
  preview: CharacterBuildPreview
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  resolvedChoiceSets: readonly ChoiceSet[]
  openSectionId: string
  onOpenSectionChange: (value: string) => void
}

function CharacterBuilderPreviewSectionBody({
  sectionId,
  projection,
  preview,
  draft,
  catalogIndex,
  resolvedChoiceSets,
}: {
  sectionId: string
  projection: BuilderPreviewRailProjection
  preview: CharacterBuildPreview
  draft: CharacterBuilderDraft
  catalogIndex: CharacterBuildCatalogIndex
  resolvedChoiceSets: readonly ChoiceSet[]
}) {
  switch (sectionId) {
    case 'narrative':
      return <CharacterBuilderPreviewNarrativeBody narrative={getBuilderDraftNarrative(draft)} />
    case 'combat':
      return <CharacterBuilderPreviewCombatBody preview={preview} />
    case 'abilities':
      return <CharacterBuilderPreviewAbilitiesBody preview={preview} />
    case 'proficiencies':
      return (
        <CharacterBuilderPreviewProficienciesBody
          preview={preview}
          catalogIndex={catalogIndex}
          draft={draft}
          resolvedChoiceSets={resolvedChoiceSets}
          hasCharacterClass={projection.hasCharacterClass}
        />
      )
    case 'equipment':
      return (
        <CharacterBuilderPreviewEquipmentBody
          preview={preview}
          hasCharacterClass={projection.hasCharacterClass}
        />
      )
    case 'spells':
      return (
        <CharacterBuilderPreviewSpellsBody
          draft={draft}
          resolvedChoiceSets={resolvedChoiceSets}
          hasCharacterClass={projection.hasCharacterClass}
          spellcastingActive={projection.spellcastingActive}
        />
      )
    default:
      return null
  }
}

export function CharacterBuilderPreviewRailView({
  chrome,
  layout = 'fill',
  hideHeader = false,
  projection,
  preview,
  draft,
  catalogIndex,
  resolvedChoiceSets,
  openSectionId,
  onOpenSectionChange,
}: CharacterBuilderPreviewRailViewProps) {
  return (
    <PreviewRail chrome={chrome} layout={layout}>
      {hideHeader ? null : (
        <PreviewRail.Header
          title={BUILDER_PREVIEW_HEADER_TITLE}
          badge={<PreviewRail.DraftBadge />}
        />
      )}
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<User />} />}
        name={projection.identity.name}
        status={
          <Text as="p" variant="muted" className="text-sm">
            {projection.identity.statusLine}
          </Text>
        }
        facts={projection.identity.facts}
      />
      <PreviewRail.ScrollRegion>
        <PreviewRail.Sections
          title={BUILDER_PREVIEW_SECTIONS_TITLE}
          description={BUILDER_PREVIEW_SECTIONS_DESCRIPTION}
          value={openSectionId}
          onValueChange={onOpenSectionChange}
        >
          {projection.sections.map((section) => (
            <PreviewRail.Section
              key={section.id}
              id={section.id}
              label={section.label}
              marker={section.marker}
              {...(section.status ? { status: section.status } : {})}
              {...(section.statusTone ? { statusTone: section.statusTone } : {})}
              expandable={section.expandable}
            >
              {section.expandable ? (
                <CharacterBuilderPreviewSectionBody
                  sectionId={section.id}
                  projection={projection}
                  preview={preview}
                  draft={draft}
                  catalogIndex={catalogIndex}
                  resolvedChoiceSets={resolvedChoiceSets}
                />
              ) : null}
            </PreviewRail.Section>
          ))}
        </PreviewRail.Sections>
      </PreviewRail.ScrollRegion>
      <PreviewRail.Footer>
        <PreviewRail.StatusPanel {...projection.footerPanel} />
      </PreviewRail.Footer>
    </PreviewRail>
  )
}
