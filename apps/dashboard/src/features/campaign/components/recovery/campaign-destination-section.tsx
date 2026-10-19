import type { CampaignListItem } from '@rpg/contracts'
import type { EyebrowVariantProps } from '@rpg/ui'
import { DestinationList, Eyebrow } from '@rpg/ui'

import { usePersistCampaignSelection } from '../../hooks/use-select-campaign'
import { campaignDestinationListProps } from './campaign-destination-list-shell'
import { CampaignDestinationRow } from './campaign-destination-row'

type CampaignDestinationSectionProps = {
  eyebrow: string
  eyebrowAs?: 'h2' | 'h3'
  eyebrowTone?: NonNullable<EyebrowVariantProps['tone']>
  campaigns: readonly CampaignListItem[]
  onPersistSelection?: (campaignId: string) => void
}

/** Eyebrow label plus bordered destination list shared by overview and dashboard promotions. */
export function CampaignDestinationSection({
  eyebrow,
  eyebrowAs = 'h3',
  eyebrowTone = 'muted',
  campaigns,
  onPersistSelection: onPersistSelectionProp,
}: CampaignDestinationSectionProps) {
  const persistSelectionFromHook = usePersistCampaignSelection()
  const onPersistSelection = onPersistSelectionProp ?? persistSelectionFromHook

  return (
    <section className="space-y-2">
      <Eyebrow as={eyebrowAs} size="sm" tone={eyebrowTone}>
        {eyebrow}
      </Eyebrow>
      <DestinationList {...campaignDestinationListProps}>
        {campaigns.map((campaign) => (
          <CampaignDestinationRow
            key={campaign.id}
            campaign={campaign}
            onPersistSelection={onPersistSelection}
          />
        ))}
      </DestinationList>
    </section>
  )
}
