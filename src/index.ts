import { InfluxDBClient } from './influxdb.js';
import { DeviceConfig, getUserConfig } from './config.js';
import cron from 'node-cron';
import axios from 'axios';
import { getAirlinkPoints } from './airlink.js';
import { getISSPoints } from './iss.js';
import { DavisConditions, DavisData } from './models.js';

async function main() {
  console.log('InfluxDB-Davis collector is starting');

  const userConfig = getUserConfig();

  if (userConfig.devices.length === 0) {
    console.error('Invalid configuration');
    return;
  }

  const influxDBClient = new InfluxDBClient();
  influxDBClient.connect();

  async function ingest(device: DeviceConfig) {
    return await axios
      .get(device.host + '/v1/current_conditions')
      .then(async (res) => {
        const response: {
          data: DavisData;
          error: string;
        } = res.data;

        if (response.error != null) {
          console.error(`Device ${device.name} returned error: ${res.data.error}`);
          return;
        }

        for (const c of response.data.conditions) {
          const points = getConditionPoints(response.data, c);
          const tags = {
            lsid: c.lsid.toString(),
            deviceName: device.name,
          };
          await influxDBClient.writePoints(points, tags);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getConditionPoints(data: DavisData, conditions: DavisConditions) {
    if (conditions.data_structure_type == 6) {
      return getAirlinkPoints(data, conditions);
    } else if (conditions.data_structure_type == 1) {
      return getISSPoints(data, conditions);
    } else if (conditions.data_structure_type == 3) {
      return getISSPoints(data, conditions);
    } else if (conditions.data_structure_type == 4) {
      return getISSPoints(data, conditions);
    } else {
      return [];
    }
  }

  // Setup cron job
  cron.schedule(`0 * * * * *`, async () => {
    await influxDBClient.connect();
    for (const device of userConfig.devices) {
      console.info(`Ingesting data from ${device.name}`);
      await ingest(device);
      console.info(`Done ingesting data from ${device.name}`);
    }

    influxDBClient.disconnect();
  });
}

try {
  await main();
} catch (e) {
  console.error(e.toString());
  process.exit(1);
}
