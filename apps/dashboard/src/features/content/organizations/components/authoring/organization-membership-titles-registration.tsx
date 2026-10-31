import { useEffect } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { membersTitlesFieldPath } from '../../lib/membership-titles/organization-membership-titles-form.lib'

function OrganizationMembershipTitleDomainIdRegistration({
  prefix,
  index,
}: {
  prefix?: string
  index: number
}) {
  const idPath = `${membersTitlesFieldPath(prefix)}.${index}.id`
  useController({ name: idPath })
  return null
}

/**
 * Keeps `members.titles` and each row `id` registered under React Hook Form
 * `shouldUnregister`.
 *
 * Row count comes from `watch`, not `useWatch`. `useWatch` lags a frame after
 * `useFieldArray` `remove`, and the leftover id controller writes the removed
 * row back.
 */
export function OrganizationMembershipTitlesRegistration({ prefix }: { prefix?: string }) {
  const form = useFormContext()
  const path = membersTitlesFieldPath(prefix)
  const titles = form.watch(path) as unknown[] | undefined
  const rowCount = Array.isArray(titles) ? titles.length : 0

  useEffect(() => {
    form.register(path, { shouldUnregister: false })
  }, [form, path])

  return (
    <>
      {Array.from({ length: rowCount }, (_, index) => (
        <OrganizationMembershipTitleDomainIdRegistration
          key={index}
          prefix={prefix}
          index={index}
        />
      ))}
    </>
  )
}
