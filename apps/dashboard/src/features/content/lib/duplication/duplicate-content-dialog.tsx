import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { canDuplicateContentType, type ContentSource, type ContentTypeKey } from '@rpg/contracts'
import { Modal } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'

import { useSubmitHandler } from '@/lib/use-submit-handler'
import { notifyDuplicateContentCreated } from '@/lib/notify'

import { resolveContentPostCreateEditHref } from '../forms/shells/layout/content-form-navigation'
import {
  buildDuplicateContentDefaultValues,
  duplicateContentFormFields,
  duplicateContentFormSchema,
  type DuplicateContentFormValues,
} from './duplicate-content-form'
import {
  DUPLICATE_CONTENT_FALLBACK_ERROR,
  formatDuplicateContentDialogDescription,
  formatDuplicateContentDialogHeadline,
  formatDuplicateContentSubmitLabel,
} from './duplicate-content-labels'
import { useDuplicateContent } from './use-duplicate-content'

export type DuplicateContentSource = {
  id: string
  name: string
  source: ContentSource
  kind?: unknown
}

export type DuplicateContentDialogProps = {
  campaignId: string
  contentTypeKey: ContentTypeKey
  queryKeyFn: (campaignId: string) => readonly unknown[]
  source: DuplicateContentSource
  trigger: React.ReactNode
}

/** Manager-only duplicate dialog — composes shared form primitives with domain mutation and navigation. */
export function DuplicateContentDialog({
  campaignId,
  contentTypeKey,
  queryKeyFn,
  source,
  trigger,
}: DuplicateContentDialogProps) {
  const [open, setOpen] = useState(false)
  const idempotencyKeyRef = useRef(crypto.randomUUID())
  const navigate = useNavigate()
  useEffect(() => {
    idempotencyKeyRef.current = crypto.randomUUID()
  }, [source.id])

  const { mutateAsync, isPending } = useDuplicateContent(campaignId, contentTypeKey, queryKeyFn)

  const { onSubmit, formError } = useSubmitHandler<DuplicateContentFormValues>({
    submit: async (values, form) => {
      const saved = await mutateAsync({
        entityId: source.id,
        name: values.name,
        idempotencyKey: idempotencyKeyRef.current,
      })
      form.reset(buildDuplicateContentDefaultValues(source.name))
      setOpen(false)
      void navigate(
        resolveContentPostCreateEditHref({ routeKey: contentTypeKey }, campaignId, {
          id: (saved as { id: string }).id,
          kind: (saved as { kind?: unknown }).kind ?? source.kind,
        }),
      )
      notifyDuplicateContentCreated()
    },
    fallbackMessage: DUPLICATE_CONTENT_FALLBACK_ERROR,
  })

  if (!canDuplicateContentType(contentTypeKey)) {
    return null
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Header
          headline={formatDuplicateContentDialogHeadline(contentTypeKey)}
          description={formatDuplicateContentDialogDescription(source.source)}
        />
        <Modal.Body>
          {open ? (
            <Form<DuplicateContentFormValues>
              key={source.id}
              schema={duplicateContentFormSchema}
              fields={duplicateContentFormFields}
              defaultValues={buildDuplicateContentDefaultValues(source.name)}
              onSubmit={onSubmit}
              formError={formError}
              footer={(form) => (
                <FormSaveFooter
                  pending={isPending || form.formState.isSubmitting}
                  submitLabel={formatDuplicateContentSubmitLabel(contentTypeKey)}
                />
              )}
            />
          ) : null}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  )
}
