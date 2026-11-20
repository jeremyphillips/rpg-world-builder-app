import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

/** Keeps multiattack subtrees registered when the action detail unmounts. */
export function MonsterMultiattackPersistSlot({ namePrefix }: { namePrefix: string }) {
  const { register } = useFormContext()
  useEffect(() => {
    register(`${namePrefix}.steps`, { shouldUnregister: false })
    register(`${namePrefix}.replacement`, { shouldUnregister: false })
    register(`${namePrefix}.alternative`, { shouldUnregister: false })
  }, [namePrefix, register])
  return null
}
