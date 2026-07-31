import { createServer, type Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'

import type { Express } from 'express'

import { createApp } from '../../app'
import { attachRealtimeServer } from '../../realtime'

export type IntegrationHttpServer = {
  app: Express
  httpServer: HttpServer
  baseUrl: string
}

/** Creates a listening HTTP server with Socket.IO attached for integration tests. */
export async function createIntegrationHttpServer(): Promise<IntegrationHttpServer> {
  const app = createApp()
  const httpServer = createServer(app)
  attachRealtimeServer(httpServer)

  await new Promise<void>((resolve) => {
    httpServer.listen(0, resolve)
  })

  const address = httpServer.address() as AddressInfo
  return {
    app,
    httpServer,
    baseUrl: `http://127.0.0.1:${address.port}`,
  }
}

export async function closeIntegrationHttpServer(httpServer: HttpServer): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    httpServer.close((error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}
