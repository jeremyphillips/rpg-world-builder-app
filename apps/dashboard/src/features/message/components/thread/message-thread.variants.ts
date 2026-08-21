import { cva } from 'class-variance-authority'

export const messageThreadHeaderClasses = 'shrink-0 border-b border-border px-4 py-3'

export const messageThreadPreviewEyebrowClasses = 'px-4 pt-3'

export const messageBubbleVariants = cva('inline-block rounded-lg px-3 py-2 text-left', {
  variants: {
    sender: {
      self: 'bg-message-bubble-self text-message-bubble-self-foreground',
      peer: 'bg-message-bubble-peer text-message-bubble-peer-foreground',
    },
  },
  defaultVariants: {
    sender: 'peer',
  },
})

export const messageThreadGroupClasses = 'flex max-w-[85%] flex-col gap-1'

export const messageThreadClasses = 'flex flex-col gap-6'

export const messageThreadGroupTimestampClasses = 'mt-1 block'

export const messageThreadDateSeparatorClasses = 'py-1 text-center'

export const messageComposerTextareaClasses = 'min-h-[2.5rem] max-h-40 resize-none overflow-y-auto'
