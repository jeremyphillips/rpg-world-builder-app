import { useId, useState } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { Plus } from 'lucide-react'
import { Button, ConfirmDialog, TextField } from '@rpg/ui'
import { ArrayLikeSectionHeader, resolveFormDensity, useFormSectionContext } from '@rpg/ui/form'
import type { SpellcastingProfile } from '@rpg/contracts'

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

type ProfileModalState = { mode: 'edit'; id: string } | { mode: 'create'; label: string }

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

  // useController (not useWatch) so the path registers with react-hook-form:
  // the schema Form shell mounts with `shouldUnregister: true`, and unregistered
  // paths are dropped from live form values — seeded records would never render.
  const {
    field: { value: profilesValue },
  } = useController({ control: form.control, name: 'profiles' })
  const profiles = profilesValue ?? ([] as SpellcastingProfile[])
  const maxCharacterLevel = useWatch({ control: form.control, name: 'maxCharacterLevel' }) ?? 20
  const extendedProgressionEnabled =
    useWatch({ control: form.control, name: 'extendedProgressionEnabled' }) ?? false
  const extendedMaxLevel = useWatch({ control: form.control, name: 'extendedMaxLevel' })
  const extendedTierName = useWatch({ control: form.control, name: 'extendedTierName' })

  const [modalState, setModalState] = useState<ProfileModalState | null>(null)
  const [createLabelDraft, setCreateLabelDraft] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

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
      setProfiles(profiles.map((entry) => (entry.id === modalState.id ? profile : entry)))
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

  function handleDelete(id: string) {
    setProfiles(profiles.filter((entry) => entry.id !== id))
    setConfirmDeleteId(null)
  }

  const editingProfile =
    modalState?.mode === 'edit'
      ? profiles.find((entry) => entry.id === modalState.id)
      : modalState?.mode === 'create'
        ? createDefaultSpellcastingProfile({
            id: `custom:${slugifyId(modalState.label)}`,
            label: modalState.label,
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
          label="Spell selection profiles"
          hint="Known/prepared collections, spellbook gains, and remaining selection behavior referenced by classes. Cantrip capacity is authored on each class."
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
          {profiles.map((profile) => (
            <FeatureTableRow
              key={profile.id}
              title={profile.label}
              metadata={formatSpellcastingProfileMetadata(profile)}
              editLabel="Edit table"
              onEdit={() => setModalState({ mode: 'edit', id: profile.id })}
              overflowActions={
                isSeedSpellcastingProfileId(profile.id) ? undefined : (
                  <DetailOverflowMenu
                    triggerLabel={`Actions for ${profile.label}`}
                    actions={[
                      {
                        id: 'delete',
                        label: 'Delete profile',
                        destructive: true,
                        onSelect: () => setConfirmDeleteId(profile.id),
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
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null)
        }}
        headline="Delete spell selection profile?"
        description="Classes referencing this profile will need a new profile assignment."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={() => {
          if (confirmDeleteId !== null) handleDelete(confirmDeleteId)
        }}
      />
    </>
  )
}
