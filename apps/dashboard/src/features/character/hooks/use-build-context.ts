import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  DEFAULT_ABILITY_GENERATION_RULES,
  indexCharacterBuildCatalog,
  resolveCharacterBuilderDraftKey,
  resolveCharacterBuilderDraftScope,
  type CharacterBuildContext,
  type CharacterBuilderDraftScope,
  type StandaloneBuildContext,
  type SystemRulesetId,
} from '@rpg/contracts'

import { useSession } from '@/features/auth'

import {
  buildContextQueryKey,
  fetchBuilderCatalog,
  fetchCharacterCreationRules,
} from '../api/ruleset-content-client'

export function useBuildContext(rulesetId: SystemRulesetId | undefined) {
  const { data: session } = useSession()
  const query = useQuery({
    queryKey: rulesetId ? buildContextQueryKey(rulesetId) : [],
    queryFn: async () => {
      const [catalog, patch] = await Promise.all([
        fetchBuilderCatalog(rulesetId!),
        fetchCharacterCreationRules(rulesetId!),
      ])
      return { catalog, patch }
    },
    enabled: Boolean(rulesetId),
  })

  const context = useMemo((): StandaloneBuildContext | null => {
    if (!rulesetId || !query.data) return null

    return {
      channel: 'build',
      surface: 'dashboard',
      characterKind: 'pc',
      mode: 'dashboard',
      scope: { type: 'standalone', rulesetId },
      rulesScope: { type: 'ruleset', rulesetId },
      ownershipTarget: { type: 'user' },
      rulesetId,
      catalog: query.data.catalog,
      characterCreationRules: {
        ...query.data.patch.characterCreation,
        abilityGeneration: DEFAULT_ABILITY_GENERATION_RULES,
        armorClass: query.data.patch.mechanics.armorClass,
      },
      permissions: { canCreateCharacter: true },
      playActor: { kind: 'new_pc' },
    }
  }, [rulesetId, query.data])

  const catalogIndex = useMemo(
    () => (context ? indexCharacterBuildCatalog(context.catalog) : null),
    [context],
  )

  const draftScope = useMemo((): CharacterBuilderDraftScope | null => {
    if (!context) return null
    return resolveCharacterBuilderDraftScope(context, session?.user.id)
  }, [context, session?.user.id])

  const storageKey = useMemo(
    () => (draftScope ? resolveCharacterBuilderDraftKey(draftScope, { mode: 'dashboard' }) : null),
    [draftScope],
  )

  return {
    ...query,
    context,
    catalogIndex,
    draftScope,
    storageKey,
  }
}

export type BuildContextResult = ReturnType<typeof useBuildContext>

export type { CharacterBuildContext, StandaloneBuildContext, SystemRulesetId }
