import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

function membersTitlesFieldPath(prefix?: string): string {
  return prefix ? `${prefix}.members.titles` : 'members.titles'
}

/** Keeps `members.titles` registered under React Hook Form `shouldUnregister`. */
export function OrganizationMembershipTitlesRegistration({ prefix }: { prefix?: string }) {
  const form = useFormContext()
  const path = membersTitlesFieldPath(prefix)

  useEffect(() => {
    form.register(path, { shouldUnregister: false })
  }, [form, path])

  return null
}
