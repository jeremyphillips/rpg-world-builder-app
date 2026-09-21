import { useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Info } from 'lucide-react'
import { FormProvider, useForm, useFormState, useWatch, type Resolver } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { z } from 'zod'
import { campaignLevelSchema } from '@rpg/contracts'
import {
  Alert,
  Button,
  DialogPanelScrollRegion,
  IconContainer,
  Modal,
  RadioCard,
  SemanticText,
} from '@rpg/ui'
import {
  FormItems,
  FormSectionHeader,
  isFieldOptionGroup,
  type FormItem,
  type SelectFieldOptionListItem,
} from '@rpg/ui/form'

import { TableBuilderValuesPane, type TableBuilderFormValues } from '@/lib/table-builder'
import { useUnsavedChangesConfirm } from '@/lib/use-unsaved-changes-confirm'

import { getLevelFieldOptions, levelSelectDigits } from '../../lib/form-options/level-field-options'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  detectRegularGain,
  formatRegularGainAlert,
  materializeRegularGain,
  SPELLBOOK_GAIN_MODE_OPTIONS,
  SPELLBOOK_GAIN_MODE_REGULAR,
  SPELLBOOK_GAIN_MODE_VARIABLE,
  type SpellbookGainMode,
} from '../lib/class-spell-selection-form.lib'
import {
  buildClassSpellbookAcquisitionDraft,
  buildClassSpellbookAcquisitionHostConfig,
  mapClassSpellbookAcquisitionDraftToProgression,
} from '../lib/class-spellbook-acquisition-field.lib'
import {
  spellbookAcquisitionModalColumnClasses,
  spellbookAcquisitionModalGainModeColumnClasses,
  spellbookAcquisitionModalGainModeHeaderClasses,
  spellbookAcquisitionModalLayoutClasses,
} from './class-spellbook-acquisition-modal.variants'

const MODAL_HEADLINE = 'Edit spellbook acquisition'
const MODAL_DESCRIPTION = 'Define how this class adds spells to its spellbook.'
const GAIN_MODE_LABEL = 'How are spells gained?'
const GAIN_MODE_HINT =
  'Choose whether this class gains the same number of spells each level or a variable amount by level.'
const REGULAR_SECTION_LABEL = 'Regular acquisition'
const REGULAR_SECTION_HINT =
  'Enter the starting number of spells and how many are gained at each later level.'
const VARIABLE_SECTION_LABEL = 'Spell gains by level'
const VARIABLE_SECTION_HINT =
  'Add a row for each level at which spells are gained. Levels without a row grant 0 spells.'
const VARIABLE_ALERT =
  'Only add levels where spells are gained. A level without a value grants 0 spells.'
const CANCEL_LABEL = 'Cancel'
const SAVE_LABEL = 'Save'

export type ClassSpellbookAcquisitionModalSavePayload = {
  irregular: boolean
  starting?: number
  perLevel?: number
  throughLevel?: number
  curve?: ReturnType<typeof mapClassSpellbookAcquisitionDraftToProgression>
}

export type ClassSpellbookAcquisitionModalProps = {
  open: boolean
  formCtx: ContentFormCtx
  maxLevel: number
  allowedLevels: readonly number[]
  extendedProgression?: {
    standardMaxLevel: number
    tierName: string
  }
  initialGainMode: SpellbookGainMode
  initialStarting?: number
  initialPerLevel?: number
  initialThroughLevel?: number
  initialTableDraft: TableBuilderFormValues
  onSave: (payload: ClassSpellbookAcquisitionModalSavePayload) => void
  onOpenChange: (open: boolean) => void
}

function createRegularDraftSchema(maxLevel: number) {
  const levelField = z.coerce.number().pipe(campaignLevelSchema(maxLevel))
  return z.object({
    starting: z.coerce.number().int().min(0),
    perLevel: z.coerce.number().int().min(0),
    throughLevel: levelField.refine((value) => value >= 2, {
      message: 'Through level must be at least 2.',
    }),
  })
}

type RegularDraftValues = z.infer<ReturnType<typeof createRegularDraftSchema>>

