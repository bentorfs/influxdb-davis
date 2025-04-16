import { DavisConditions, DavisData } from './models.js';
import { DataPoint } from './influxdb.js';
import { fahrenheitToCelsius } from './utils.js';

export function getAirlinkPoints(data: DavisData, conditions: DavisConditions): DataPoint[] {
  return Object.keys(conditions)
    .filter((c) => {
      return c !== 'lsid' && c !== 'data_structure_type';
    })
    .map((measurement) => {
      return {
        value: getMeasurementValue(conditions, measurement),
        measurement: measurement,
        lsid: conditions['lsid'],
        ts: data.ts,
      };
    });
}

function getMeasurementValue(conditions: DavisConditions, measurement: string) {
  if (['temp', 'dew_point', 'wet_bulb', 'heat_index'].includes(measurement)) {
    return fahrenheitToCelsius(conditions[measurement]);
  } else {
    return conditions[measurement];
  }
}
