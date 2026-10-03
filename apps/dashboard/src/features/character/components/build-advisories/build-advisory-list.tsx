import { Text } from '@rpg/ui'

import type { CharacterBuildAdvisory } from '@rpg/contracts'

import { presentBuildAdvisoryList } from '../../lib/build-advisories/build-advisory-presentation.lib'

type BuildAdvisoryListProps = {
  advisories: readonly CharacterBuildAdvisory[]
}

export function BuildAdvisoryList({ advisories }: BuildAdvisoryListProps) {
  if (advisories.length === 0) return null

  return (
    <ul className="list-disc space-y-1 pl-5">
      {presentBuildAdvisoryList(advisories).map((item) => (
        <li key={item.key}>
          <Text variant="small">
            {item.title ? `${item.title} — ` : null}
            {item.message}
          </Text>
        </li>
      ))}
    </ul>
  )
}
