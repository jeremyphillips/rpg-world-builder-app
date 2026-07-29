import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_SYSTEM_RULESET_ID, type SystemRulesetId } from '@rpg/contracts'
import { buttonVariants, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { CharacterListCard } from '@/features/character'
import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'

import { useBuildContext } from '../hooks/use-build-context'
import { useCharacters } from '../hooks/use-characters'
import { buildCharacterCardViewModel } from '../lib/display/character-display'
import { CHARACTERS_INDEX_SECTION_LABELS } from '../lib/character-list-routing'
import { resolveCharacterDetailHref } from '@/lib/routing/resolve-character-detail-href'
import { resolveQueryErrorLabel } from '../lib/resolve-query-error-label.lib'

const CHARACTERS_EMPTY_MESSAGE = 'No characters yet. Create one to get started.'

type CharacterListSectionProps = {
  heading: string
  cards: Array<{
    id: string
    card: ReturnType<typeof buildCharacterCardViewModel>
    detailHref: string
    rosterStatus?: 'active' | 'inactive' | 'retired'
  }>
}

function CharacterListSection({ heading, cards }: CharacterListSectionProps) {
  if (cards.length === 0) return null

  return (
    <section aria-labelledby={`characters-section-${heading}`} className="space-y-4">
      <Heading variant="group" as="h2" id={`characters-section-${heading}`}>
        {heading}
      </Heading>
      <ul className="grid gap-4 sm:grid-cols-2">
        {cards.map((entry) => (
          <li key={entry.id}>
            <CharacterListCard
              card={entry.card}
              detailHref={entry.detailHref}
              rosterStatus={entry.rosterStatus}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}

export function CharactersOverview() {
  const {
    data: characters,
    isPending: isCharactersPending,
    isError: isCharactersError,
    error: charactersError,
  } = useCharacters()
  const rulesetId = (characters?.[0]?.rulesetId ?? DEFAULT_SYSTEM_RULESET_ID) as SystemRulesetId
  const {
    catalogIndex,
    isPending: isCatalogPending,
    isError: isCatalogError,
    error: catalogError,
  } = useBuildContext(rulesetId)

  const groupedCards = useMemo(() => {
    if (!characters || !catalogIndex) {
      return { inCampaigns: [], notInCampaign: [] }
    }

    const inCampaigns: CharacterListSectionProps['cards'] = []
    const notInCampaign: CharacterListSectionProps['cards'] = []

    for (const character of characters) {
      const card = buildCharacterCardViewModel(character, catalogIndex)
      const detailHref = resolveCharacterDetailHref(character)

      if (character.routeContext.kind === 'campaign') {
        inCampaigns.push({
          id: character.id,
          card,
          detailHref,
          rosterStatus: character.routeContext.rosterStatus,
        })
        continue
      }

      notInCampaign.push({
        id: character.id,
        card,
        detailHref,
      })
    }

    return { inCampaigns, notInCampaign }
  }, [catalogIndex, characters])

  const isPending = isCharactersPending || isCatalogPending
  const isError = isCharactersError || isCatalogError
  const errorLabel = resolveQueryErrorLabel([
    { isPending: isCharactersPending, isError: isCharactersError, error: charactersError },
    { isPending: isCatalogPending, isError: isCatalogError, error: catalogError },
  ])
  const hasCharacters = groupedCards.inCampaigns.length > 0 || groupedCards.notInCampaign.length > 0

  return (
    <NarrowPage spacing="list">
      <div className="flex items-start justify-between gap-4">
        <Heading variant="page" as="h1">
          Characters
        </Heading>
        <div className="flex flex-wrap gap-2">
          <Link to={ROUTES.characters.import} className={buttonVariants({ variant: 'outline' })}>
            Import character
          </Link>
          <Link to={ROUTES.characters.new} className={buttonVariants({ variant: 'default' })}>
            Create character
          </Link>
        </div>
      </div>

      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={errorLabel}
        defaultErrorLabel="Could not load characters."
      >
        {!hasCharacters ? (
          <Text variant="muted">{CHARACTERS_EMPTY_MESSAGE}</Text>
        ) : (
          <div className="space-y-8">
            <CharacterListSection
              heading={CHARACTERS_INDEX_SECTION_LABELS.inCampaigns}
              cards={groupedCards.inCampaigns}
            />
            <CharacterListSection
              heading={CHARACTERS_INDEX_SECTION_LABELS.notInCampaign}
              cards={groupedCards.notInCampaign}
            />
          </div>
        )}
      </PageLoadState>
    </NarrowPage>
  )
}
