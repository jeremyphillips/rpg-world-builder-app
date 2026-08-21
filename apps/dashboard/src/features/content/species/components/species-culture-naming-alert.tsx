import { Alert } from '@rpg/ui'

export function SpeciesCultureNamingAlert() {
  return (
    <Alert variant="warning" title="Name generation unavailable">
      Name generation and personal name components are not yet supported for homebrew species.
    </Alert>
  )
}
