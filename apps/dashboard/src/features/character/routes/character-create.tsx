import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'

import { PageLoadState } from '@/components/layout/page/page-load-state'

import { CharacterBuilderPageShell } from '../components/builder/character-builder-page-shell'
import { CharacterBuilderShell } from '../components/builder/character-builder-shell'
import { useBuildContext } from '../hooks/use-build-context'

export function CharacterCreate() {
  const rulesetId = DEFAULT_SYSTEM_RULESET_ID
  const { context, catalogIndex, isPending, isError, error } = useBuildContext(rulesetId)

  return (
    <CharacterBuilderPageShell className="h-dvh">
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={error?.message}
        defaultErrorLabel="Could not load character builder."
      >
        {context && catalogIndex ? (
          <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />
        ) : null}
      </PageLoadState>
    </CharacterBuilderPageShell>
  )
}
