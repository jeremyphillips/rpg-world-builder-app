import { useParams } from 'react-router-dom'

import { LocationCreatePage } from '../components/create/location-create-page.client'

export function LocationCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()

  return <LocationCreatePage campaignId={campaignId} />
}
