'use client'

import type {
  CharacterBuildPreview,
  CharacterBuilderDraft,
  CharacterBuildContext,
} from '@rpg/contracts'
import { getOrganizationDomainLabel } from '@rpg/contracts'
import { Alert, Text } from '@rpg/ui'

import { getContentTypeItemLabel } from '@/features/content'
import { characterBuilderPreviewStatGridClasses } from '../../character-builder-shell.variants'
import { UNAVAILABLE_ORGANIZATION_LABEL } from '../../../../lib/display/character-display'
import { resolveBuilderModelingAdvisories } from '../../../../lib/builder-preview/builder-review-advisories.lib'
import {
  formatAbilityMethodLabel,
  formatReviewAlignment,
  resolveCatalogEntryName,
} from '../../../../lib/builder-preview/review-step-display'

export type ReviewStepSummaryProps = {
  context: CharacterBuildContext
  draft: CharacterBuilderDraft
  preview: CharacterBuildPreview | null
}

export function ReviewStepSummary({ context, draft, preview }: ReviewStepSummaryProps) {
  const speciesName = resolveCatalogEntryName(context.catalog.species, draft.species.speciesId)
  const className = resolveCatalogEntryName(context.catalog.classes, draft.class.classId)
  const modelingAdvisories = resolveBuilderModelingAdvisories(draft)
  const organizationsById = new Map(
    context.catalog.organizations.map((organization) => [organization.id, organization]),
  )
  const organizationSummary =
    draft.connections.organizations.length === 0
      ? 'None'
      : draft.connections.organizations
          .map(({ organizationId }) => {
            const organization = organizationsById.get(organizationId)
            return organization
              ? `${organization.name} — ${getOrganizationDomainLabel(organization.organizationDomain)}`
              : UNAVAILABLE_ORGANIZATION_LABEL
          })
          .join('; ')

  return (
    <>
      <dl className="grid gap-3 sm:grid-cols-2">
        <ReviewRow label="Name" value={draft.identity.name?.trim() || 'Not set'} />
        <ReviewRow label="Alignment" value={formatReviewAlignment(draft.identity.alignment)} />
        <ReviewRow label="Level" value={String(draft.class.level)} />
        <ReviewRow label={getContentTypeItemLabel('species')} value={speciesName} />
        <ReviewRow label={getContentTypeItemLabel('classes')} value={className} />
        <ReviewRow label="Connections" value={organizationSummary} />
        <ReviewRow
          label="Ability method"
          value={formatAbilityMethodLabel(draft.abilities.method)}
        />
      </dl>

      {modelingAdvisories.length > 0 ? (
        <div className="space-y-2">
          {modelingAdvisories.map((message) => (
            <Alert key={message} variant="info" title="Modeling note">
              {message}
            </Alert>
          ))}
        </div>
      ) : null}

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
