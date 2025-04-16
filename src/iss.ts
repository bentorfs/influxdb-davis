import { DavisConditions, DavisData } from './models.js';
import { DataPoint } from './influxdb.js';
import { fahrenheitToCelsius } from './utils.js';

export function getISSPoints(data: DavisData, conditions: DavisConditions): DataPoint[] {
  return Object.keys(conditions)
    .filter((c) => {
      return ![
        'lsid',
        'data_structure_type',
        'txid',
        'rain_size',
        'rain_storm_last_start_at',
        'rain_storm_last_end_at',
        'rain_storm_start_at',
      ].includes(c);
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
  if (
    [
      'temp',
      'dew_point',
      'wet_bulb',
      'heat_index',
      'wind_chill',
      'thw_index',
      'thsw_index',
      'temp_in',
      'dew_point_in',
      'heat_index_in',
    ].includes(measurement)
  ) {
    return fahrenheitToCelsius(conditions[measurement]);
  } else if (
    [
      'rain_rate_last',
      'rain_rate_hi',
      'rainfall_last_15_min',
      'rain_rate_hi_last_15_min',
      'rainfall_last_60_min',
      'rainfall_last_24_hr',
      'rain_storm',
      'rainfall_daily',
      'rainfall_monthly',
      'rainfall_year',
      'rain_storm_last',
    ].includes(measurement)
  ) {
    return getCountsInMillimeters(conditions[measurement], conditions['rain_size']);
  } else if (
    [
      'wind_speed_last',
      'wind_speed_avg_last_1_min',
      'wind_speed_avg_last_2_min',
      'wind_speed_hi_last_2_min',
      'wind_speed_avg_last_10_min',
      'wind_speed_hi_last_10_min',
    ].includes(measurement)
  ) {
    return getSpeedInKilometersPerHour(conditions[measurement]);
  } else if (['bar_sea_level', 'bar_trend', 'bar_absolute'].includes(measurement)) {
    return getPressureInHectoPascal(conditions[measurement]);
  } else {
    return conditions[measurement];
  }
}

function getCountsInMillimeters(counts: number, rainSize: number) {
  if (rainSize == 1) {
    return counts * 0.01;
  } else if (rainSize == 2) {
    return counts * 0.2;
  } else if (rainSize == 3) {
    return counts * 0.1;
  } else if (rainSize == 4) {
    return counts * 0.001;
  }
  throw new Error('Invalid rain size: ' + rainSize);
}

function getSpeedInKilometersPerHour(mph: number) {
  return mph * 1.609344;
}

function getPressureInHectoPascal(inches: number) {
  return inches * 33.8638816;
}
