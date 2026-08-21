import { useCallback, useEffect, useId, useState } from 'react'
import { Check, Copy } from 'lucide-react'

import { Button, Text } from '@rpg/ui'

import type { GeneratedName } from '@rpg/contracts/name-generator'

import {
  nameGeneratorResultNameClasses,
  nameGeneratorResultRowClasses,
} from './name-generator-toolbar.variants'

const COPY_CONFIRMATION_MS = 2000

export type NameGeneratorResultRowProps = {
  result: GeneratedName
  rowKey: string
}

export function NameGeneratorResultRow({ result, rowKey }: NameGeneratorResultRowProps) {
  const [copied, setCopied] = useState(false)
  const confirmationId = useId()

  useEffect(() => {
    if (!copied) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false)
    }, COPY_CONFIRMATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [copied])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.value)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }, [result.value])

  return (
    <div className={nameGeneratorResultRowClasses} data-row-key={rowKey}>
      <Text as="span" className={nameGeneratorResultNameClasses}>
        {result.value}
      </Text>
      <div className="flex items-center gap-2">
        <span id={confirmationId} className="sr-only" role="status" aria-live="polite">
          {copied ? `Copied ${result.value}` : ''}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Copy ${result.value}`}
          onClick={() => {
            void handleCopy()
          }}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          <span className="sr-only">{copied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>
    </div>
  )
}
