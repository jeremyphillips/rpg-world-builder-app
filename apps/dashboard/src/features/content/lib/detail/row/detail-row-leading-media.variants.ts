import { cva } from 'class-variance-authority'

/** Inner slot — child fills geometry owned by the outer IdentityFrame shell. */
export const detailRowLeadingMediaChildSlotVariants = cva(
  'size-full overflow-hidden [&>*]:size-full [&_img]:size-full [&_img]:max-w-none [&_img]:object-cover',
)
