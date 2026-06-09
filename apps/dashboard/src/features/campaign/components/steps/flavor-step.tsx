import { WizardFooter, useWizard } from '@rpg/ui'

export function FlavorStep() {
  const { completeStep } = useWizard()
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        completeStep({})
      }}
    >
      <p className="text-sm text-muted-foreground">
        Flavor settings — lore tags, tone, and visual theme — are coming soon.
      </p>
      <WizardFooter />
    </form>
  )
}
