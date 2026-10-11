import { useWatch } from 'react-hook-form'

import {
  MONSTER_ACTIONS_HEADING,
  MONSTER_PRESERVED_COLLECTIONS_NOTE,
  MONSTER_TRAITS_HEADING,
} from '../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../lib/monster-form-values'

export function MonsterTraitsPassthrough() {
  const traits = useWatch<MonsterFormValues, 'traits'>({ name: 'traits' }) ?? []
  return (
    <section>
      <h3>{MONSTER_TRAITS_HEADING}</h3>
      <p>{MONSTER_PRESERVED_COLLECTIONS_NOTE}</p>
      <ul>
        {traits.map((trait) => (
          <li key={trait.id}>{trait.name}</li>
        ))}
      </ul>
    </section>
  )
}

export function MonsterActionsPassthrough() {
  const actions = useWatch<MonsterFormValues, 'actions'>({ name: 'actions' }) ?? []
  const bonusActions = useWatch<MonsterFormValues, 'bonusActions'>({ name: 'bonusActions' }) ?? []
  const reactions = useWatch<MonsterFormValues, 'reactions'>({ name: 'reactions' }) ?? []
  return (
    <section>
      <h3>{MONSTER_ACTIONS_HEADING}</h3>
      <p>{MONSTER_PRESERVED_COLLECTIONS_NOTE}</p>
      <ul>
        {[...actions, ...bonusActions, ...reactions].map((action) => (
          <li key={String(action.id)}>
            {typeof action.name === 'string' ? action.name : String(action.id)}
          </li>
        ))}
      </ul>
    </section>
  )
}
