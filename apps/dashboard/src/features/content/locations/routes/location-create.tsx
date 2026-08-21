import { useParams } from 'react-router-dom'

import { LocationCreatePage } from '../components/create/location-create-page'

export function LocationCreate() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()

  return <LocationCreatePage campaignId={campaignId} />
}
