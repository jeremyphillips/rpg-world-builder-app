import { z } from 'zod'

export const characterImportFormSchema = z.object({
  input: z.string().trim().min(1, 'Enter a character ID or URL.'),
})

export type CharacterImportFormValues = z.infer<typeof characterImportFormSchema>
