import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'

import { PageLoadState } from '@/components/layout/page-load-state'

import { CharacterBuilderShell } from '../components/character-builder-shell.client'
import { useBuildContext } from '../hooks/use-build-context'

export function CharacterCreate() {
  const rulesetId = DEFAULT_SYSTEM_RULESET_ID
  const { context, catalogIndex, isPending, isError, error } = useBuildContext(rulesetId)

  return (
    <div className="mx-auto flex min-h-dvh max-w-screen-2xl flex-col px-6 py-8">
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
    </div>
  )
}
