/** Lane layout — no drag/drop state. */
export const benchColumnBaseClasses =
  'flex min-h-32 min-w-0 flex-col gap-3 rounded-lg p-1 transition-colors'

/** Lane fill when a ticket is dragged over during an active drag. */
export const benchColumnDropTargetClasses = 'bg-drop-target'

/** In-column draggable ticket surface (grab cursor, pointer events for drag). */
export const benchDraggableTicketBaseClasses = 'relative touch-none cursor-grab'

/** Source ticket ghost while the overlay is shown. */
export const benchDraggableTicketDraggingClasses = 'cursor-grabbing opacity-40'

/** Floating card rendered in DragOverlay — separate from in-column card chrome. */
export const benchDragOverlayCardClasses = 'rotate-1 shadow-lg'
