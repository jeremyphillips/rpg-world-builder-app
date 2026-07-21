import { useMemo } from 'react'
import type { ContentTypeKey, Feat, Spell } from '@rpg/contracts'
import type { RichTextLinkPickerContentTypeOption, RichTextLinkPickerInternalOption } from '@rpg/ui'

import { CONTENT_ROUTES } from '@/app/content-routes'
import {
  formatContentOverviewLinkTitle,
  getContentTypeCollectionLabel,
  getContentTypeItemLabel,
} from '@/features/content/lib/content-type-labels'

import { useFeats } from '../../feats/hooks/use-feats'
import { useSpells } from '../../spells/hooks/use-spells'

export type LinkableContentType = 'spell' | 'feat'

type LinkableContentTypeKey = Extract<ContentTypeKey, 'spells' | 'feats'>

type LinkableEntityByType = {
  spell: Pick<Spell, 'slug' | 'name' | 'source'>
  feat: Pick<Feat, 'slug' | 'name' | 'source'>
}

type LinkableEntity = LinkableEntityByType[LinkableContentType]
type LinkableEntitiesByType = Partial<{
  [K in LinkableContentType]: LinkableEntityByType[K][]
}>

interface LinkableTypeConfig {
  contentTypeKey: LinkableContentTypeKey
  overviewId: string
  overviewHref: (campaignId: string) => string
  detailHref: (campaignId: string, slug: string) => string
}

const LINKABLE_CONTENT_TYPE_ORDER = [
  'spell',
  'feat',
] as const satisfies readonly LinkableContentType[]

const LINKABLE_CONTENT_TYPE_CONFIG: Record<LinkableContentType, LinkableTypeConfig> = {
  spell: {
    contentTypeKey: 'spells',
    overviewId: '__spell_overview__',
    overviewHref: CONTENT_ROUTES.spells.overview,
    detailHref: CONTENT_ROUTES.spells.detail,
  },
  feat: {
    contentTypeKey: 'feats',
    overviewId: '__feat_overview__',
    overviewHref: CONTENT_ROUTES.feats.overview,
    detailHref: CONTENT_ROUTES.feats.detail,
  },
}

function linkableTypeLabel(contentType: LinkableContentType): string {
  return getContentTypeCollectionLabel(LINKABLE_CONTENT_TYPE_CONFIG[contentType].contentTypeKey)
}

function linkableOverviewTitle(contentType: LinkableContentType): string {
  return formatContentOverviewLinkTitle(LINKABLE_CONTENT_TYPE_CONFIG[contentType].contentTypeKey)
}

function linkableEyebrowLabel(contentType: LinkableContentType): string {
  return getContentTypeItemLabel(LINKABLE_CONTENT_TYPE_CONFIG[contentType].contentTypeKey)
}

export const RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS = LINKABLE_CONTENT_TYPE_ORDER.map(
  (contentType) => ({
    value: contentType,
    label: linkableTypeLabel(contentType),
  }),
) satisfies RichTextLinkPickerContentTypeOption[]

const HOMEBREW_SOURCE_LABEL = 'Homebrew'

interface BuildRichTextInternalLinkOptionsInput {
  campaignId: string
  entitiesByType: LinkableEntitiesByType
}

function compareByTitle(
  left: Pick<RichTextLinkPickerInternalOption, 'title'>,
  right: Pick<RichTextLinkPickerInternalOption, 'title'>,
): number {
  return left.title.localeCompare(right.title)
}

function sourceLabel(source: LinkableEntity['source']): string | undefined {
  return source === 'homebrew' ? HOMEBREW_SOURCE_LABEL : undefined
}

function buildDetailLinkOptions<T extends LinkableContentType>(
  contentType: T,
  campaignId: string,
  entities?: LinkableEntityByType[T][],
): RichTextLinkPickerInternalOption[] {
  const config = LINKABLE_CONTENT_TYPE_CONFIG[contentType]
  const detailOptions =
    entities
      ?.map((entity) => ({
        id: entity.slug,
        title: entity.name,
        href: config.detailHref(campaignId, entity.slug),
        contentType,
        kind: 'detail' as const,
        eyebrowLabel: linkableEyebrowLabel(contentType),
        sourceLabel: sourceLabel(entity.source),
      }))
      .sort(compareByTitle) ?? []
  return detailOptions
}

function buildLinkOptionsForType<T extends LinkableContentType>(
  contentType: T,
  campaignId: string,
  entities?: LinkableEntityByType[T][],
): RichTextLinkPickerInternalOption[] {
  const config = LINKABLE_CONTENT_TYPE_CONFIG[contentType]
  return [
    {
      id: config.overviewId,
      title: linkableOverviewTitle(contentType),
      href: config.overviewHref(campaignId),
      contentType,
      kind: 'overview',
      eyebrowLabel: linkableEyebrowLabel(contentType),
    },
    ...buildDetailLinkOptions(contentType, campaignId, entities),
  ]
}

/**
 * Builds picker-ready internal link options for rich text authoring. The first
 * item for each content type is its overview route, followed by alphabetized detail rows.
 */
export function buildRichTextInternalLinkOptions({
  campaignId,
  entitiesByType,
}: BuildRichTextInternalLinkOptionsInput): RichTextLinkPickerInternalOption[] {
  return LINKABLE_CONTENT_TYPE_ORDER.flatMap((contentType) =>
    buildLinkOptionsForType(contentType, campaignId, entitiesByType[contentType]),
  )
}

export function useRichTextInternalLinkOptions(campaignId: string | undefined): {
  options: RichTextLinkPickerInternalOption[]
  contentTypeOptions: RichTextLinkPickerContentTypeOption[]
  isPending: boolean
  isError: boolean
} {
  const spellsQuery = useSpells(campaignId)
  const featsQuery = useFeats(campaignId)

  const options = useMemo(() => {
    if (!campaignId) return []
    return buildRichTextInternalLinkOptions({
      campaignId,
      entitiesByType: {
        spell: spellsQuery.data,
        feat: featsQuery.data,
      },
    })
  }, [campaignId, featsQuery.data, spellsQuery.data])

  return {
    options,
    contentTypeOptions: RICH_TEXT_LINK_CONTENT_TYPE_OPTIONS,
    isPending: spellsQuery.isPending || featsQuery.isPending,
    isError: spellsQuery.isError || featsQuery.isError,
  }
}
