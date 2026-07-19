'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, ConfirmDialog, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { useSetBreadcrumbLabel } from '@/components/layout/use-breadcrumb-label'

import { useDeleteCharacter } from '../hooks/use-delete-character'
import {
  CHARACTER_EMPTY_SECTION_TEXT,
  CHARACTER_SECTION_LABELS,
  type CharacterDetailListSection,
  type CharacterDetailViewModel,
} from '../lib/character-display'
import { CharacterDetailNarrativeSection } from './character-detail-narrative-section.client'
import {
  characterBuilderPreviewAbilityGridClasses,
  characterBuilderPreviewStatGridClasses,
} from './character-builder-shell.variants'

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

      <dl className={characterBuilderPreviewStatGridClasses}>
        {viewModel.stats.map((stat) => (
          <DetailStat key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </dl>

      <div className="space-y-2">
        <Text as="p" variant="body" className="font-medium">
          Abilities
        </Text>
        <dl className={characterBuilderPreviewAbilityGridClasses}>
          {viewModel.abilities.map((ability) => (
            <div key={ability.id} className="rounded-md border border-border px-2 py-1.5">
              <dt className="text-xs text-muted-foreground">{ability.label}</dt>
              <dd className="text-sm font-medium">{ability.display}</dd>
            </div>
          ))}
        </dl>
      </div>

      <CharacterActionsSection actions={viewModel.actions} />
      <CharacterDetailListSection section={viewModel.savingThrows} />
      <CharacterDetailListSection section={viewModel.proficiencies} />
      <CharacterDetailListSection section={viewModel.spells} />
      <CharacterDetailListSection section={viewModel.equipment} />
      <dl className={characterBuilderPreviewStatGridClasses}>
        <DetailStat label={viewModel.wealth.label} value={viewModel.wealth.value} />
      </dl>
      <CharacterDetailListSection section={viewModel.classFeatures} />
      <CharacterDetailListSection section={viewModel.speciesTraits} />
      <CharacterDetailListSection section={viewModel.feats} />
      <CharacterDetailNarrativeSection narrative={viewModel.narrative} />

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

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function CharacterActionsSection({ actions }: { actions: CharacterDetailViewModel['actions'] }) {
  return (
    <div className="space-y-2">
      <Text as="p" variant="body" className="font-medium">
        {CHARACTER_SECTION_LABELS.actions}
      </Text>
      {actions.length === 0 ? (
        <Text variant="muted">{CHARACTER_EMPTY_SECTION_TEXT.actions}</Text>
      ) : (
        <ul className="space-y-2 text-sm">
          {actions.map((action) => (
            <li key={action.id} className="rounded-md border border-border px-3 py-2">
              <div className="font-medium">{action.name}</div>
              <div className="text-muted-foreground">
                Attack {action.attackBonus} · Damage {action.damage}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CharacterDetailListSection({ section }: { section: CharacterDetailListSection }) {
  return (
    <div className="space-y-2">
      <Text as="p" variant="body" className="font-medium">
        {section.title}
      </Text>
      {section.items.length === 0 ? (
        <Text variant="muted">{section.emptyText}</Text>
      ) : (
        <ul className="space-y-2 text-sm">
          {section.items.map((item) => (
            <li key={item.id} className="rounded-md border border-border px-3 py-2">
              <div className="font-medium">{item.label}</div>
              {item.detail ? <div className="text-muted-foreground">{item.detail}</div> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
