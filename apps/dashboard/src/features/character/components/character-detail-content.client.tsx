'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ConfirmDialog, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'

import { useDeleteCharacter } from '../hooks/use-delete-character'
import type { CharacterDetailViewModel } from '../lib/character-display'
import { CharacterDetailAbilitiesRow } from './character-detail-abilities-row.client'
import { CharacterDetailCombatRow } from './character-detail-combat-row.client'
import {
  characterDetailAbilitiesStatsSectionClasses,
  characterDetailBodyGridClasses,
} from './character-detail-sheet.variants'
import { CharacterDetailStatsRow } from './character-detail-stats-row.client'
import { CharacterDetailTabs } from './character-detail-tabs.client'

export type CharacterDetailContentProps = {
  viewModel: CharacterDetailViewModel
}

/** Read-only character sheet driven by the display registry view model. */
export function CharacterDetailContent({ viewModel }: CharacterDetailContentProps) {
  useSetBreadcrumbLabel(viewModel.identity.name)
  const navigate = useNavigate()
  const deleteCharacter = useDeleteCharacter()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const handleDelete = () => {
    deleteCharacter.mutate(viewModel.id, {
      onSuccess: () => {
        setConfirmDeleteOpen(false)
        void navigate(ROUTES.characters.list)
      },
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Heading variant="page" as="h1">
            {viewModel.identity.name}
          </Heading>
          <Text variant="muted">{viewModel.identity.summary}</Text>
          <Text variant="muted">{viewModel.identity.xp} XP</Text>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setConfirmDeleteOpen(true)}
        >
          Delete
        </Button>
      </header>

      <div className={characterDetailAbilitiesStatsSectionClasses}>
        <CharacterDetailAbilitiesRow abilities={viewModel.abilities} />
        <CharacterDetailStatsRow stats={viewModel.stats} hitPoints={viewModel.hitPoints} />
      </div>
      <div className={characterDetailBodyGridClasses}>
        <CharacterDetailCombatRow
          actions={viewModel.actions}
          savingThrows={viewModel.savingThrows}
          proficiencies={viewModel.proficiencies}
        />
        <CharacterDetailTabs
          spells={viewModel.spells}
          equipment={viewModel.equipment}
          wealth={viewModel.wealth}
          classFeatures={viewModel.classFeatures}
          speciesTraits={viewModel.speciesTraits}
          feats={viewModel.feats}
          narrative={viewModel.narrative}
        />
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        headline="Delete character?"
        description={
          <>
            Permanently delete <strong>{viewModel.identity.name}</strong>? This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
