import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import express from 'express';
import { WeatherServiceServer, LocationCatalogServiceServer } from '../gen/weather';
import { getWeatherHandler } from './handlers/weatherHandler';
import { listCountriesHandler, listStatesHandler, listCitiesHandler } from './handlers/locationHandler';

const packageDefinition = protoLoader.loadSync('protos/weather.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const proto = grpc.loadPackageDefinition(packageDefinition) as any;

const server = new grpc.Server();

server.addService(proto.weather.WeatherService.service, {
  getWeather: getWeatherHandler
} as WeatherServiceServer);

server.addService(proto.weather.LocationCatalogService.service, {
  listCountries: listCountriesHandler,
  listStates: listStatesHandler,
  listCities: listCitiesHandler
} as LocationCatalogServiceServer);

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
  console.log(`gRPC server running at http://0.0.0.0:${PORT}`);
  server.start();
});