import * as React from 'react'

import type { CharacterBuildContext } from '@rpg/contracts'
import { ActionIcon, Button } from '@rpg/ui'

import { CharacterDetailPreviewModal } from '../../../components/detail/character-detail-preview-modal'
import type { QuickNpcCreateContext } from '../../lib/quick-npc/quick-npc-create-context'
import {
  QUICK_NPC_PREVIEW_NPC_HEADLINE,
  QUICK_NPC_PREVIEW_NPC_LABEL,
} from '../../lib/quick-npc/quick-npc-preview-copy'
import {
  projectQuickNpcDetailPreview,
  projectQuickNpcDetailPreviewFromPrepared,
} from '../../lib/quick-npc/quick-npc-detail-preview.lib'
import type { QuickNpcPreparedDraft } from '../../lib/quick-npc/quick-npc-create'
import type {
  QuickNpcAuthoringTabFormValues,
  QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'

export type QuickNpcPreviewNpcButtonProps = {
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  setup: QuickNpcSetupValues
  /** Read at click time so preview matches the latest form state. */
  getAuthoringValues: () => Partial<QuickNpcAuthoringTabFormValues>
  /** Live prepared build; when present, preview projects it instead of re-preparing. */
  prepared?: QuickNpcPreparedDraft | null
  disabled?: boolean
  buttonRef?: React.RefObject<HTMLButtonElement | null>
}

export function QuickNpcPreviewNpcButton({
  buildContext,
  createContext,
  setup,
  getAuthoringValues,
  prepared,
  disabled = false,
  buttonRef,
}: QuickNpcPreviewNpcButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [preview, setPreview] = React.useState<ReturnType<
    typeof projectQuickNpcDetailPreview
  > | null>(null)

  const handleOpen = () => {
    setPreview(
      prepared
        ? projectQuickNpcDetailPreviewFromPrepared({ prepared, buildContext })
        : projectQuickNpcDetailPreview({
            setup,
            authoringValues: getAuthoringValues(),
            buildContext,
            createContext,
          }),
    )
    setOpen(true)
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      window.requestAnimationFrame(() => {
        buttonRef?.current?.focus()
      })
    }
  }

  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={handleOpen}
      >
        <ActionIcon action="view" />
        {QUICK_NPC_PREVIEW_NPC_LABEL}
      </Button>
      {preview ? (
        <CharacterDetailPreviewModal
          open={open}
          onOpenChange={handleOpenChange}
          headline={QUICK_NPC_PREVIEW_NPC_HEADLINE}
          viewModel={preview.viewModel}
          completeness={preview.completeness}
          previewNotice={preview.validationNotice}
        />
      ) : null}
    </>
  )
}
