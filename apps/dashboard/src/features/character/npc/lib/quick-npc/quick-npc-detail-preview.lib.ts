import {
  CharacterBuildFinalizationError,
  indexCharacterBuildCatalog,
  type CharacterBuildContext,
} from '@rpg/contracts'

import { projectCharacterDraftDetailSource } from '../../../lib/display/character-detail-draft-projection.lib'
import type { QuickNpcCreateContext } from './quick-npc-create-context'
import { assembleQuickNpcPrepareCreateArgs } from './quick-npc-authoring-submit.lib'
import { formatQuickNpcCreationError, resolveQuickNpcPreparedDraft } from './quick-npc-create'
import {
  quickNpcAuthoringTabDefaultValues,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcAuthoringTabValues,
  type QuickNpcSetupValues,
} from './quick-npc-form-fields'

export type ProjectQuickNpcDetailPreviewArgs = {
  setup: QuickNpcSetupValues
  authoringValues?: Partial<QuickNpcAuthoringTabFormValues>
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
}

export function projectQuickNpcDetailPreview({
  setup,
  authoringValues,
  buildContext,
  createContext,
}: ProjectQuickNpcDetailPreviewArgs) {
  const catalogIndex = indexCharacterBuildCatalog(buildContext.catalog)
  const tabValues = {
    ...quickNpcAuthoringTabDefaultValues,
    ...authoringValues,
  } as QuickNpcAuthoringTabValues

  const prepareArgs = assembleQuickNpcPrepareCreateArgs({
    createContext,
    setup,
    tabValues,
    buildContext,
  })
  const prepared = resolveQuickNpcPreparedDraft(prepareArgs)
  const validationNotice =
    prepared.issues.length > 0
      ? formatQuickNpcCreationError(new CharacterBuildFinalizationError(prepared.issues))
      : undefined

  const projected = projectCharacterDraftDetailSource({
    draft: prepared.draft,
    context: buildContext,
    catalogIndex,
    resolvedChoiceSets: prepared.resolvedChoiceSets,
    xpProgression: { entries: [] },
  })

  return {
    ...projected,
    completeness: {
      showPreviewNotice: projected.completeness.showPreviewNotice || prepared.issues.length > 0,
    },
    validationNotice,
  }
}
