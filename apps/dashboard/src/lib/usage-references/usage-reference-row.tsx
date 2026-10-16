import type { VocabularyUsageReference } from '@rpg/contracts'
import { ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

import { GAME_TERMS_ROUTES } from '@/app/game-terms-routes'
import { resolveContentUsageReferenceHref } from '@/features/content/lib/delete/resolve-content-usage-href'

import { resolveContentBlockerHref } from '@/lib/usage-blocked/resolve-content-blocker-href'

export type UsageReferenceRowProps = {
  reference: VocabularyUsageReference
  campaignId: string
}

function resolveUsageReferenceHref(
  campaignId: string,
  reference: VocabularyUsageReference,
): string {
  if (reference.kind === 'character') {
    return resolveContentUsageReferenceHref({
      kind: 'character',
      id: reference.id,
      label: reference.label,
      characterType: reference.characterType,
      campaignId: reference.campaignId,
    })
  }

  if (reference.kind === 'game-term') {
    return GAME_TERMS_ROUTES.detail(campaignId, reference.setId, reference.id)
  }

  return resolveContentBlockerHref(campaignId, {
    kind: 'content',
    contentTypeKey: reference.contentTypeKey,
    id: reference.id,
    label: reference.label,
    slug: reference.slug,
  })
}

/** Single usage reference row with external-link affordance. */
export function UsageReferenceRow({ reference, campaignId }: UsageReferenceRowProps) {
  const href = resolveUsageReferenceHref(campaignId, reference)

  return (
    <Link
      to={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-style-label text-primary underline-offset-4 hover:underline"
    >
      <span>{reference.label}</span>
      <ExternalLink aria-hidden className="size-icon-inline shrink-0" />
      <span className="sr-only">Opens in new tab</span>
    </Link>
  )
}
