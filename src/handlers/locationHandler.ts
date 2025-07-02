import { LocationCatalogServiceServer, Empty, CountryRequest, StateRequest } from '../../gen/weather';
import axios from 'axios';
import * as grpc from '@grpc/grpc-js';

const GEONAMES_USERNAME = 'nishgarg14'; // replace this

export const listCountriesHandler: LocationCatalogServiceServer['listCountries'] = async (_: grpc.ServerUnaryCall<Empty, any>, callback: grpc.sendUnaryData<any>) => {
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
    console.error('GeoNames API error:', e);
    callback(e as any, null);
  }
};

export const listStatesHandler: LocationCatalogServiceServer['listStates'] = async (call: grpc.ServerUnaryCall<CountryRequest, any>, callback: grpc.sendUnaryData<any>) => {
  try {
    
    const request = {
      url: 'http://api.geonames.org/searchJSON',
      params: {
        country: call.request.country_code,
        featureCode: 'ADM1',
        maxRows: 1000,
        username: GEONAMES_USERNAME
      }
    };

    console.log("Fetching from:", axios.getUri(request));

    const res = await axios.get(request.url, { params: request.params });

    const states = res.data.geonames.map((s: any) => ({ name: s.name, code: s.adminCode1 }));
    callback(null, { states });
  } catch (e) {
    console.error('GeoNames API error:', e);
    callback(e as any, null);
  }
};

export const listCitiesHandler: LocationCatalogServiceServer['listCities'] = async (call: grpc.ServerUnaryCall<StateRequest, any>, callback: grpc.sendUnaryData<any>) => {
  try {
    
    const request = {
      url: 'http://api.geonames.org/searchJSON',
      params: {
        country: call.request.country_code,
        adminCode1: call.request.state_name,
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
    console.error('GeoNames API error:', e);
    callback(e as any, null);
  }
};