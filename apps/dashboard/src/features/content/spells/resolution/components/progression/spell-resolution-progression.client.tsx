'use client'

import { useMemo } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  formatProgressionBaseValueLabel,
  formatProgressionTrackHeading,
  type SpellResolution,
} from '@rpg/contracts'
import {
  Button,
  ButtonDropdown,
  Heading,
  NumberInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@rpg/ui'
import type { ButtonDropdownItem } from '@rpg/ui'
import { useFormContext, useWatch, useController } from 'react-hook-form'

import {
  buildProgressionPresetMenuItems,
  createProgressionTrackFromPreset,
  type ProgressionPresetId,
} from '../../lib/form/resolution-progression-presets.lib'
import type { ProgressionTrackFormItem } from '../../lib/form/resolution-progression-form-schema'
import {
  deriveProgressionBasis,
  progressionFromForm,
} from '../../lib/form/resolution-progression-values'
import { RESOLUTION_SECTION_LABELS } from '../../lib/form/resolution-form-labels'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { resolutionToStored, RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

function createTrackId(): string {
  return crypto.randomUUID()
}

const DIE_FACE_OPTIONS = [
  { value: 4, label: 'd4' },
  { value: 6, label: 'd6' },
  { value: 8, label: 'd8' },
  { value: 10, label: 'd10' },
  { value: 12, label: 'd12' },
] as const

function CompactNumberField({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext()
  const { field } = useController({ control, name })

  return (
    <NumberInput
      aria-label={label}
      size="sm"
      digits={2}
      min={1}
      value={typeof field.value === 'number' ? field.value : ''}
      onChange={(event) => {
        const raw = event.target.value.trim()
        if (raw === '') {
          field.onChange(undefined)
          return
        }
        const parsed = Number(raw)
        if (!Number.isFinite(parsed)) return
        field.onChange(parsed)
      }}
    />
  )
}

function CompactDieFaceSelect({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext()
  const { field } = useController({ control, name })

  return (
    <Select
      value={field.value !== undefined ? String(field.value) : undefined}
      onValueChange={(value) => field.onChange(Number(value))}
    >
      <SelectTrigger aria-label={label} size="sm" className="w-20">
        <SelectValue placeholder="Die" />
      </SelectTrigger>
      <SelectContent>
        {DIE_FACE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={String(option.value)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function trackReference(track: ProgressionTrackFormItem) {
  return {
    subject:
      track.referenceSubjectKind === 'effect'
        ? { kind: 'effect' as const, effectId: track.referenceEffectId ?? '' }
        : track.referenceSubjectKind === 'application-pattern'
          ? { kind: 'application-pattern' as const }
          : { kind: 'target' as const },
    property: track.referenceProperty,
  }
}

function ProgressionTrackCard({
  track,
  trackIndex,
  resolution,
  spellLevel,
  onRemove,
}: {
  track: ProgressionTrackFormItem
  trackIndex: number
  resolution: SpellResolution
  spellLevel: number
  onRemove: () => void
}) {
  const trackPrefix = `${RESOLUTION_FIELD_NAME}.progressionTracks.${trackIndex}` as const
  const reference = trackReference(track)
  const heading = formatProgressionTrackHeading(resolution, reference)
  const baseLabel = formatProgressionBaseValueLabel(resolution, reference)

  const modeLabel =
    track.kind === 'thresholds'
      ? RESOLUTION_SECTION_LABELS.progressionCantripMode
      : RESOLUTION_SECTION_LABELS.progressionLeveledMode

  return (
    <article className="rounded-md border border-border bg-background p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Heading as="h4" variant="subsection" className="text-sm font-medium">
            {heading}
          </Heading>
          <Text variant="muted" className="text-sm">
            {modeLabel}
          </Text>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label="Remove track"
        >
          <Trash2 aria-hidden className="size-4" />
        </Button>
      </div>

      <dl className="space-y-2 text-sm">
        <div className="grid grid-cols-[minmax(8rem,auto)_1fr] items-center gap-x-4 gap-y-1">
          <dt className="text-muted-foreground">
            {track.kind === 'thresholds'
              ? RESOLUTION_SECTION_LABELS.progressionBaseValue
              : RESOLUTION_SECTION_LABELS.progressionBaseAtLevel(spellLevel)}
          </dt>
          <dd>{baseLabel}</dd>
        </div>

        {track.kind === 'thresholds'
          ? (track.entries ?? []).map((entry, entryIndex) => (
              <div
                key={entry.threshold}
                className="grid grid-cols-[minmax(8rem,auto)_1fr] items-center gap-x-4 gap-y-1"
              >
                <dt className="text-muted-foreground">Level {entry.threshold}</dt>
                <dd>
                  {entry.valueKind === 'count' ? (
                    <CompactNumberField
                      name={`${trackPrefix}.entries.${entryIndex}.count`}
                      label={`Level ${entry.threshold} count`}
                    />
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <CompactNumberField
                        name={`${trackPrefix}.entries.${entryIndex}.roll.dice.count`}
                        label={`Level ${entry.threshold} dice count`}
                      />
                      <CompactDieFaceSelect
                        name={`${trackPrefix}.entries.${entryIndex}.roll.dice.faces`}
                        label={`Level ${entry.threshold} die size`}
                      />
                    </div>
                  )}
                </dd>
              </div>
            ))
          : null}

        {track.kind === 'linear' ? (
          <div className="grid grid-cols-[minmax(8rem,auto)_1fr] items-center gap-x-4 gap-y-1">
            <dt className="text-muted-foreground">
              {RESOLUTION_SECTION_LABELS.progressionEachSlotAbove(spellLevel)}
            </dt>
            <dd>
              {track.incrementKind === 'count' ? (
                <div className="flex items-center gap-2">
                  <Text as="span" variant="muted" className="text-sm">
                    +
                  </Text>
                  <CompactNumberField
                    name={`${trackPrefix}.incrementCount`}
                    label="Increment count"
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Text as="span" variant="muted" className="text-sm">
                    +
                  </Text>
                  <CompactNumberField
                    name={`${trackPrefix}.incrementRoll.dice.count`}
                    label="Increment dice count"
                  />
                  <CompactDieFaceSelect
                    name={`${trackPrefix}.incrementRoll.dice.faces`}
                    label="Increment die size"
                  />
                </div>
              )}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}

/** Progression section — preset add menu and shallow track cards. */
export function SpellResolutionProgression() {
  const { setValue } = useFormContext()
  const spellLevel = useWatch({ name: 'level' }) as number | undefined
  const resolutionForm = useWatch({ name: RESOLUTION_FIELD_NAME }) as
    | ResolutionFormValues
    | undefined
  const storedResolution = useMemo(() => resolutionToStored(resolutionForm), [resolutionForm])

  const effectiveSpellLevel = spellLevel ?? 0
  const tracks = resolutionForm?.progressionTracks ?? []
  const hasProgression = tracks.length > 0

  const menuItems: ButtonDropdownItem[] = buildProgressionPresetMenuItems(
    storedResolution,
    tracks,
    effectiveSpellLevel,
  ).map((item) => ({
    id: item.id,
    label: item.label,
    description: item.description,
    note: item.disabledReason,
    disabled: item.disabled,
  }))

  const handleAddTrack = (presetId: string) => {
    if (!storedResolution) return

    const track = createProgressionTrackFromPreset(
      presetId as ProgressionPresetId,
      storedResolution,
      effectiveSpellLevel,
      createTrackId(),
    )
    if (!track) return

    const nextTracks = [...tracks, track]
    setValue(
      `${RESOLUTION_FIELD_NAME}.progressionBasis`,
      deriveProgressionBasis(effectiveSpellLevel),
      {
        shouldDirty: true,
      },
    )
    setValue(`${RESOLUTION_FIELD_NAME}.progressionTracks`, nextTracks, { shouldDirty: true })
  }

  const handleRemoveTrack = (trackIndex: number) => {
    const nextTracks = tracks.filter((_, index) => index !== trackIndex)
    setValue(`${RESOLUTION_FIELD_NAME}.progressionTracks`, nextTracks, { shouldDirty: true })
    if (!nextTracks.length) {
      setValue(`${RESOLUTION_FIELD_NAME}.progressionBasis`, undefined, { shouldDirty: true })
    }
  }

  const handleAddProgression = () => {
    const firstPreset = menuItems.find((item) => !item.disabled)
    if (firstPreset) handleAddTrack(firstPreset.id)
  }

  if (!storedResolution) return null

  return (
    <div className="space-y-3">
      <Text variant="muted" className="text-sm">
        {RESOLUTION_SECTION_LABELS.progressionHint}
      </Text>

      {!hasProgression ? (
        <div className="rounded-md border border-dashed border-border p-4 space-y-3">
          <Text variant="muted" className="text-sm">
            {RESOLUTION_SECTION_LABELS.progressionEmpty}
          </Text>
          {menuItems.length > 0 ? (
            <Button type="button" variant="secondary" size="sm" onClick={handleAddProgression}>
              {RESOLUTION_SECTION_LABELS.addProgression}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track, trackIndex) => (
            <ProgressionTrackCard
              key={track.trackId}
              track={track}
              trackIndex={trackIndex}
              resolution={storedResolution}
              spellLevel={effectiveSpellLevel}
              onRemove={() => handleRemoveTrack(trackIndex)}
            />
          ))}

          {menuItems.some((item) => !item.disabled) ? (
            <ButtonDropdown
              label={RESOLUTION_SECTION_LABELS.addProgressionTrack}
              leadingIcon={<Plus aria-hidden />}
              width="fit"
              size="sm"
              items={menuItems}
              groups={[{ id: 'progression', label: 'Progression' }]}
              onSelectItem={handleAddTrack}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}

export function readStoredProgressionFromForm(
  resolutionForm: ResolutionFormValues | undefined,
): ReturnType<typeof progressionFromForm> {
  return progressionFromForm(resolutionForm?.progressionBasis, resolutionForm?.progressionTracks)
}
