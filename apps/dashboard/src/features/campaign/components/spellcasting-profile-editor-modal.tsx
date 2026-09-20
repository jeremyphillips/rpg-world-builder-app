import { useId, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  PROGRESSION_EXTENSION_ENTRIES,
  PROGRESSION_EXTENSIONS,
  SPELL_CHOICE_PROGRESSION_KIND_ENTRIES,
  SPELL_CHOICE_PROGRESSION_KINDS,
  SPELL_CHOICE_SOURCE_KIND_ENTRIES,
  SPELL_CHOICE_SOURCE_KINDS,
  SPELL_COLLECTION_KIND_ENTRIES,
  SPELL_COLLECTION_KINDS,
  SPELL_MUTATION_TRIGGER_ENTRIES,
  SPELL_MUTATION_TRIGGERS,
  type SpellcastingProfile,
  type SpellChoiceProgression,
  type SpellCollectionKind,
} from '@rpg/contracts'
import { Button, Modal, SelectField, SwitchField, TextField } from '@rpg/ui'
import { toOptions } from '@rpg/ui/form'

import { TableBuilderModal, type TableBuilderFormValues } from '@/lib/table-builder'
import {
  buildChoiceProgressionCurveDraft,
  buildChoiceProgressionCurveHostConfig,
  createDefaultChoiceProgression,
  labelsFromGameTermEntries,
  mapChoiceProgressionCurveDraftToRows,
} from '../lib/rules/character-configuration/spellcasting-profile-field.lib'
import { buildEffectiveMaxLevel } from '../lib/rules/character-configuration/xp-thresholds-field.lib'

export type SpellcastingProfileEditorModalProps = {
  open: boolean
  profile: SpellcastingProfile
  maxCharacterLevel: number
  extendedProgressionEnabled: boolean
  extendedMaxLevel?: number
  extendedTierName?: string
  onOpenChange: (open: boolean) => void
  onSave: (profile: SpellcastingProfile) => void
}

type ProfileEditorValues = SpellcastingProfile

type CurveModalState = {
  choiceId: string
}

function replaceLimitOptions() {
  return [
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: 'all', label: 'All' },
  ]
}

const PROFILE_SPELL_COLLECTION_KINDS = SPELL_COLLECTION_KINDS.filter((kind) => kind !== 'cantrips')

