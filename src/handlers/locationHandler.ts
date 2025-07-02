import { LocationCatalogServiceServer, Empty, CountryRequest, StateRequest } from '../../gen/weather';
import axios from 'axios';
import * as grpc from '@grpc/grpc-js';

const GEONAMES_USERNAME = 'nishgarg14'; // replace this
const USE_MOCK_DATA = false; // Set to false to use GeoNames API

// Mock data for testing when API fails
const mockCountries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' }
];

const mockStates = [
  { name: 'California' },
  { name: 'New York' },
  { name: 'Texas' }
];

const mockCities = [
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611 }
];

export const listCountriesHandler: LocationCatalogServiceServer['listCountries'] = async (_: grpc.ServerUnaryCall<Empty, any>, callback: grpc.sendUnaryData<any>) => {
  if (USE_MOCK_DATA) {
    callback(null, { countries: mockCountries });
    return;
  }

  try {
    const request = {
      url: 'http://api.geonames.org/countryInfoJSON',
      params: { username: GEONAMES_USERNAME }
    };

    console.log("Fetching from:", axios.getUri(request));

    const res = await axios.get(request.url, { params: request.params });

    const countries = res.data.geonames.map((c: any) => ({
      code: c.countryCode,
      name: c.countryName
    }));

    callback(null, { countries });
  } catch (e) {
    console.error('GeoNames API error, using mock data:', e);
    callback(null, { countries: mockCountries });
  }
};

export const listStatesHandler: LocationCatalogServiceServer['listStates'] = async (call: grpc.ServerUnaryCall<CountryRequest, any>, callback: grpc.sendUnaryData<any>) => {
  if (USE_MOCK_DATA) {
    callback(null, { states: mockStates });
    return;
  }

  try {
    const request = {
      url: 'http://api.geonames.org/searchJSON',
      params: {
        country: call.request.countryCode,
        featureCode: 'ADM1',
        maxRows: 1000,
        username: GEONAMES_USERNAME
      }
    };

    console.log("Fetching from:", axios.getUri(request));

    const res = await axios.get(request.url, { params: request.params });

    const states = res.data.geonames.map((s: any) => ({ name: s.name }));
    callback(null, { states });
  } catch (e) {
    console.error('GeoNames API error, using mock data:', e);
    callback(null, { states: mockStates });
  }
};

export const listCitiesHandler: LocationCatalogServiceServer['listCities'] = async (call: grpc.ServerUnaryCall<StateRequest, any>, callback: grpc.sendUnaryData<any>) => {
  if (USE_MOCK_DATA) {
    callback(null, { cities: mockCities });
    return;
  }

  try {
    const request = {
      url: 'http://api.geonames.org/searchJSON',
      params: {
        country: call.request.countryCode,
        adminName1: call.request.stateName,
        featureClass: 'P',
        maxRows: 1000,
        username: GEONAMES_USERNAME
      }
    };

    console.log("Fetching from:", axios.getUri(request));

    const res = await axios.get(request.url, { params: request.params });

    const cities = res.data.geonames.map((c: any) => ({
      name: c.name,
      lat: c.lat,
      lon: c.lng
    }));

    callback(null, { cities });
  } catch (e) {
    console.error('GeoNames API error, using mock data:', e);
    callback(null, { cities: mockCities });
  }
};