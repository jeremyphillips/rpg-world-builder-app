import type { Request, Response } from 'express'

import { previewDndBeyondCharacter } from './dnd-beyond-acquisition.service'

export async function preview(req: Request, res: Response): Promise<void> {
  const { input } = req.body as { input: string }
  const result = await previewDndBeyondCharacter(input)
  res.status(200).json({ result })
}
