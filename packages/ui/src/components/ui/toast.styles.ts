import { toastVariants } from './toast.variants'

export const TOAST_CLASS_SPECS = [
  {
    key: 'default',
    className: toastVariants({ tone: 'default' }),
    keyValues: 'surface-lift fill, ui-border--default',
    useCase: 'Neutral transient notice',
  },
  {
    key: 'success',
    className: toastVariants({ tone: 'success' }),
    keyValues: 'surface-lift fill, success-muted border',
    useCase: 'Saved or completed',
  },
  {
    key: 'warning',
    className: toastVariants({ tone: 'warning' }),
    keyValues: 'surface-lift fill, warning-muted border',
    useCase: 'Needs attention',
  },
  {
    key: 'destructive',
    className: toastVariants({ tone: 'destructive' }),
    keyValues: 'surface-lift fill, destructive-muted border',
    useCase: 'Failed action',
  },
  {
    key: 'viewport',
    className: 'ui-toast-viewport',
    keyValues: 'fixed, safe-area bottom, sm top-end cap',
    useCase: 'Page toast stack',
  },
  {
    key: 'viewport-modal',
    className: 'ui-toast-viewport ui-toast-viewport--modal',
    keyValues: 'absolute, centered above a docked footer',
    useCase: 'Toast stack inside a modal',
  },
] as const
