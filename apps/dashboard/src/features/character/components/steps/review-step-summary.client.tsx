'use client'

import type {
  CharacterBuildPreview,
  CharacterBuilderDraft,
  CharacterBuildContext,
} from '@rpg/contracts'
import { Text } from '@rpg/ui'

import { characterBuilderPreviewStatGridClasses } from '../character-builder-shell.variants'
import {
  formatAbilityMethodLabel,
  formatReviewAlignment,
  resolveCatalogEntryName,
} from '../../lib/review-step-display'

export type ReviewStepSummaryProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
}

export function ReviewStepSummary({ context, draft, preview }: ReviewStepSummaryProps) {
  const speciesName = resolveCatalogEntryName(context.catalog.species, draft.species.speciesId)
  const className = resolveCatalogEntryName(context.catalog.classes, draft.class.classId)

  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-2">
        <ReviewRow label="Name" value={draft.identity.name?.trim() || 'Not set'} />
        <ReviewRow label="Alignment" value={formatReviewAlignment(draft.identity.alignment)} />
        <ReviewRow label="Species" value={speciesName} />
        <ReviewRow label="Class" value={className} />
        <ReviewRow
          label="Ability method"
          value={formatAbilityMethodLabel(draft.abilities.method)}
        />
      </dl>

      {preview ? (
        <div className="space-y-2">
          <Text as="p" variant="body" className="font-medium">
            Final preview
          </Text>
          <dl className={characterBuilderPreviewStatGridClasses}>
            <ReviewStat
              label="Proficiency"
              value={formatSignedNumber(preview.proficiencyBonus, '+')}
            />
            <ReviewStat label="Max HP" value={formatOptionalNumber(preview.maxHp)} />
            <ReviewStat label="AC" value={formatOptionalNumber(preview.ac)} />
          </dl>
        </div>
      ) : null}
    </>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function ReviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-2 py-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

function formatOptionalNumber(value: number | undefined): string {
  if (value === undefined) return '—'
  return String(value)
}

function formatSignedNumber(value: number | undefined, prefix = ''): string {
  if (value === undefined) return '—'
  return `${prefix}${value}`
}
