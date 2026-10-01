import type { ReactNode } from 'react'

import type { CharacterDetailViewModel } from '../../lib/display/character-display'
import { CharacterDetailAbilitiesRow } from './sheet/character-detail-abilities-row'
import { CharacterDetailCombatRow } from './sheet/character-detail-combat-row'
import { CharacterDetailHeader } from './sheet/character-detail-header'
import {
  characterDetailAbilitiesStatsSectionClasses,
  characterDetailBodyGridClasses,
} from './sheet/character-detail-sheet.variants'
import { CharacterDetailStatsRow } from './sheet/character-detail-stats-row'
import { CharacterDetailTabs } from './tabs/character-detail-tabs'

export type CharacterDetailSheetProps = {
  viewModel: CharacterDetailViewModel
  identityMedia?: ReactNode
  statusSummary?: ReactNode
  statusActions?: ReactNode
  identitySupplement?: ReactNode
  /** Preview surfaces pass false; route controllers default to showing delete when wired. */
  showDelete?: boolean
  onDeleteClick?: () => void
}

/** Read-only character sheet layout — no routing, breadcrumbs, or mutations. */
export function CharacterDetailSheet({
  viewModel,
  identityMedia,
  statusSummary,
  statusActions,
  identitySupplement,
  showDelete = false,
  onDeleteClick = () => undefined,
}: CharacterDetailSheetProps) {
  return (
    <div className="space-y-6">
      <CharacterDetailHeader
        name={viewModel.identity.name}
        summary={viewModel.identity.summary}
        gender={viewModel.identity.gender}
        xp={viewModel.identity.xp}
        identityMedia={identityMedia}
        statusSummary={statusSummary}
        statusActions={statusActions}
        identitySupplement={identitySupplement}
        showDelete={showDelete}
        onDeleteClick={onDeleteClick}
      />

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
          connections={viewModel.connections}
          narrative={viewModel.narrative}
        />
      </div>
    </div>
  )
}
