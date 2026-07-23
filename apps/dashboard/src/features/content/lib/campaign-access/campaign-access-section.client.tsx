'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import {
  CONTENT_ACCESS_CAPABILITIES,
  getErrorMessage,
  type ContentAccessTargetType,
  type ContentCampaignAccessPatch,
  type ContentUsageBlocker,
  type ResolvedContentCampaignAccess,
  contentCampaignAccessPatchSchema,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'
import { FormItems, FormSectionProvider, FormUiProvider, makeResolver } from '@rpg/ui/form'

import {
  fetchContentCampaignAccessAvailability,
  updateContentCampaignAccess,
} from './campaign-access-api'
import { CampaignAccessBlockedDialog } from './campaign-access-blocked-dialog.client'
import { CampaignAccessFormProvider } from './campaign-access-form-context.client'
import { buildCampaignAccessFields } from './campaign-access-form-fields'
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
  const groupId = `campaign-access-${entityId ?? 'create'}`

  const [persistError, setPersistError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])

  const entityIdRef = useRef(entityId)
  entityIdRef.current = entityId

  const initialPatch = useMemo(() => resolvedToCampaignAccessPatch(initialAccess), [initialAccess])

  const resolverFields = useMemo(
    () =>
      buildCampaignAccessFields({
        targetType,
        available: true,
        pending: false,
        groupId,
      }),
    [groupId, targetType],
  )

  const resolver = useMemo(
    () =>
      makeResolver<ContentCampaignAccessPatch>(contentCampaignAccessPatchSchema, resolverFields),
    [resolverFields],
  )

  const form = useForm<ContentCampaignAccessPatch>({
    resolver,
    defaultValues: initialPatch,
    mode: 'onSubmit',
  })

  const available = useWatch({ control: form.control, name: 'available' })

  const renderedFields = useMemo(
    () =>
      buildCampaignAccessFields({
        targetType,
        available: available ?? initialPatch.available,
        pending,
        groupId,
      }),
    [available, groupId, initialPatch.available, pending, targetType],
  )

  useEffect(() => {
    form.reset(initialPatch)
    setPersistError(null)
    setBlockedOpen(false)
    setBlockers([])
  }, [entityId, form, initialPatch])

  const applyLocalChange = useCallback(
    (next: ContentCampaignAccessPatch) => {
      form.reset(next)
      if (!entityIdRef.current) {
        onDraftChange?.(next)
      }
    },
    [form, onDraftChange],
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
          form.reset(initialPatch)
          return
        }

        const nextPatch = resolvedToCampaignAccessPatch(result.campaignAccess)
        form.reset(nextPatch)
        onPersistedChange?.(result.campaignAccess)
      } catch (err) {
        setPersistError(getErrorMessage(err, 'Could not update campaign access.'))
        form.reset(initialPatch)
      } finally {
        setPending(false)
      }
    },
    [applyLocalChange, campaignId, classId, form, initialPatch, onPersistedChange, targetType],
  )

  const handleAvailableChange = useCallback(
    async (checked: boolean) => {
      const current = form.getValues()
      const next = { ...current, available: checked }

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

      form.setValue('available', checked, { shouldDirty: true })
      await persistPatch(next)
    },
    [campaignId, classId, form, persistPatch, targetType],
  )

  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      if (type !== 'change' || name !== 'visibilityMode') return
      void persistPatch(values as ContentCampaignAccessPatch)
    })
    return () => subscription.unsubscribe()
  }, [form, persistPatch])

  if (capability.mode === 'unsupported') {
    return null
  }

  return (
    <CampaignAccessFormProvider value={{ pending, onAvailableChange: handleAvailableChange }}>
      <FormProvider {...form}>
        <FormUiProvider fields={renderedFields}>
          <FormSectionProvider size="md" rhythm="comfortable" inRhythmStack>
            {persistError ? (
              <Text variant="destructive" role="alert" className="mb-4">
                {persistError}
              </Text>
            ) : null}
            <FormItems key={groupId} items={renderedFields} idPrefix={sectionId} />
          </FormSectionProvider>
        </FormUiProvider>
      </FormProvider>

      <CampaignAccessBlockedDialog
        open={blockedOpen}
        onOpenChange={setBlockedOpen}
        blockers={blockers}
      />
    </CampaignAccessFormProvider>
  )
}
