import { useState } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import { Form, useSchemaFormSubmit } from '@rpg/ui/form'

import { ContentFormFooter } from '../layout/content-form-footer'

const probeSchema = z.object({
  name: z.string().min(1),
})

type ProbeValues = z.infer<typeof probeSchema>

const probeFields = [{ type: 'text' as const, name: 'name', label: 'Name', required: true }]

export function StaleCreateProbeLayout({
  onSubmit,
  onSaveDraft,
}: {
  onSubmit: (values: FieldValues, form: UseFormReturn<FieldValues>) => Promise<void>
  onSaveDraft?: (values: FieldValues, form: UseFormReturn<FieldValues>) => Promise<void>
}) {
  const [publishSettled, setPublishSettled] = useState(false)

  return (
    <Form<ProbeValues>
      schema={probeSchema}
      fields={probeFields}
      defaultValues={{ name: 'Shield' }}
      onSubmit={async (values, form) => {
        try {
          await onSubmit(values, form)
        } finally {
          setPublishSettled(true)
        }
      }}
      footer={(form) => (
        <>
          <ContentFormFooter
            mode="create"
            form={form}
            backHref="/overview"
            submitLabel="Create equipment"
            pending={false}
            onSaveDraft={onSaveDraft}
          />
          <ProbeBypass onSaveDraft={onSaveDraft} />
          <output data-testid="publish-settled">{String(publishSettled)}</output>
        </>
      )}
    />
  )
}

function ProbeBypass({
  onSaveDraft,
}: {
  onSaveDraft?: (values: FieldValues, form: UseFormReturn<FieldValues>) => Promise<void>
}) {
  const submit = useSchemaFormSubmit<ProbeValues>()
  const [draftSettled, setDraftSettled] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => {
          submit?.requestSubmit(async (values, form) => {
            try {
              await onSaveDraft?.(values, form)
            } finally {
              setDraftSettled(true)
            }
          })
        }}
      >
        Bypass draft
      </button>
      <button type="button" onClick={() => submit?.requestSubmit()}>
        Bypass publish
      </button>
      <output data-testid="draft-settled">{String(draftSettled)}</output>
    </>
  )
}
