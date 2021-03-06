import { AxiosStatic } from 'axios'

export interface IStormGlassPointSource {
  [key: string]: number;
}

export interface IStormGlassPoint {
  readonly time: string;
  readonly waveHeight: IStormGlassPointSource;
  readonly waveDirection: IStormGlassPointSource;
  readonly swellDirection: IStormGlassPointSource;
  readonly swellHeight: IStormGlassPointSource;
  readonly swellPeriod: IStormGlassPointSource;
  readonly windDirection: IStormGlassPointSource;
  readonly windSpeed: IStormGlassPointSource;
}

export interface IStormGlassForecastResponse {
  hours: IStormGlassPoint[];
}

export interface IForecastPoint {
  time: string;
  waveHeight: number;
  waveDirection: number;
  swellDirection: number;
  swellHeight: number;
  swellPeriod: number;
  windDirection: number;
  windSpeed: number;
}

export class StormGlass {
  readonly stormGlassAPIParams = 'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed'
  readonly stormGlassAPISource = 'noaa'

  constructor (protected request: AxiosStatic) {}

  public async fetchPoints (lat: number, long: number): Promise<IForecastPoint[]> {
    try {
      const url = `https://api.stormglass.io/v2/weather/point?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=1592113802&lat=${lat}&lng=${long}`
      const response = await this.request.get<IStormGlassForecastResponse>(url, {
        headers: {
          Authorization: process.env.API_KEY
        }
      })

      return this.normalizeResponse(response.data)
    } catch (err) {
      throw new Error(`Unexpected error when trying to communicate to StormGlass: ${err.message}`)
    }
  }

  private normalizeResponse (points: IStormGlassForecastResponse): IForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      time: point.time,
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource]
    }))
  }

  // Partial => Diz que o tipo declarado (IStormGlassPoint) pode ou n??o ter todas as chaves
  private isValidPoint (point: Partial<IStormGlassPoint>): boolean {
    return !!(
      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.waveHeight?.[this.stormGlassAPISource] &&
      point.windDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource]
    )
  }
}