function throughLevelSelectOptions(ctx: ContentFormCtx): SelectFieldOptionListItem[] {
  const options: SelectFieldOptionListItem[] = []

  for (const item of getLevelFieldOptions(ctx)) {
    if (isFieldOptionGroup(item)) {
      const filtered = item.options.filter((option) => Number(option.value) >= 2)
      if (filtered.length > 0) {
        options.push({ ...item, options: filtered })
      }
      continue
    }
    if (Number(item.value) >= 2) {
      options.push(item)
    }
  }

  return options
}

function regularFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      type: 'number',
      name: 'starting',
      label: 'Starting spells',
      min: 0,
      required: true,
    },
    {
      type: 'number',
      name: 'perLevel',
      label: 'Spells gained each later level',
      min: 0,
      required: true,
    },
    {
      type: 'select',
      name: 'throughLevel',
      label: 'Through level',
      options: throughLevelSelectOptions(ctx),
      digits: levelSelectDigits(ctx),
      required: true,
    },
  ]
}

export function ClassSpellbookAcquisitionModal(props: ClassSpellbookAcquisitionModalProps) {
  if (!props.open) return null
  return <ClassSpellbookAcquisitionModalContent {...props} />
}

function ClassSpellbookAcquisitionModalContent({
  formCtx,
  maxLevel,
  allowedLevels,
  extendedProgression,
  initialGainMode,
  initialStarting,
  initialPerLevel,
  initialThroughLevel,
  initialTableDraft,
  onSave,
  onOpenChange,
}: ClassSpellbookAcquisitionModalProps) {
  const formId = useId()
  const gainModeHeadingId = useId()
  const regularFieldsIdPrefix = useId()
  const initialGainModeRef = useRef(initialGainMode)
  const [gainMode, setGainMode] = useState<SpellbookGainMode>(initialGainMode)

  const hostConfig = useMemo(
    () =>
      buildClassSpellbookAcquisitionHostConfig({
        allowedLevels,
        extendedProgression,
      }),
    [allowedLevels, extendedProgression],
  )

  const regularSchema = useMemo(() => createRegularDraftSchema(maxLevel), [maxLevel])

  const regularForm = useForm<RegularDraftValues>({
    resolver: zodResolver(regularSchema) as Resolver<RegularDraftValues>,
    defaultValues: {
      starting: initialStarting ?? 0,
      perLevel: initialPerLevel ?? 0,
      throughLevel: initialThroughLevel ?? maxLevel,
    },
    mode: 'onSubmit',
  })

  const tableForm = useForm<TableBuilderFormValues>({
    defaultValues: initialTableDraft,
    mode: 'onSubmit',
  })

  const { isDirty: regularDirty } = useFormState({ control: regularForm.control })
  const { isDirty: tableDirty } = useFormState({ control: tableForm.control })

  const starting = useWatch({ control: regularForm.control, name: 'starting' })
  const perLevel = useWatch({ control: regularForm.control, name: 'perLevel' })
  const throughLevel = useWatch({ control: regularForm.control, name: 'throughLevel' })

  const regularAlert = formatRegularGainAlert({ starting, perLevel, throughLevel })

  const isDirty = regularDirty || tableDirty || gainMode !== initialGainModeRef.current

  const unsavedChanges = useUnsavedChangesConfirm({ isDirty })

  function handleRequestClose() {
    unsavedChanges.request(() => onOpenChange(false))
  }

  function handleGainModeChange(nextMode: SpellbookGainMode) {
    if (gainMode === nextMode) return

    if (nextMode === SPELLBOOK_GAIN_MODE_VARIABLE) {
      const current = regularForm.getValues()
      tableForm.reset(
        buildClassSpellbookAcquisitionDraft(
          materializeRegularGain({
            starting: current.starting,
            perLevel: current.perLevel,
            throughLevel: current.throughLevel,
          }),
        ),
      )
    } else {
      const progression = mapClassSpellbookAcquisitionDraftToProgression(tableForm.getValues())
      const regular = detectRegularGain(progression)
      if (regular) {
        regularForm.setValue('starting', regular.starting, { shouldDirty: true })
        regularForm.setValue('perLevel', regular.perLevel, { shouldDirty: true })
        regularForm.setValue('throughLevel', regular.throughLevel, { shouldDirty: true })
      }
    }

    setGainMode(nextMode)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (gainMode === SPELLBOOK_GAIN_MODE_REGULAR) {
      void regularForm.handleSubmit((values) => {
        onSave({
          irregular: false,
          starting: values.starting,
          perLevel: values.perLevel,
          throughLevel: values.throughLevel,
        })
        onOpenChange(false)
      })()
      return
    }

    const draft = tableForm.getValues()
    const draftValidation = hostConfig.validateDraftBeforeSave?.({ draft })
    if (draftValidation !== undefined && !draftValidation.valid) {
      draftValidation.errors.forEach(({ path, message }) => {
        tableForm.setError(path as FieldPath<TableBuilderFormValues>, {
          type: 'manual',
          message,
        })
      })
      return
    }

    onSave({
      irregular: true,
      curve: mapClassSpellbookAcquisitionDraftToProgression(draft),
    })
    onOpenChange(false)
  }

  return (
    <>
      <Modal.Root
        open
        onOpenChange={(nextOpen) => {
          if (!nextOpen) handleRequestClose()
        }}
      >
        <Modal.Content size="lg" layout="stable" stableSize="default">
          <Modal.Header
            leadIcon={
              <IconContainer size="md">
                <BookOpen aria-hidden />
              </IconContainer>
            }
            headline={MODAL_HEADLINE}
            description={MODAL_DESCRIPTION}
          />
          <Modal.Body stableBody>
            <DialogPanelScrollRegion inset="innerLeading">
              <form id={formId} onSubmit={handleSubmit} noValidate>
                <div className={spellbookAcquisitionModalLayoutClasses}>
                  <div className={spellbookAcquisitionModalGainModeColumnClasses}>
                    <FormSectionHeader
                      id={gainModeHeadingId}
                      className={spellbookAcquisitionModalGainModeHeaderClasses}
                      label={GAIN_MODE_LABEL}
                      hint={GAIN_MODE_HINT}
                      labelPresentation="field-label"
                      size="md"
                    />
                    <RadioCard
                      idPrefix="spellbook-gain-mode"
                      aria-labelledby={gainModeHeadingId}
                      density="compact"
                      options={[...SPELLBOOK_GAIN_MODE_OPTIONS]}
                      value={gainMode}
                      onValueChange={(value) => handleGainModeChange(value as SpellbookGainMode)}
                    />
                  </div>

                  <div className={spellbookAcquisitionModalColumnClasses}>
                    {gainMode === SPELLBOOK_GAIN_MODE_REGULAR ? (
                      <>
                        <FormSectionHeader
                          label={REGULAR_SECTION_LABEL}
                          hint={REGULAR_SECTION_HINT}
                          labelPresentation="field-label"
                          size="md"
                          required
                        />
                        <FormProvider {...regularForm}>
                          <FormItems
                            idPrefix={regularFieldsIdPrefix}
                            items={regularFields(formCtx)}
                          />
                        </FormProvider>
                        {regularAlert ? (
                          <Alert variant="default" density="compact">
                            <SemanticText tone="neutral" icon={<Info aria-hidden />}>
                              {regularAlert}
                            </SemanticText>
                          </Alert>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <FormSectionHeader
                          label={VARIABLE_SECTION_LABEL}
                          hint={VARIABLE_SECTION_HINT}
                          labelPresentation="field-label"
                          size="md"
                          required
                        />
                        <TableBuilderValuesPane
                          form={tableForm}
                          config={hostConfig}
                          allowedLevels={allowedLevels}
                          chrome="bare"
                        />
                        <Alert variant="default" density="compact">
                          <SemanticText tone="neutral" icon={<Info aria-hidden />}>
                            {VARIABLE_ALERT}
                          </SemanticText>
                        </Alert>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </DialogPanelScrollRegion>
          </Modal.Body>
          <Modal.Footer>
            <Modal.FooterActions>
              <Button type="button" variant="outline" onClick={handleRequestClose}>
                {CANCEL_LABEL}
              </Button>
              <Button type="submit" form={formId}>
                {SAVE_LABEL}
              </Button>
            </Modal.FooterActions>
          </Modal.Footer>
        </Modal.Content>
      </Modal.Root>

      {unsavedChanges.dialog}
    </>
  )
}
