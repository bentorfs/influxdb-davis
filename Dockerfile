FROM alpine:latest

LABEL org.opencontainers.image.source=https://github.com/bentorfs/influxdb-davis
LABEL org.opencontainers.image.description="InfluxDB Davis Collector"
LABEL org.opencontainers.image.licenses=MIT

RUN apk add --no-cache nodejs npm

WORKDIR /davis

# Install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci --ignore-scripts

# Copy add-on code
COPY . .

# Transpile TypeScript
RUN npm run build

CMD [ "node", "--experimental-modules", "dist/index.js" ]