export function SpellcastingProfileEditorModal({
  open,
  profile,
  maxCharacterLevel,
  extendedProgressionEnabled,
  extendedMaxLevel,
  extendedTierName,
  onOpenChange,
  onSave,
}: SpellcastingProfileEditorModalProps) {
  const labelId = useId()
  const form = useForm<ProfileEditorValues>({ defaultValues: profile })
  const values = useWatch({ control: form.control }) as ProfileEditorValues
  const [curveModal, setCurveModal] = useState<CurveModalState | null>(null)

  const effectiveMaxLevel = buildEffectiveMaxLevel({
    maxCharacterLevel,
    extendedProgressionEnabled,
    extendedMaxLevel,
  })
  const extendedTierNameValue = typeof extendedTierName === 'string' ? extendedTierName : undefined

  const curveHostConfig = useMemo(
    () =>
      buildChoiceProgressionCurveHostConfig({
        effectiveMaxLevel,
        maxCharacterLevel,
        extendedTierName: extendedTierNameValue,
      }),
    [effectiveMaxLevel, maxCharacterLevel, extendedTierNameValue],
  )

  const activeChoiceIndex =
    curveModal !== null
      ? values.choiceProgressions.findIndex((progression) => progression.id === curveModal.choiceId)
      : -1
  const activeChoiceProgression =
    activeChoiceIndex >= 0 ? values.choiceProgressions[activeChoiceIndex] : undefined

  const curveInitialDraft = useMemo(() => {
    if (activeChoiceProgression === undefined) return undefined
    return buildChoiceProgressionCurveDraft({
      progression: activeChoiceProgression,
      effectiveMaxLevel,
      maxCharacterLevel,
      extendedTierName: extendedTierNameValue,
    })
  }, [activeChoiceProgression, effectiveMaxLevel, maxCharacterLevel, extendedTierNameValue])

  function updateChoiceProgression(index: number, next: SpellChoiceProgression) {
    const choiceProgressions = [...(values.choiceProgressions ?? [])]
    choiceProgressions[index] = next
    form.setValue('choiceProgressions', choiceProgressions, { shouldDirty: true })
  }

  function handleAddChoiceProgression() {
    const id = `choice-${crypto.randomUUID()}`
    form.setValue(
      'choiceProgressions',
      [...(values.choiceProgressions ?? []), createDefaultChoiceProgression(id)],
      { shouldDirty: true },
    )
  }

  function handleRemoveChoiceProgression(index: number) {
    form.setValue(
      'choiceProgressions',
      (values.choiceProgressions ?? []).filter((_, entryIndex) => entryIndex !== index),
      { shouldDirty: true },
    )
  }

  function handleSaveCurveDraft(draft: TableBuilderFormValues) {
    if (curveModal === null || activeChoiceIndex < 0) return
    const current = values.choiceProgressions[activeChoiceIndex]
    if (current === undefined) return
    updateChoiceProgression(activeChoiceIndex, {
      ...current,
      curve: { rows: mapChoiceProgressionCurveDraftToRows(draft) },
    })
    setCurveModal(null)
  }

  if (!open) return null

  return (
    <>
      <Modal.Root open onOpenChange={onOpenChange}>
        <Modal.Content size="xl" layout="stable" stableSize="tall">
          <Modal.Header headline="Edit spell selection profile" />
          <Modal.Body>
            <div className="space-y-6">
              <TextField
                id={labelId}
                label="Profile label"
                size="md"
                required
                {...form.register('label')}
              />

              <section className="space-y-3" aria-label="Choice progressions">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Choice progressions</h3>
                    <p className="text-sm text-muted-foreground">
                      Prepared, repertoire, and spellbook curves. Cantrip capacity is authored on
                      each class.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddChoiceProgression}
                  >
                    Add progression
                  </Button>
                </div>

                {(values.choiceProgressions ?? [])
                  .map((progression, index) => ({ progression, index }))
                  .filter(({ progression }) => progression.destination !== 'cantrips')
                  .map(({ progression, index }) => {
                    const choiceId = `${progression.id}-${index}`
                    return (
                      <div
                        key={progression.id}
                        className="space-y-3 rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <TextField
                            id={`${choiceId}-id`}
                            label="Progression id"
                            size="sm"
                            {...form.register(`choiceProgressions.${index}.id`)}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveChoiceProgression(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <SelectField
                            id={`${choiceId}-kind`}
                            label="Kind"
                            size="sm"
                            options={toOptions(
                              SPELL_CHOICE_PROGRESSION_KINDS,
                              labelsFromGameTermEntries(SPELL_CHOICE_PROGRESSION_KIND_ENTRIES),
                            )}
                            value={progression.kind}
                            onValueChange={(next) =>
                              updateChoiceProgression(index, {
                                ...progression,
                                kind: next as SpellChoiceProgression['kind'],
                              })
                            }
                          />
                          <SelectField
                            id={`${choiceId}-extension`}
                            label="Extension"
                            size="sm"
                            options={toOptions(
                              PROGRESSION_EXTENSIONS,
                              labelsFromGameTermEntries(PROGRESSION_EXTENSION_ENTRIES),
                            )}
                            value={progression.extension}
                            onValueChange={(next) =>
                              updateChoiceProgression(index, {
                                ...progression,
                                extension: next as SpellChoiceProgression['extension'],
                              })
                            }
                          />
                          <SelectField
                            id={`${choiceId}-source`}
                            label="Source"
                            size="sm"
                            options={toOptions(
                              SPELL_CHOICE_SOURCE_KINDS,
                              labelsFromGameTermEntries(SPELL_CHOICE_SOURCE_KIND_ENTRIES),
                            )}
                            value={progression.source.kind}
                            onValueChange={(next) => {
                              if (next === 'collection') {
                                updateChoiceProgression(index, {
                                  ...progression,
                                  source: { kind: 'collection', collection: 'spellbook' },
                                })
                                return
                              }
                              updateChoiceProgression(index, {
                                ...progression,
                                source: { kind: 'classList' },
                              })
                            }}
                          />
                          {progression.source.kind === 'collection' ? (
                            <SelectField
                              id={`${choiceId}-source-collection`}
                              label="Source collection"
                              size="sm"
                              options={toOptions(
                                PROFILE_SPELL_COLLECTION_KINDS,
                                labelsFromGameTermEntries(SPELL_COLLECTION_KIND_ENTRIES),
                              )}
                              value={progression.source.collection}
                              onValueChange={(next) =>
                                updateChoiceProgression(index, {
                                  ...progression,
                                  source: {
                                    kind: 'collection',
                                    collection: next as SpellCollectionKind,
                                  },
                                })
                              }
                            />
                          ) : null}
                          <SelectField
                            id={`${choiceId}-destination`}
                            label="Destination"
                            size="sm"
                            options={toOptions(
                              PROFILE_SPELL_COLLECTION_KINDS,
                              labelsFromGameTermEntries(SPELL_COLLECTION_KIND_ENTRIES),
                            )}
                            value={progression.destination}
                            onValueChange={(next) =>
                              updateChoiceProgression(index, {
                                ...progression,
                                destination: next as SpellChoiceProgression['destination'],
                              })
                            }
                          />
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <SelectField
                            id={`${choiceId}-mutation-trigger`}
                            label="Mutation trigger"
                            size="sm"
                            options={toOptions(
                              SPELL_MUTATION_TRIGGERS,
                              labelsFromGameTermEntries(SPELL_MUTATION_TRIGGER_ENTRIES),
                            )}
                            value={
                              progression.mutation.kind === 'replace'
                                ? progression.mutation.trigger
                                : 'longRest'
                            }
                            onValueChange={(next) =>
                              updateChoiceProgression(index, {
                                ...progression,
                                mutation: {
                                  kind: 'replace',
                                  trigger: next as 'levelUp' | 'longRest',
                                  limit:
                                    progression.mutation.kind === 'replace'
                                      ? progression.mutation.limit
                                      : 1,
                                },
                              })
                            }
                          />
                          <SelectField
                            id={`${choiceId}-mutation-limit`}
                            label="Mutation limit"
                            size="sm"
                            options={replaceLimitOptions()}
                            value={
                              progression.mutation.kind === 'replace'
                                ? String(progression.mutation.limit)
                                : '1'
                            }
                            onValueChange={(next) =>
                              updateChoiceProgression(index, {
                                ...progression,
                                mutation: {
                                  kind: 'replace',
                                  trigger:
                                    progression.mutation.kind === 'replace'
                                      ? progression.mutation.trigger
                                      : 'longRest',
                                  limit: next === 'all' ? 'all' : Number(next),
                                },
                              })
                            }
                          />
                        </div>

                        <SwitchField
                          id={`${choiceId}-column-enabled`}
                          label="Show in combined table"
                          checked={progression.presentation?.column?.enabled ?? false}
                          onCheckedChange={(checked) =>
                            updateChoiceProgression(index, {
                              ...progression,
                              presentation: {
                                column: {
                                  enabled: checked,
                                  label: progression.presentation?.column?.label ?? 'Spells',
                                },
                              },
                            })
                          }
                        />
                        <TextField
                          id={`${choiceId}-column-label`}
                          label="Table column label"
                          size="sm"
                          value={progression.presentation?.column?.label ?? ''}
                          onChange={(event) =>
                            updateChoiceProgression(index, {
                              ...progression,
                              presentation: {
                                column: {
                                  enabled: progression.presentation?.column?.enabled ?? false,
                                  label: event.target.value,
                                },
                              },
                            })
                          }
                        />

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setCurveModal({ choiceId: progression.id })}
                        >
                          Edit curve table
                        </Button>
                      </div>
                    )
                  })}
              </section>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.FooterActions>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const next = form.getValues()
                  onSave({
                    ...next,
                    choiceProgressions: next.choiceProgressions.filter(
                      (progression) => progression.destination !== 'cantrips',
                    ),
                  })
                }}
              >
                Save profile
              </Button>
            </Modal.FooterActions>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {curveModal && curveInitialDraft ? (
        <TableBuilderModal
          open
          mode="edit"
          config={curveHostConfig}
          initialDraft={curveInitialDraft}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setCurveModal(null)
          }}
          onSaveDraft={handleSaveCurveDraft}
        />
      ) : null}
    </>
  )
}
