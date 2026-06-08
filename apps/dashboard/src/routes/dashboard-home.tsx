import { useSession } from '@/features/auth'
import { CreateCampaignForm } from '@/features/campaign'

export function DashboardHome() {
  const { data: user } = useSession()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome{user ? `, ${user.displayName}` : ''}
        </h2>
        <p className="text-muted-foreground">
          Campaign and content features land here in later phases.
        </p>
      </div>
      <CreateCampaignForm />
    </div>
  )
}
