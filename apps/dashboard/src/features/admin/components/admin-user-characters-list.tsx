import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { InlineMetadata, Text } from '@rpg/ui'
import { useFilterState } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { CharacterListCard } from '@/features/character'
import { PageHeader } from '@/components/layout/page/page-header'
import { PageShell } from '@/components/layout/page/page-shell'
import { PrimaryFilterBarRegion } from '@/lib/data-table/primary-filter-bar-region'

import { useAdminUserRouteContext } from '../lib/admin-user-route-context'
import { useAdminUserCharacters } from '../hooks/use-admin-user-characters'
import {
  adminUserCharactersFilterSchema,
  toAdminUserCharactersListQuery,
} from '../lib/admin-user-characters-filter-schema'

export function AdminUserCharactersList() {
  const { userId } = useParams<{ userId: string }>()
  const filterSchema = useMemo(() => adminUserCharactersFilterSchema(), [])
  const { state: filterState, setValue, reset } = useFilterState(filterSchema)
  const listQuery = useMemo(() => toAdminUserCharactersListQuery(filterState), [filterState])

  const { data: characters = [], isPending, isError } = useAdminUserCharacters(userId!, listQuery)

  const filterRegion = (
    <PrimaryFilterBarRegion
      filterSchema={filterSchema}
      filterState={filterState}
      onValueChange={setValue}
      onReset={reset}
    />
  )

  if (isError) {
    return <Text variant="muted">Could not load characters.</Text>
  }

  return (
    <div className="space-y-4">
      {filterRegion}
      {isPending ? (
        <Text variant="muted">Loading characters…</Text>
      ) : characters.length === 0 ? (
        <Text variant="muted">No characters. This user has not created any player characters.</Text>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {characters.map((entry) => (
            <li key={entry.character.id}>
              <CharacterListCard
                card={entry.character}
                detailHref={ROUTES.characters.detail(entry.character.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function AdminUserCharactersPage() {
  const { user } = useAdminUserRouteContext()

  return (
    <PageShell width="narrow" rhythm="list">
      <PageHeader heading="Characters" />
      <Text variant="muted">Player characters owned by this user.</Text>
      <Text variant="muted" className="text-sm">
        <InlineMetadata role="supporting" density="comfortable">
          <InlineMetadata.Item>{user.email}</InlineMetadata.Item>
          <InlineMetadata.Item>
            {user.characterCount} character{user.characterCount === 1 ? '' : 's'}
          </InlineMetadata.Item>
        </InlineMetadata>
      </Text>
      <AdminUserCharactersList />
    </PageShell>
  )
}
