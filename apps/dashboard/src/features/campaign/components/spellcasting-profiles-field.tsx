import { useId, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Button, ConfirmDialog, TextField } from '@rpg/ui'
import { ArrayLikeSectionHeader, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'
import type { SlotProgression, SpellcastingProfile } from '@rpg/contracts'

import {
  DetailOverflowMenu,
  FeatureTableRow,
  featureTablesSectionBodyClasses,
} from '@/lib/content-table-surface'

import {
  createDefaultSpellcastingProfile,
  formatSpellcastingProfileMetadata,
} from '../lib/rules/character-configuration/spellcasting-profile-field.lib'
import {
  isSeedSpellcastingProfileId,
  type SpellcastingProgressionFormState,
} from '../lib/rules/character-configuration/spellcasting-progression-form-values'
import { SpellcastingProfileEditorModal } from './spellcasting-profile-editor-modal'
import { spellcastingSubsectionClasses } from './spellcasting-progression-field.variants'

type ProfileModalState = { mode: 'edit'; index: number } | { mode: 'create'; label: string }

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
export function SpellcastingProfilesField() {
  const createLabelId = useId()
  const form = useFormContext<SpellcastingRulesFormSlice>()
  const { density } = useFormSectionContext()
  const { size } = resolveFormDensity(density)

  const profiles =
    useWatch({ control: form.control, name: 'profiles' }) ?? ([] as SpellcastingProfile[])
  const slotProgressions =
    useWatch({ control: form.control, name: 'slotProgressions' }) ?? ([] as SlotProgression[])
  const maxCharacterLevel = useWatch({ control: form.control, name: 'maxCharacterLevel' }) ?? 20
  const extendedProgressionEnabled =
    useWatch({ control: form.control, name: 'extendedProgressionEnabled' }) ?? false
  const extendedMaxLevel = useWatch({ control: form.control, name: 'extendedMaxLevel' })
  const extendedTierName = useWatch({ control: form.control, name: 'extendedTierName' })

  const [modalState, setModalState] = useState<ProfileModalState | null>(null)
  const [createLabelDraft, setCreateLabelDraft] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null)

  const defaultSlotProgressionId = slotProgressions[0]?.id ?? 'full-caster'

  function setProfiles(next: SpellcastingProfile[]) {
    form.setValue('profiles', next, { shouldDirty: true })
  }

  function handleCreateCustom() {
    const label = createLabelDraft.trim()
    if (label === '') return
    setShowCreateForm(false)
    setModalState({ mode: 'create', label })
    setCreateLabelDraft('')
  }

  function handleSaveProfile(profile: SpellcastingProfile) {
    if (modalState?.mode === 'edit') {
      setProfiles(profiles.map((entry, index) => (index === modalState.index ? profile : entry)))
    } else if (modalState?.mode === 'create') {
      setProfiles([
        ...profiles,
        {
          ...profile,
          id: profile.id.startsWith('custom:')
            ? profile.id
            : `custom:${slugifyId(modalState.label)}`,
          label: profile.label || modalState.label,
        },
      ])
    }
    setModalState(null)
  }

  function handleDelete(index: number) {
    setProfiles(profiles.filter((_, entryIndex) => entryIndex !== index))
    setConfirmDeleteIndex(null)
  }

  const editingProfile =
    modalState?.mode === 'edit'
      ? profiles[modalState.index]
      : modalState?.mode === 'create'
        ? createDefaultSpellcastingProfile({
            id: `custom:${slugifyId(modalState.label)}`,
            label: modalState.label,
            slotProgressionId: defaultSlotProgressionId,
          })
        : undefined

  return (
    <>
      <section
        className={spellcastingSubsectionClasses}
        aria-labelledby="spellcasting-profiles-heading"
      >
        <ArrayLikeSectionHeader
          id="spellcasting-profiles-heading"
          label="Spellcasting profiles"
          hint="Composable spell slot and choice progression profiles referenced by classes."
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
          {profiles.map((profile, index) => (
            <FeatureTableRow
              key={profile.id}
              title={profile.label}
              metadata={formatSpellcastingProfileMetadata(profile, slotProgressions)}
              onEdit={() => setModalState({ mode: 'edit', index })}
              overflowActions={
                isSeedSpellcastingProfileId(profile.id) ? undefined : (
                  <DetailOverflowMenu
                    triggerLabel={`Actions for ${profile.label}`}
                    actions={[
                      {
                        id: 'delete',
                        label: 'Delete profile',
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
            label="Profile label"
            value={createLabelDraft}
            onChange={(event) => setCreateLabelDraft(event.target.value)}
            size="sm"
            required
          />
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

      {modalState && editingProfile ? (
        <SpellcastingProfileEditorModal
          open
          profile={editingProfile}
          slotProgressions={slotProgressions}
          maxCharacterLevel={maxCharacterLevel}
          extendedProgressionEnabled={extendedProgressionEnabled}
          extendedMaxLevel={extendedMaxLevel}
          extendedTierName={typeof extendedTierName === 'string' ? extendedTierName : undefined}
          onOpenChange={(open) => {
            if (!open) setModalState(null)
          }}
          onSave={handleSaveProfile}
        />
      ) : null}

      <ConfirmDialog
        open={confirmDeleteIndex !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteIndex(null)
        }}
        headline="Delete spellcasting profile?"
        description="Classes referencing this profile will need a new profile assignment."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={() => {
          if (confirmDeleteIndex !== null) handleDelete(confirmDeleteIndex)
        }}
      />
    </>
  )
}
