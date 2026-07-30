'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { FormProvider, useForm, useFormState, useWatch } from 'react-hook-form'
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

import { hasDirtyFields } from '@/lib/form-dirty-state'

import {
  fetchContentCampaignAccessAvailability,
  updateContentCampaignAccess,
} from './campaign-access-api'
import { CampaignAccessBlockedDialog } from './campaign-access-blocked-dialog.client'
import {
  CampaignAccessAvailabilityProvider,
  useCampaignAccessParticipantUpdater,
  type CampaignAccessSaveResult,
} from './campaign-access-form-context.client'
import { buildCampaignAccessFields } from './campaign-access-form-fields'
import { formatCampaignAccessParticipantOptionLabel } from './campaign-access-labels'
import {
  isDefaultCampaignAccessPatch,
  resolvedToCampaignAccessPatch,
} from './campaign-access-state'
import { useCampaignAccessParticipantRoster } from './use-campaign-access-participant-roster'

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

  const [persistedBaseline, setPersistedBaseline] = useState<ContentCampaignAccessPatch>(() =>
    resolvedToCampaignAccessPatch(initialAccess),
  )
  const [persistError, setPersistError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [blockers, setBlockers] = useState<ContentUsageBlocker[]>([])

  const entityIdRef = useRef(entityId)
  entityIdRef.current = entityId

  const { data: participantRoster = [] } = useCampaignAccessParticipantRoster(campaignId)
  const participantOptions = useMemo(
    () =>
      participantRoster.map((participant) => ({
        value: participant.id,
        label: formatCampaignAccessParticipantOptionLabel(
          participant.name,
          participant.playerDisplayName,
        ),
      })),
    [participantRoster],
  )

  const initialPatch = useMemo(() => resolvedToCampaignAccessPatch(initialAccess), [initialAccess])

  const resolverFields = useMemo(
    () =>
      buildCampaignAccessFields({
        targetType,
        available: true,
        pending: false,
        groupId,
        participantOptions,
      }),
    [groupId, participantOptions, targetType],
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
  const watchedValues = useWatch({ control: form.control })
  const { dirtyFields } = useFormState({ control: form.control })

  const renderedFields = useMemo(
    () =>
      buildCampaignAccessFields({
        targetType,
        available: available ?? initialPatch.available,
        pending,
        groupId,
        participantOptions,
      }),
    [available, groupId, initialPatch.available, participantOptions, pending, targetType],
  )

  useEffect(() => {
    const baseline = resolvedToCampaignAccessPatch(initialAccess)
    setPersistedBaseline(baseline)
    form.reset(baseline)
    setPersistError(null)
    setBlockedOpen(false)
    setBlockers([])
  }, [entityId, form, initialAccess, initialPatch])

  const isEditMode = Boolean(entityId)
  const isDirty = isEditMode
    ? hasDirtyFields(dirtyFields)
    : !isDefaultCampaignAccessPatch(
        (watchedValues ?? form.getValues()) as ContentCampaignAccessPatch,
      )

  const applyLocalChange = useCallback(
    (next: ContentCampaignAccessPatch) => {
      form.reset(next)
      if (!entityIdRef.current) {
        onDraftChange?.(next)
      }
    },
    [form, onDraftChange],
  )

  const reset = useCallback(() => {
    form.reset(persistedBaseline)
    setPersistError(null)
  }, [form, persistedBaseline])

  const save = useCallback(async (): Promise<CampaignAccessSaveResult> => {
    if (!isDirty) {
      return { status: 'skipped' }
    }

    const values = form.getValues()
    const parsed = contentCampaignAccessPatchSchema.safeParse(values)
    if (!parsed.success) {
      return { status: 'invalid', message: 'Campaign access values are invalid.' }
    }

    const resolvedEntityId = entityIdRef.current
    if (!resolvedEntityId) {
      applyLocalChange(parsed.data)
      return { status: 'skipped' }
    }

    setPersistError(null)
    setPending(true)
    try {
      const result = await updateContentCampaignAccess(
        campaignId,
        targetType,
        resolvedEntityId,
        parsed.data,
        { classId },
      )

      if (result.status === 'blocked') {
        setBlockers(result.blockers)
        setBlockedOpen(true)
        form.setValue('available', persistedBaseline.available, { shouldDirty: true })
        return { status: 'blocked', blockers: result.blockers }
      }

      const nextPatch = resolvedToCampaignAccessPatch(result.campaignAccess)
      setPersistedBaseline(nextPatch)
      form.reset(nextPatch)
      onPersistedChange?.(result.campaignAccess)
      return { status: 'updated', campaignAccess: result.campaignAccess }
    } catch (err) {
      const message = getErrorMessage(err, 'Could not update campaign access.')
      setPersistError(message)
      return { status: 'invalid', message }
    } finally {
      setPending(false)
    }
  }, [
    applyLocalChange,
    campaignId,
    classId,
    form,
    isDirty,
    onPersistedChange,
    persistedBaseline.available,
    targetType,
  ])

  useCampaignAccessParticipantUpdater(
    useMemo(
      () => ({
        isDirty,
        isPending: pending,
        save,
        reset,
        readPendingAvailable: () => form.getValues().available,
      }),
      [form, isDirty, pending, reset, save],
    ),
  )

  const handleAvailableChange = useCallback(
    async (checked: boolean) => {
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

      if (!entityIdRef.current) {
        onDraftChange?.(form.getValues())
      }
    },
    [campaignId, classId, form, onDraftChange, targetType],
  )

  useEffect(() => {
    if (entityIdRef.current) {
      return
    }

    const subscription = form.watch((values, { type }) => {
      if (type !== 'change') return
      onDraftChange?.(values as ContentCampaignAccessPatch)
    })
    return () => subscription.unsubscribe()
  }, [form, onDraftChange])

  if (capability.mode === 'unsupported') {
    return null
  }

  return (
    <CampaignAccessAvailabilityProvider
      value={{ pending, onAvailableChange: handleAvailableChange }}
    >
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
    </CampaignAccessAvailabilityProvider>
  )
}
