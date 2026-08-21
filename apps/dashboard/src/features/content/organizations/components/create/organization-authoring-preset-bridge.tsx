import { useEffect, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import {
  getOrganizationAuthoringPresetRecommendedPractices,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  type OrganizationAuthoringPresetId,
} from '@rpg/contracts'

import { useOrganizationAuthoringContext } from './organization-authoring-context'

function isOrganizationAuthoringPresetId(value: unknown): value is OrganizationAuthoringPresetId {
  return (
    typeof value === 'string' &&
    ORGANIZATION_AUTHORING_PRESET_IDS.includes(value as OrganizationAuthoringPresetId)
  )
}

function resolveAuthoringPresetFieldPath(prefix?: string): string {
  return prefix ? `${prefix}.authoringPresetId` : 'authoringPresetId'
}

export function OrganizationAuthoringPresetBridge({ prefix }: { prefix?: string }) {
  const { setPracticeRecommendations } = useOrganizationAuthoringContext()
  const presetId = useWatch({ name: resolveAuthoringPresetFieldPath(prefix) })
  const lastPositivePresetId = useRef<OrganizationAuthoringPresetId | null>(null)

  useEffect(() => {
    if (!isOrganizationAuthoringPresetId(presetId)) {
      return
    }
    if (lastPositivePresetId.current === presetId) {
      return
    }
    lastPositivePresetId.current = presetId
    setPracticeRecommendations([...getOrganizationAuthoringPresetRecommendedPractices(presetId)])
  }, [presetId, setPracticeRecommendations])

  return null
}
