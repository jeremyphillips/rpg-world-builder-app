import { useEffect, useRef } from 'react'
import { useWatch } from 'react-hook-form'
import {
  getOrganizationAuthoringPresetRecommendedPractices,
  type OrganizationAuthoringPresetId,
} from '@rpg/contracts'

import { useOrganizationAuthoringContext } from '../authoring/organization-authoring-context'
import {
  isOrganizationAuthoringPresetId,
  organizationStartingPointFieldPath,
} from '../../lib/presets/organization-starting-point.lib'

export function OrganizationAuthoringPresetBridge({ prefix }: { prefix?: string }) {
  const { setPracticeRecommendations } = useOrganizationAuthoringContext()
  const presetId = useWatch({ name: organizationStartingPointFieldPath(prefix) })
  const lastPositivePresetId = useRef<OrganizationAuthoringPresetId | null>(null)

  useEffect(() => {
    if (!isOrganizationAuthoringPresetId(presetId)) {
      if (lastPositivePresetId.current !== null) {
        lastPositivePresetId.current = null
        setPracticeRecommendations([])
      }
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
