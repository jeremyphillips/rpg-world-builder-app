import { useMemo, useState } from 'react'
import {
  resolveAvailableChoices,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterBuildPreview,
  type CharacterBuildContext,
  type ChoiceSet,
} from '@rpg/contracts'
import type {
  CharacterBuilderStepId,
  CharacterBuildValidationIssue,
} from '@rpg/contracts/rpg/character-builder'
import { Button, PreviewRail, Sheet } from '@rpg/ui'
import { Eye } from 'lucide-react'

import type { CharacterBuilderPreviewSectionId } from '../../../lib/builder-preview/character-builder-preview-panel.lib'
import { projectBuilderPreviewRail } from '../../../lib/builder-preview/builder-preview-projection.lib'
import {
  BUILDER_PREVIEW_COMPACT_LABEL,
  BUILDER_PREVIEW_HEADER_TITLE,
} from '../../../lib/builder-preview/builder-preview-rail-copy'
import {
  useMediaMinWidth,
  VIEWPORT_MD_MIN_QUERY,
} from '../../../lib/builder-preview/use-media-min-width'
import { CharacterBuilderPreviewRailPlaceholder } from './character-builder-preview-rail-section-bodies'
import { CharacterBuilderPreviewRailView } from './character-builder-preview-rail-view'
import { characterBuilderPreviewCompactTriggerClasses } from '../character-builder-shell.variants'

export type CharacterBuilderPreviewRailProps = {
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  catalogIndex: CharacterBuildCatalogIndex
  preview: CharacterBuildPreview | null
  resolvedChoiceSets: readonly ChoiceSet[] | null
  currentStepId: CharacterBuilderStepId
  canCreateCharacter: boolean
  validationVisibleStepIds: readonly CharacterBuilderStepId[]
  validationIssues: readonly CharacterBuildValidationIssue[]
}

function CharacterBuilderPreviewRailBody({
  chrome,
  hideHeader = false,
  ...props
}: CharacterBuilderPreviewRailProps & {
  chrome: 'card' | 'plain'
  hideHeader?: boolean
}) {
  const {
    draft,
    context,
    catalogIndex,
    preview,
    resolvedChoiceSets,
    currentStepId,
    canCreateCharacter,
    validationVisibleStepIds,
    validationIssues,
  } = props

  const [manualOpenSection, setManualOpenSection] = useState<{
    forStepId: CharacterBuilderStepId
    value: CharacterBuilderPreviewSectionId
  } | null>(null)

  const effectiveChoiceSets = useMemo(
    () => resolvedChoiceSets ?? (preview ? resolveAvailableChoices(draft, context) : []),
    [context, draft, preview, resolvedChoiceSets],
  )

  const projection = useMemo(
    () =>
      projectBuilderPreviewRail({
        draft,
        context,
        catalogIndex,
        preview,
        resolvedChoiceSets: effectiveChoiceSets,
        currentStepId,
        manualOpenSection,
        canCreateCharacter,
        validationVisibleStepIds,
        validationIssues,
      }),
    [
      canCreateCharacter,
      catalogIndex,
      context,
      currentStepId,
      draft,
      effectiveChoiceSets,
      manualOpenSection,
      preview,
      validationIssues,
      validationVisibleStepIds,
    ],
  )

  if (!preview || !projection) {
    return <CharacterBuilderPreviewRailPlaceholder />
  }

  return (
    <CharacterBuilderPreviewRailView
      chrome={chrome}
      layout="fill"
      hideHeader={hideHeader}
      projection={projection}
      preview={preview}
      draft={draft}
      catalogIndex={catalogIndex}
      resolvedChoiceSets={effectiveChoiceSets}
      openSectionId={projection.openSectionId}
      onOpenSectionChange={(value) =>
        setManualOpenSection({
          forStepId: currentStepId,
          value: value as CharacterBuilderPreviewSectionId,
        })
      }
    />
  )
}

/** Persistent desktop aside preview rail (`xl` and up). */
export function CharacterBuilderPreviewRail(props: CharacterBuilderPreviewRailProps) {
  return <CharacterBuilderPreviewRailBody {...props} chrome="card" />
}

export function CharacterBuilderPreviewCompactTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={characterBuilderPreviewCompactTriggerClasses}
      onClick={onOpen}
    >
      <Eye aria-hidden />
      {BUILDER_PREVIEW_COMPACT_LABEL}
    </Button>
  )
}

/** Compact sheet host for preview below the persistent rail breakpoint. */
export function CharacterBuilderPreviewSheet(props: CharacterBuilderPreviewRailProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const isMdUp = useMediaMinWidth(VIEWPORT_MD_MIN_QUERY)

  return (
    <>
      <CharacterBuilderPreviewCompactTrigger onOpen={() => setSheetOpen(true)} />
      <Sheet.Root open={sheetOpen} onOpenChange={setSheetOpen}>
        <Sheet.Content
          side={isMdUp ? 'right' : 'bottom'}
          size="lg"
          surface="field-container"
          closeLabel="Close preview"
        >
          <Sheet.Header
            headline={BUILDER_PREVIEW_HEADER_TITLE}
            endSlot={<PreviewRail.DraftBadge />}
          />
          <Sheet.Body>
            <CharacterBuilderPreviewRailBody {...props} chrome="plain" hideHeader />
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>
    </>
  )
}
