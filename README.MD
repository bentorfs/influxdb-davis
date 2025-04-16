# Influxdb-davis
A InfluxDB data ingester for Davis Weatherlink Live and Airlink local API's

This tool uses the local API's from Davis products, as documented in [Weatherlink Live Local API](https://weatherlink.github.io/weatherlink-live-local-api/) and [Airlink Local API](https://weatherlink.github.io/airlink-local-api/). It polls these API's every 60 seconds and ingests the data into an InfluxDB database.

The data will be tagged by:
- `lsid` the sensor id as reported by the API
- `name` the name of the device, as specified in the configuration (see below)

The measurement names are identical to the fields in the API, but units are converted into millimeters, celsius, kilometers per hour and hectopascals, where appropriate.

## How to build
`docker build . -t influxdb-davis`

## How to run

### Configuration
Create a file called `options.json` containing a list of device configurations, as follows:

```
{
  "devices": [
    {
      "host": "http://192.168.1.10",
      "name": "Airlink"
    },
    {
      "host": "http://192.168.1.20",
      "name": "Weatherlink"
    }
  ]
}
```

### Example using docker-compose

You have to map `/data` to the folder containing the `options.json` file

```
  influxdb-davis:
    container_name: ha-influxdb-davis
    image: influxdb-davis
    environment:
      - INFLUXDB_URL=http://ha-influxdb:8086
      - INFLUXDB_TOKEN=<influxdb-token>
      - INFLUXDB_ORG=<influxdb-org>
      - INFLUXDB_BUCKET=<influxdb-bucket>
    volumes:
      - "/path/to/config/:/data"

```
