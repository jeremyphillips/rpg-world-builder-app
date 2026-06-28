import express, { type Express, Router } from 'express'
import cookieParser from 'cookie-parser'

import { verifyCsrf } from './middleware/csrf'
import { errorHandler, notFound } from './middleware/error-handler'
import { authRouter } from './features/auth'
import { campaignRouter } from './features/campaign/campaign.routes'
import { contentRouter } from './features/content'
import { homebrewRouter, vocabularyRouter } from './features/vocabulary/vocabulary.routes'
import { rulesetPatchRouter } from './features/vocabulary/ruleset-patch.routes'
import { uploadsRouter, ensureUploadDir } from './features/uploads'
import { userRouter } from './features/user/user.routes'
import { benchRouter } from './features/dev-bench'

/**
 * Build the Express application. All routes are mounted under `/api` because
 * the single-origin proxy forwards `/api/*` here without stripping the prefix.
 * No CORS is configured — the browser only ever talks to one origin.
 */
export function createApp(): Express {
  const app = express()

  // Ensure the upload directory exists before any requests are handled.
  ensureUploadDir()

  app.disable('x-powered-by')
  app.use(express.json())
  app.use(cookieParser())
  // Double-submit CSRF guard for every state-changing request.
  app.use(verifyCsrf)

  const api = Router()
  api.get('/health', (_req, res) => {
    res
      .status(200)
      .json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
  })
  api.use('/auth', authRouter)
  api.use('/campaigns', campaignRouter)
  api.use('/campaigns/:campaignId/content', contentRouter)
  api.use('/campaigns/:campaignId/vocabulary', vocabularyRouter)
  api.use('/campaigns/:campaignId/ruleset-patch', rulesetPatchRouter)
  api.use('/campaigns/:campaignId/homebrew', homebrewRouter)
  api.use('/uploads', uploadsRouter)
  api.use('/users', userRouter)
  api.use('/bench', benchRouter)

  app.use('/api', api)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
