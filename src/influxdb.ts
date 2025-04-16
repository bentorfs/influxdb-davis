import { InfluxDB, Point, WriteApi } from '@influxdata/influxdb-client';
import dayjs from 'dayjs';

const INFLUXDB_URL = process.env.INFLUXDB_URL || 'http://localhost:8086';
const INFLUXDB_TOKEN = process.env.INFLUXDB_TOKEN;
const INFLUXDB_ORG = process.env.INFLUXDB_ORG;
const INFLUXDB_BUCKET = process.env.INFLUXDB_BUCKET;

export type DataPoint = { value: number; measurement: string; ts: number };

export class InfluxDBClient {
  private writeApi: WriteApi;

  public connect() {
    const influxDB = new InfluxDB({ url: INFLUXDB_URL, token: INFLUXDB_TOKEN });
    this.writeApi = influxDB.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET);
  }

  public async disconnect() {
    return this.writeApi.close().then(() => {
      console.log('Connection with InfluxDB closed');
    });
  }

  public async writePoints(points: DataPoint[], tags: Record<string, string>) {
    for (const p of points.filter((p) => p.value != null)) {
      const ts = dayjs.unix(p.ts);
      const point = new Point(p.measurement).floatField('value', p.value).timestamp(ts.toDate());
      Object.keys(tags).forEach((k) => {
        point.tag(k, tags[k]);
      });
      this.writeApi.writePoint(point);
    }
    return this.writeApi.flush();
  }
}
