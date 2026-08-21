import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'

import { PageLoadState } from '@/components/layout/page/page-load-state'

import { CharacterBuilderShell } from '../components/builder/character-builder-shell.client'
import { characterBuilderRouteClasses } from '../components/builder/character-builder-shell.variants'
import { useBuildContext } from '../hooks/use-build-context'

export function CharacterCreate() {
  const rulesetId = DEFAULT_SYSTEM_RULESET_ID
  const { context, catalogIndex, isPending, isError, error } = useBuildContext(rulesetId)

  return (
    <div className={characterBuilderRouteClasses}>
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={error?.message}
        defaultErrorLabel="Could not load character builder."
      >
        {context && catalogIndex ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <CharacterBuilderShell context={context} catalogIndex={catalogIndex} />
          </div>
        ) : null}
      </PageLoadState>
    </div>
  )
}
