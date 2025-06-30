import * as grpc from '@grpc/grpc-js';
import {
  WeatherServiceClient,
  LocationCatalogServiceClient,
  WeatherRequest,
  Granularity,
  WeatherVariable,
  CountryList,
  StateList,
  CityList,
  WeatherResponse
} from './gen/weather';

const weatherClient = new WeatherServiceClient('localhost:50051', grpc.credentials.createInsecure());
const locationClient = new LocationCatalogServiceClient('localhost:50051', grpc.credentials.createInsecure());

async function run() {
  // List countries
  locationClient.listCountries({}, (err: grpc.ServiceError | null, res?: CountryList) => {
    if (err) return console.error('ListCountries error:', err);
    const countries = res?.countries || [];
    const us = countries.find(c => c.code === 'US');
    if (!us) return console.error('US not found');

    console.log('Found country:', us.name);

    // List states in US
    locationClient.listStates({ countryCode: us.code }, (err: grpc.ServiceError | null, res?: StateList) => {
      if (err) return console.error('ListStates error:', err);
      const states = res?.states || [];
      const california = states.find(s => s.name === 'California');
      if (!california) return console.error('California not found');

      console.log('Found state:', california.name);

      // List cities in California
      locationClient.listCities({ countryCode: us.code, stateName: california.name }, (err: grpc.ServiceError | null, res?: CityList) => {
        if (err) return console.error('ListCities error:', err);
        const cities = res?.cities || [];
        const sf = cities.find(c => c.name === 'San Francisco') || cities[0];
        if (!sf) return console.error('No city found');

        console.log('Using city:', sf.name);

        // Get weather
        const req: WeatherRequest = {
          countryCode: us.code,
          stateName: california.name,
          cityName: sf.name,
          startTime: '2025-06-20T00:00:00Z',
          endTime: '2025-06-21T00:00:00Z',
          granularity: Granularity.HOURLY,
          variables: [WeatherVariable.TEMPERATURE, WeatherVariable.HUMIDITY]
        };

        weatherClient.getWeather(req, (err: grpc.ServiceError | null, res?: WeatherResponse) => {
          if (err) return console.error('GetWeather error:', err);
          console.log('Weather Data (first 5):', res?.data?.slice(0, 5));
        });
      });
    });
  });
}

run();