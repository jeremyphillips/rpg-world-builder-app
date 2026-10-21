import { Text } from '@rpg/ui'

interface EpicRelatedCodeAreasProps {
  areas: string[]
}

export function EpicRelatedCodeAreas({ areas }: EpicRelatedCodeAreasProps) {
  return (
    <div className="space-y-2">
      <Text variant="label" className="text-foreground">
        Related code areas
      </Text>
      {areas.length === 0 ? (
        <Text variant="muted">No code references on linked tickets yet.</Text>
      ) : (
        <ul className="space-y-1 text-sm">
          {areas.map((area) => (
            <li key={area} className="font-mono text-muted-foreground">
              {area}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
