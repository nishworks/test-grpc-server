import { LocationCatalogServiceServer } from '../../gen/weather';
import axios from 'axios';

const GEONAMES_USERNAME = 'nishgarg14'; // replace this

export const listCountriesHandler: LocationCatalogServiceServer['ListCountries'] = async (_, callback) => {
  try {
    const res = await axios.get('http://api.geonames.org/countryInfoJSON', {
      params: { username: GEONAMES_USERNAME }
    });

    const countries = res.data.geonames.map((c: any) => ({
      code: c.countryCode,
      name: c.countryName
    }));

    callback(null, { countries });
  } catch (e) {
    callback(e, null);
  }
};

export const listStatesHandler: LocationCatalogServiceServer['ListStates'] = async (call, callback) => {
  try {
    const res = await axios.get('http://api.geonames.org/searchJSON', {
      params: {
        country: call.request.country_code,
        featureCode: 'ADM1',
        maxRows: 1000,
        username: GEONAMES_USERNAME
      }
    });

    const states = res.data.geonames.map((s: any) => ({ name: s.name }));
    callback(null, { states });
  } catch (e) {
    callback(e, null);
  }
};

export const listCitiesHandler: LocationCatalogServiceServer['ListCities'] = async (call, callback) => {
  try {
    const res = await axios.get('http://api.geonames.org/searchJSON', {
      params: {
        country: call.request.country_code,
        adminName1: call.request.state_name,
        featureClass: 'P',
        maxRows: 1000,
        username: GEONAMES_USERNAME
      }
    });

    const cities = res.data.geonames.map((c: any) => ({
      name: c.name,
      lat: c.lat,
      lon: c.lng
    }));

    callback(null, { cities });
  } catch (e) {
    callback(e, null);
  }
};