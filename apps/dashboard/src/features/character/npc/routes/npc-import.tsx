import { Link, useNavigate, useParams } from 'react-router-dom'
import { buttonVariants, Heading } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { NarrowPage } from '@/components/layout/narrow-page'
import { PageLoadState } from '@/components/layout/page-load-state'
import { useCampaignBuildContext } from '@/features/character/hooks/use-campaign-build-context'
import { NpcAuthoringGate } from '@/features/character/npc/components/npc-authoring-gate.client'

import { CharacterImportForm } from '@/features/character-import/components/character-import-form.client'
import {
  CHARACTER_IMPORT_DEFAULT_ALIGNMENT,
  type CharacterImportSaveTarget,
} from '@/features/character-import/model/character-import-target.lib'

export function NpcImportRoute() {
  const navigate = useNavigate()
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { catalogIndex, context, isPending, isError, error } = useCampaignBuildContext(campaignId)

  const saveTarget: CharacterImportSaveTarget | null =
    catalogIndex && context
      ? {
          characterKind: 'npc',
          rulesetId: context.rulesetId,
          catalogIndex,
          campaignId,
          defaultAlignment: CHARACTER_IMPORT_DEFAULT_ALIGNMENT,
          saveLabel: 'Save NPC',
          savingLabel: 'Saving…',
          saveErrorDefault: 'Could not save the imported NPC.',
        }
      : null

  return (
    <NpcAuthoringGate campaignId={campaignId}>
      <NarrowPage>
        <div className="mb-6 flex items-start justify-between gap-4">
          <Heading variant="page" as="h1">
            Import D&amp;D Beyond NPC
          </Heading>
          <Link
            to={ROUTES.campaign.npcs.list(campaignId)}
            className={buttonVariants({ variant: 'outline' })}
          >
            Back to NPCs
          </Link>
        </div>

        <PageLoadState
          isPending={isPending}
          isError={isError}
          errorLabel={error?.message}
          defaultErrorLabel="Could not load campaign import context."
        >
          <CharacterImportForm
            saveTarget={saveTarget}
            onSaveSuccess={(npcId) => navigate(ROUTES.campaign.npcs.detail(campaignId, npcId))}
          />
        </PageLoadState>
      </NarrowPage>
    </NpcAuthoringGate>
  )
}
