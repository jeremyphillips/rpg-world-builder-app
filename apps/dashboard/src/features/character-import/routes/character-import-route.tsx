import { Link, useNavigate } from 'react-router-dom'
import { DEFAULT_SYSTEM_RULESET_ID } from '@rpg/contracts'
import { buttonVariants, Heading } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'
import { PageLoadState } from '@/components/layout/page-load-state'
import { useBuildContext } from '@/features/character/hooks/use-build-context'

import { CharacterImportForm } from '../components/character-import-form.client'
import {
  CHARACTER_IMPORT_DEFAULT_ALIGNMENT,
  type CharacterImportSaveTarget,
} from '../model/character-import-target.lib'

export function CharacterImportRoute() {
  const navigate = useNavigate()
  const { catalogIndex, context, isPending, isError, error } =
    useBuildContext(DEFAULT_SYSTEM_RULESET_ID)

  const saveTarget: CharacterImportSaveTarget | null =
    catalogIndex && context
      ? {
          characterKind: 'pc',
          rulesetId: context.rulesetId,
          catalogIndex,
          defaultAlignment: CHARACTER_IMPORT_DEFAULT_ALIGNMENT,
          saveLabel: 'Save character',
          savingLabel: 'Saving…',
          saveErrorDefault: 'Could not save the imported character.',
        }
      : null

  return (
    <NarrowPage>
      <div className="mb-6 flex items-start justify-between gap-4">
        <Heading variant="page" as="h1">
          Import D&amp;D Beyond character
        </Heading>
        <Link to={ROUTES.characters.list} className={buttonVariants({ variant: 'outline' })}>
          Back to characters
        </Link>
      </div>

      <PageLoadState
        isPending={isPending}
        isError={isError}
        errorLabel={error?.message}
        defaultErrorLabel="Could not load import catalog context."
      >
        <CharacterImportForm
          saveTarget={saveTarget}
          onSaveSuccess={(characterId) => navigate(ROUTES.characters.detail(characterId))}
        />
      </PageLoadState>
    </NarrowPage>
  )
}
