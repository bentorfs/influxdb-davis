import { readFileSync } from 'node:fs';

export type DeviceConfig = {
  host: string;
  name: string;
};

export type UserConfig = { devices: DeviceConfig[] };

export function getUserConfig(): UserConfig {
  let parsed: { devices?: any[] } = {};

  try {
    parsed = JSON.parse(readFileSync('/data/options.json', 'utf8'));
  } catch (e) {
    throw new Error('Cannot read user configuration: ' + e.toString());
  }

  const result: UserConfig = { devices: [] };

  if (parsed.devices && Array.isArray(parsed.devices) && parsed.devices.length > 0) {
    for (const device of parsed.devices) {
      if (device.host && device.name) {
        const resultMeter: DeviceConfig = {
          host: device.host,
          name: device.name,
        };

        result.devices.push(resultMeter);
      }
    }
  }

  return result;
}
