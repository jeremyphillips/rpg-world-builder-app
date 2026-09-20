import { useId, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Button, ConfirmDialog, TextField } from '@rpg/ui'
import { ArrayLikeSectionHeader, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'
import type { SlotProgression } from '@rpg/contracts'

import { TableBuilderModal, type TableBuilderFormValues } from '@/lib/table-builder'
import {
  DetailOverflowMenu,
  FeatureTableRow,
  featureTablesSectionBodyClasses,
} from '@/lib/content-table-surface'

import {
  applySlotProgressionDraft,
  buildLeveledSlotProgressionHostConfig,
  buildPactSlotProgressionHostConfig,
  buildSlotProgressionDraft,
  createCustomSlotProgression,
  formatSlotProgressionMetadata,
  type SlotProgressionTableKind,
} from '../lib/rules/character-configuration/slot-progression-field.lib'
import { buildEffectiveMaxLevel } from '../lib/rules/character-configuration/xp-thresholds-field.lib'
import {
  isSeedSlotProgressionId,
  type SpellcastingProgressionFormState,
} from '../lib/rules/character-configuration/spellcasting-progression-form-values'
import { spellcastingSubsectionClasses } from './spellcasting-progression-field.variants'
type SlotModalState =
  | { mode: 'edit'; index: number }
  | { mode: 'create'; label: string; kind: SlotProgressionTableKind }

type SpellcastingRulesFormSlice = SpellcastingProgressionFormState & {
  maxCharacterLevel: number
  extendedProgressionEnabled: boolean
  extendedMaxLevel?: number
  extendedTierName?: string
}

function slugifyId(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug.length > 0 ? slug : 'custom'
}

// fallow-ignore-next-line complexity
export function SlotProgressionsField() {
  const createLabelId = useId()
  const form = useFormContext<SpellcastingRulesFormSlice>()
  const { density } = useFormSectionContext()
  const { size } = resolveFormDensity(density)

  const slotProgressions =
    useWatch({ control: form.control, name: 'slotProgressions' }) ?? ([] as SlotProgression[])
  const maxCharacterLevel = useWatch({ control: form.control, name: 'maxCharacterLevel' }) ?? 20
  const extendedProgressionEnabled =
    useWatch({ control: form.control, name: 'extendedProgressionEnabled' }) ?? false
  const extendedMaxLevel = useWatch({ control: form.control, name: 'extendedMaxLevel' })
  const extendedTierName = useWatch({ control: form.control, name: 'extendedTierName' })

  const [modalState, setModalState] = useState<SlotModalState | null>(null)
  const [createLabelDraft, setCreateLabelDraft] = useState('')
  const [createKindDraft, setCreateKindDraft] = useState<SlotProgressionTableKind>('leveled')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null)

  const effectiveMaxLevel = buildEffectiveMaxLevel({
    maxCharacterLevel,
    extendedProgressionEnabled,
    extendedMaxLevel,
  })

  const extendedTierNameValue = typeof extendedTierName === 'string' ? extendedTierName : undefined

  const activeProgression =
    modalState?.mode === 'edit'
      ? slotProgressions[modalState.index]
      : modalState?.mode === 'create'
        ? createCustomSlotProgression({
            id: 'draft',
            label: modalState.label,
            kind: modalState.kind,
          })
        : undefined

  const hostConfig = useMemo(() => {
    if (activeProgression === undefined) return undefined
    const hostInput = {
      effectiveMaxLevel,
      maxCharacterLevel,
      extendedTierName: extendedTierNameValue,
    }
    return activeProgression.kind === 'pact'
      ? buildPactSlotProgressionHostConfig(hostInput)
      : buildLeveledSlotProgressionHostConfig(hostInput)
  }, [activeProgression, effectiveMaxLevel, maxCharacterLevel, extendedTierNameValue])

  const initialDraft = useMemo(() => {
    if (activeProgression === undefined) return undefined
    return buildSlotProgressionDraft(activeProgression, {
      effectiveMaxLevel,
      maxCharacterLevel,
      extendedTierName: extendedTierNameValue,
    })
  }, [activeProgression, effectiveMaxLevel, maxCharacterLevel, extendedTierNameValue])

  function setSlotProgressions(next: SlotProgression[]) {
    form.setValue('slotProgressions', next, { shouldDirty: true })
  }

  function handleSaveDraft(draft: TableBuilderFormValues) {
    if (modalState?.mode === 'edit') {
      const current = slotProgressions[modalState.index]
      if (current === undefined) return
      const next = slotProgressions.map((entry, index) =>
        index === modalState.index ? applySlotProgressionDraft(current, draft) : entry,
      )
      setSlotProgressions(next)
      return
    }

    if (modalState?.mode === 'create') {
      const created = createCustomSlotProgression({
        id: `custom:${slugifyId(modalState.label)}`,
        label: modalState.label,
        kind: modalState.kind,
      })
      setSlotProgressions([...slotProgressions, applySlotProgressionDraft(created, draft)])
    }
  }

  function handleCreateCustom() {
    const label = createLabelDraft.trim()
    if (label === '') return
    setShowCreateForm(false)
    setModalState({ mode: 'create', label, kind: createKindDraft })
    setCreateLabelDraft('')
  }

  function handleDelete(index: number) {
    setSlotProgressions(slotProgressions.filter((_, entryIndex) => entryIndex !== index))
    setConfirmDeleteIndex(null)
  }

  return (
    <>
      <section
        className={spellcastingSubsectionClasses}
        aria-labelledby="slot-progressions-heading"
      >
        <ArrayLikeSectionHeader
          id="slot-progressions-heading"
          label="Slot progressions"
          hint="Spell slot tables referenced by spellcasting profiles."
          size={size}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus aria-hidden />
              Add custom
            </Button>
          }
          wrapper="none"
        />
        <div className={featureTablesSectionBodyClasses}>
          {slotProgressions.map((progression, index) => (
            <FeatureTableRow
              key={progression.id}
              title={progression.label}
              metadata={formatSlotProgressionMetadata(progression, effectiveMaxLevel)}
              typeLabel={progression.kind === 'pact' ? 'Pact' : 'Leveled'}
              onEdit={() => setModalState({ mode: 'edit', index })}
              overflowActions={
                isSeedSlotProgressionId(progression.id) ? undefined : (
                  <DetailOverflowMenu
                    triggerLabel={`Actions for ${progression.label}`}
                    actions={[
                      {
                        id: 'delete',
                        label: 'Delete progression',
                        destructive: true,
                        onSelect: () => setConfirmDeleteIndex(index),
                      },
                    ]}
                  />
                )
              }
            />
          ))}
        </div>
      </section>

      {showCreateForm ? (
        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
          <TextField
            id={createLabelId}
            label="Progression label"
            value={createLabelDraft}
            onChange={(event) => setCreateLabelDraft(event.target.value)}
            size="sm"
            required
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={createKindDraft === 'leveled' ? 'default' : 'outline'}
              onClick={() => setCreateKindDraft('leveled')}
            >
              Leveled
            </Button>
            <Button
              type="button"
              size="sm"
              variant={createKindDraft === 'pact' ? 'default' : 'outline'}
              onClick={() => setCreateKindDraft('pact')}
            >
              Pact
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={handleCreateCustom}>
              Continue
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {modalState && hostConfig && initialDraft ? (
        <TableBuilderModal
          open
          mode={modalState.mode === 'create' ? 'create' : 'edit'}
          config={hostConfig}
          initialDraft={initialDraft}
          onOpenChange={(open) => {
            if (!open) setModalState(null)
          }}
          onSaveDraft={handleSaveDraft}
        />
      ) : null}

      <ConfirmDialog
        open={confirmDeleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteIndex(null)
        }}
        headline="Delete slot progression?"
        description="Profiles referencing this progression will need a new slot progression assignment."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={() => {
          if (confirmDeleteIndex !== null) handleDelete(confirmDeleteIndex)
        }}
      />
    </>
  )
}
