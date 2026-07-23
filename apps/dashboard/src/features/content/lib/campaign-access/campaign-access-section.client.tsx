'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  CONTENT_ACCESS_CAPABILITIES,
  CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED,
  CONTENT_VISIBILITY_MODE_ENTRIES,
  CONTENT_VISIBILITY_MODE_TERM,
  CONTENT_VISIBILITY_SELECT_HINT,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  getErrorMessage,
  type ContentAccessTargetType,
  type ContentCampaignAccessPatch,
  type ContentUsageBlocker,
  type ContentVisibilityMode,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { SelectField, SwitchField, Text } from '@rpg/ui'

import {
  fetchContentCampaignAccessAvailability,
  updateContentCampaignAccess,
} from './campaign-access-api'
import { CampaignAccessBlockedDialog } from './campaign-access-blocked-dialog.client'
import {
  CAMPAIGN_ACCESS_AVAILABLE_HINT,
  CAMPAIGN_ACCESS_AVAILABLE_LABEL,
  CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT,
} from './campaign-access-labels'
import { resolvedToCampaignAccessPatch } from './campaign-access-state'

export interface CampaignAccessSectionProps {
  campaignId: string
  targetType: ContentAccessTargetType
  /** Present on edit; omitted on create until the entity exists. */
  entityId?: string
  /** Parent class id — required when `targetType` is `subclasses`. */
  classId?: string
  /** Resolved access from list rows on edit; defaults when omitted (create). */
  initialAccess?: ResolvedContentCampaignAccess
  /** Create-time draft callback — no API writes until the entity id exists. */
  onDraftChange?: (patch: ContentCampaignAccessPatch) => void
  /** Called after a successful persisted PATCH on edit. */
  onPersistedChange?: (access: ResolvedContentCampaignAccess) => void
}

function buildVisibilityOptions(
  targetType: ContentAccessTargetType,
  available: boolean,
): Array<{ value: ContentVisibilityMode; label: string; disabled?: boolean; hint?: string }> {
  const capability = CONTENT_ACCESS_CAPABILITIES[targetType]
  if (capability.mode !== 'owned') return []

  return capability.visibilityModes.map((mode) => {
    const entry = CONTENT_VISIBILITY_MODE_ENTRIES[mode]
    const disabledByAvailability = !available
    const disabledByGate = mode === 'specific_players' && !CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED

    return {
      value: mode,
      label: entry.label,
      disabled: disabledByAvailability || disabledByGate,
      hint:
        mode === 'specific_players' && disabledByGate
          ? CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT
          : undefined,
    }
  })
}

export function CampaignAccessSection({
  campaignId,
  targetType,
  entityId,
  classId,
  initialAccess = DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  onDraftChange,
  onPersistedChange,
}: CampaignAccessSectionProps) {
  const capability = CONTENT_ACCESS_CAPABILITIES[targetType]
  const sectionId = useId()
  const availableId = `${sectionId}-available`
  const visibilityId = `${sectionId}-visibility`

  const [access, setAccess] = useState<ContentCampaignAccessPatch>(() =>
    resolvedToCampaignAccessPatch(initialAccess),
  )
  const [persistError, setPersistError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])

  const entityIdRef = useRef(entityId)
  entityIdRef.current = entityId

  useEffect(() => {
    setAccess(resolvedToCampaignAccessPatch(initialAccess))
    setPersistError(null)
    setBlockedOpen(false)
    setBlockers([])
  }, [entityId, initialAccess])

  const visibilityOptions = useMemo(
    () => buildVisibilityOptions(targetType, access.available),
    [access.available, targetType],
  )

  const visibilityHint = !CONTENT_ACCESS_SPECIFIC_PLAYERS_ENABLED
    ? CAMPAIGN_ACCESS_SPECIFIC_PLAYERS_DISABLED_HINT
    : CONTENT_VISIBILITY_SELECT_HINT

  const applyLocalChange = useCallback(
    (next: ContentCampaignAccessPatch) => {
      setAccess(next)
      if (!entityIdRef.current) {
        onDraftChange?.(next)
      }
    },
    [onDraftChange],
  )

  const persistPatch = useCallback(
    async (patch: ContentCampaignAccessPatch) => {
      const resolvedEntityId = entityIdRef.current
      if (!resolvedEntityId) {
        applyLocalChange(patch)
        return
      }

      setPersistError(null)
      setPending(true)
      try {
        const result = await updateContentCampaignAccess(
          campaignId,
          targetType,
          resolvedEntityId,
          patch,
          { classId },
        )
        if (result.status === 'blocked') {
          setBlockers(result.blockers)
          setBlockedOpen(true)
          setAccess(resolvedToCampaignAccessPatch(initialAccess))
          return
        }

        setAccess(resolvedToCampaignAccessPatch(result.campaignAccess))
        onPersistedChange?.(result.campaignAccess)
      } catch (err) {
        setPersistError(getErrorMessage(err, 'Could not update campaign access.'))
        setAccess(resolvedToCampaignAccessPatch(initialAccess))
      } finally {
        setPending(false)
      }
    },
    [applyLocalChange, campaignId, classId, initialAccess, onPersistedChange, targetType],
  )

  const handleAvailableChange = useCallback(
    async (checked: boolean) => {
      const next = { ...access, available: checked }

      if (!checked && entityIdRef.current) {
        setPending(true)
        setPersistError(null)
        try {
          const availability = await fetchContentCampaignAccessAvailability(
            campaignId,
            targetType,
            entityIdRef.current,
            { classId },
          )
          if (availability.status === 'blocked') {
            setBlockers(availability.blockers)
            setBlockedOpen(true)
            return
          }
        } catch (err) {
          setPersistError(getErrorMessage(err, 'Could not check campaign access availability.'))
          return
        } finally {
          setPending(false)
        }
      }

      await persistPatch(next)
    },
    [access, campaignId, classId, persistPatch, targetType],
  )

  const handleVisibilityChange = useCallback(
    (value: string) => {
      const visibilityMode = value as ContentVisibilityMode
      void persistPatch({ ...access, visibilityMode })
    },
    [access, persistPatch],
  )

  if (capability.mode === 'unsupported') {
    return null
  }

  return (
    <section
      aria-labelledby={`${sectionId}-legend`}
      className="space-y-4 rounded-lg border border-border bg-card p-4"
    >
      <div>
        <h2 id={`${sectionId}-legend`} className="text-sm font-medium text-foreground">
          Campaign access
        </h2>
      </div>

      {persistError ? (
        <Text variant="destructive" role="alert">
          {persistError}
        </Text>
      ) : null}

      <SwitchField
        id={availableId}
        label={CAMPAIGN_ACCESS_AVAILABLE_LABEL}
        hint={CAMPAIGN_ACCESS_AVAILABLE_HINT}
        checked={access.available}
        disabled={pending}
        onCheckedChange={(checked) => void handleAvailableChange(checked)}
      />

      <SelectField
        id={visibilityId}
        label={CONTENT_VISIBILITY_MODE_TERM.label}
        hint={visibilityHint}
        options={visibilityOptions.map((option) => ({
          value: option.value,
          label: option.label,
          disabled: option.disabled,
        }))}
        value={access.visibilityMode}
        disabled={pending || !access.available}
        onValueChange={handleVisibilityChange}
      />

      <CampaignAccessBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        blockers={blockers}
      />
    </section>
  )
}
