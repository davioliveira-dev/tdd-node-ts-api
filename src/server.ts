import { ForecastController } from './controllers/forecast'
import './utils/moduleAlias'
import { Server } from '@overnightjs/core'
import { Application, json } from 'express'

export class SetupServer extends Server {
  constructor (private port = 3333) {
    super()
  }

  public init (): void {
    this.setupExpress()
    this.setupControllers()
  }

  public getApp (): Application {
    return this.app
  }

  private setupExpress (): void {
    this.app.use(json())
  }

  private setupControllers (): void {
    const forecastController = new ForecastController()
    this.addControllers([forecastController])
  }
}
