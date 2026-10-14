import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Ability, CampaignCharacterGetResponse } from '@rpg/contracts'

import type { CharacterDetailAbilityScoreEditor } from '@/features/character'

import { patchCampaignCharacterAbilityScore } from '../api/campaign-character-client'
import { campaignCharacterQueryKey } from './use-campaign-character'

export function useCampaignCharacterAbilityScoreEditor(
  campaignId: string | undefined,
  characterId: string | undefined,
  initialAbilityScores: Partial<Record<Ability, number>>,
): CharacterDetailAbilityScoreEditor | undefined {
  const queryClient = useQueryClient()
  const [abilityScores, setAbilityScores] =
    useState<Partial<Record<Ability, number>>>(initialAbilityScores)
  const [pendingAbilities, setPendingAbilities] = useState<Set<Ability>>(() => new Set())
  const requestGenerationRef = useRef<Partial<Record<Ability, number>>>({})

  useEffect(() => {
    setAbilityScores(initialAbilityScores)
  }, [initialAbilityScores])

  const mutation = useMutation({
    mutationFn: (input: { ability: Ability; score: number; generation: number }) =>
      patchCampaignCharacterAbilityScore(campaignId!, characterId!, {
        ability: input.ability,
        score: input.score,
      }),
    onSuccess: (response: CampaignCharacterGetResponse, variables) => {
      if (campaignId && characterId) {
        queryClient.setQueryData(campaignCharacterQueryKey(campaignId, characterId), response)
      }
      if (requestGenerationRef.current[variables.ability] === variables.generation) {
        setAbilityScores(response.character.abilityScores)
      }
    },
  })

  const onCommit = useCallback(
    async (ability: Ability, score: number) => {
      if (!campaignId || !characterId) return
      if (abilityScores[ability] === score) return

      const generation = (requestGenerationRef.current[ability] ?? 0) + 1
      requestGenerationRef.current[ability] = generation
      const previousScore = abilityScores[ability]

      setAbilityScores((current) => ({ ...current, [ability]: score }))
      setPendingAbilities((current) => new Set(current).add(ability))

      try {
        await mutation.mutateAsync({ ability, score, generation })
      } catch {
        if (requestGenerationRef.current[ability] === generation) {
          setAbilityScores((current) => ({
            ...current,
            [ability]: previousScore,
          }))
        }
      } finally {
        setPendingAbilities((current) => {
          const next = new Set(current)
          next.delete(ability)
          return next
        })
      }
    },
    [abilityScores, campaignId, characterId, mutation],
  )

  const isAbilityPending = useCallback(
    (ability: Ability) => pendingAbilities.has(ability),
    [pendingAbilities],
  )

  if (!campaignId || !characterId) {
    return undefined
  }

  return {
    abilityScores,
    onCommit,
    isAbilityPending,
  }
}
