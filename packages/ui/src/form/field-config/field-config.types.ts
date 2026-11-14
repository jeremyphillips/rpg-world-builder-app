import type {
  TextFieldConfig,
  TextSuggestionsFieldConfig,
  NumberFieldConfig,
  TextareaFieldConfig,
  JsonFieldConfig,
  RichTextFieldConfig,
  MarkdownFieldConfig,
  FileFieldConfig,
} from './text-fields.types'
import type {
  SelectFieldConfig,
  RadioFieldConfig,
  SegmentedControlFieldConfig,
  RadioCardFieldConfig,
  CheckboxFieldConfig,
  SwitchFieldConfig,
  ChipsFieldConfig,
  ChooseFromChipsFieldConfig,
  InlineChooseCountFieldConfig,
  ComboboxFieldConfig,
} from './choice-fields.types'
import type {
  InlineSentenceFieldConfig,
  JoinedPairFieldConfig,
  LevelRangeFieldConfig,
  EditableGridFieldConfig,
  InputSelectFieldConfig,
  InputUnitFieldConfig,
} from './composite-fields.types'
import type { DiceFormulaFieldConfig, RollValueFieldConfig } from './dice-fields.types'

/**
 * Discriminated union of every leaf field, keyed by `type`.
 *
 * Simple types (`text`, `number`, `checkbox`, …) need no authoring helper — use plain
 * object literals. Complex types have `define*Field()` helpers in `form-authoring.ts`
 * (`defineSelectField`, `defineComboboxField`, `defineInlineSentenceField`, …).
 */
export type FieldConfig =
  | TextFieldConfig
  | TextSuggestionsFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | RadioFieldConfig
  | SegmentedControlFieldConfig
  | RadioCardFieldConfig
  | CheckboxFieldConfig
  | SwitchFieldConfig
  | JsonFieldConfig
  | RichTextFieldConfig
  | MarkdownFieldConfig
  | FileFieldConfig
  | ChipsFieldConfig
  | ChooseFromChipsFieldConfig
  | InlineChooseCountFieldConfig
  | InlineSentenceFieldConfig
  | JoinedPairFieldConfig
  | LevelRangeFieldConfig
  | ComboboxFieldConfig
  | EditableGridFieldConfig
  | DiceFormulaFieldConfig
  | RollValueFieldConfig
  | InputSelectFieldConfig
  | InputUnitFieldConfig
