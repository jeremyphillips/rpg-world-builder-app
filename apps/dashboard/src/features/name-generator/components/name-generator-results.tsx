import { Alert, Button, Text } from '@rpg/ui'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import type {
  NameGeneratorPageError,
  NameGeneratorResultsSummary,
  NameGeneratorStatus,
} from '../model/name-generator-filters'
import { NameGeneratorResultRow } from './name-generator-result-row'
import { nameGeneratorResultsHeaderClasses } from './name-generator-toolbar.variants'

export type NameGeneratorResultsProps = {
  status: NameGeneratorStatus
  results: GeneratedName[]
  resultsSummary?: NameGeneratorResultsSummary
  error?: NameGeneratorPageError
  seed?: string
  onRegenerate: () => void
}

function buildResultRowKey(result: GeneratedName, index: number, seed: string | undefined): string {
  return `${result.conventionId}:${result.structureId}:${seed ?? 'no-seed'}:${index}`
}

function getErrorAlertVariant(error: NameGeneratorPageError): 'default' | 'destructive' {
  return error.kind === 'invalid-collection' ? 'default' : 'destructive'
}

export function NameGeneratorResults({
  status,
  results,
  resultsSummary,
  error,
  seed,
  onRegenerate,
}: NameGeneratorResultsProps) {
  if (status === 'idle') {
    return (
      <Text variant="muted" role="status">
        Choose a naming context and generate a list of names.
      </Text>
    )
  }

  if (status === 'loading') {
    return (
      <Text variant="muted" role="status" aria-live="polite">
        Generating names…
      </Text>
    )
  }

  if (status === 'error' && error !== undefined) {
    return (
      <Alert
        variant={getErrorAlertVariant(error)}
        title={error.title}
        role="alert"
        aria-live="assertive"
      >
        <Text variant="muted" className="text-sm">
          {error.description}
        </Text>
      </Alert>
    )
  }

  if (status !== 'success') {
    return null
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={nameGeneratorResultsHeaderClasses}>
        <div className="flex flex-col gap-2">
          {resultsSummary?.tone === 'warning' ? (
            <Alert
              variant="warning"
              title={resultsSummary.title}
              role="status"
              aria-live="polite"
            />
          ) : resultsSummary !== undefined ? (
            <div className="flex flex-col gap-1">
              <Text variant="emphasis">{resultsSummary.title}</Text>
              {resultsSummary.subtitle !== undefined ? (
                <Text variant="muted" className="text-sm">
                  {resultsSummary.subtitle}
                </Text>
              ) : null}
            </div>
          ) : null}
        </div>
        <Button type="button" variant="outline" onClick={onRegenerate}>
          Regenerate
        </Button>
      </div>

      <div>
        {results.map((result, index) => (
          <NameGeneratorResultRow
            key={buildResultRowKey(result, index, seed)}
            rowKey={buildResultRowKey(result, index, seed)}
            result={result}
          />
        ))}
      </div>
    </div>
  )
}
