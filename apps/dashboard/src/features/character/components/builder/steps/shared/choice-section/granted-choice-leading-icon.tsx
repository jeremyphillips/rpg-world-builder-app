import { BadgeCheck } from 'lucide-react'

import { choiceGrantedRowIconClasses } from './choice-granted-row.variants'

/** SSOT leading affordance for granted (non-removable) choice entity cards. */
export function GrantedChoiceLeadingIcon() {
  return <BadgeCheck className={choiceGrantedRowIconClasses} aria-hidden />
}
