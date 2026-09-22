import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import type { CharacterBuildValidationIssue } from '@rpg/contracts/rpg/character-builder'

import { BuilderStepFrame } from '../shared/builder-step-frame'
import { ConnectionsStepPanels } from './connections-step-panels'

export type ConnectionsStepProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  validationIssues: CharacterBuildValidationIssue[]
  onDraftChange: (patch: Partial<CharacterBuilderDraft>) => void
}

export function ConnectionsStep({
  context,
  draft,
  validationIssues,
  onDraftChange,
}: ConnectionsStepProps) {
  return (
    <BuilderStepFrame stepId="connections" validationIssues={validationIssues}>
      <ConnectionsStepPanels
        context={context}
        relationshipEdges={draft.relationshipEdges}
        onDraftChange={onDraftChange}
      />
    </BuilderStepFrame>
  )
}
