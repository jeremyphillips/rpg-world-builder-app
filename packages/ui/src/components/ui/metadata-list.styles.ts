import { metadataListVariants } from './metadata-list.variants'

export const METADATA_LIST_CLASS_SPECS = [
  {
    key: 'default-ruled',
    className: `ui-metadata-list ${metadataListVariants()}`,
    keyValues:
      'text-md, row gap 0.375rem, column gap 1.5rem, content track, label emphasis, bottom rule',
    useCase: 'Content stat lists and option-detail sheets',
  },
  {
    key: 'sm-value-fill',
    className: `ui-metadata-list ${metadataListVariants({
      size: 'sm',
      emphasis: 'value',
      valueTrack: 'fill',
      divider: false,
    })}`,
    keyValues: 'text-sm, value emphasis, fill track, no rule',
    useCase: 'Admin account summary and campaign review density',
  },
  {
    key: 'xs-compact-fill',
    className: `ui-metadata-list ${metadataListVariants({
      size: 'xs',
      columnGap: 'sm',
      emphasis: 'value',
      valueTrack: 'fill',
      divider: false,
    })}`,
    keyValues: 'text-xs, column gap 0.75rem, value emphasis, fill track',
    useCase: 'Preview rail compact facts and media file metadata',
  },
] as const
