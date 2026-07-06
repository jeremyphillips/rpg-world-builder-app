import { useParams } from 'react-router-dom'

import { PageLoadState } from '@/components/layout/page-load-state'
import { NarrowPage } from '@/components/layout/narrow-page'

import { CharacterDetailContent } from '../components/character-detail-content.client'
import { useCharacter } from '../hooks/use-character'

export function CharacterDetail() {
  const { characterId } = useParams<{ characterId: string }>()
  const { data: character, isPending, isError, error } = useCharacter(characterId)

  return (
    <NarrowPage>
      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={error?.message}
        defaultErrorLabel="Could not load character."
      >
        {character ? <CharacterDetailContent character={character} /> : null}
      </PageLoadState>
    </NarrowPage>
  )
}
