import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_SYSTEM_RULESET_ID, type SystemRulesetId } from '@rpg/contracts'
import { buttonVariants, Heading, Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'

import { CharacterListCard } from '../components/character-list-card.client'
import { useBuildContext } from '../hooks/use-build-context'
import { useCharacters } from '../hooks/use-characters'
import { buildCharacterCardViewModel } from '../lib/display/character-display'

const CHARACTERS_EMPTY_MESSAGE = 'No characters yet. Create one to get started.'

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

  const cards = useMemo(() => {
    if (!characters || !catalogIndex) return []

    return characters.map((character) => buildCharacterCardViewModel(character, catalogIndex))
  }, [catalogIndex, characters])

  const isPending = isCharactersPending || isCatalogPending
  const isError = isCharactersError || isCatalogError
  const errorLabel = charactersError?.message ?? catalogError?.message

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
        {cards.length === 0 ? (
          <Text variant="muted">{CHARACTERS_EMPTY_MESSAGE}</Text>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <li key={card.id}>
                <CharacterListCard card={card} />
              </li>
            ))}
          </ul>
        )}
      </PageLoadState>
    </NarrowPage>
  )
}
