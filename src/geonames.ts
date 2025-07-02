import axios from 'axios';

const GEONAMES_USERNAME = 'nishgarg14'; // replace with your actual GeoNames username

export async function getCityCoordinates(countryCode: string, stateName: string, cityName: string) {
  try {
    const request = {
      url: 'http://api.geonames.org/searchJSON',
      params: {
        country: countryCode,
        adminName1: stateName,
        name_equals: cityName,
        featureClass: 'P',
        maxRows: 1,
        username: GEONAMES_USERNAME
      }
    };

    console.log("Fetching from:", axios.getUri(request));

    const res = await axios.get(request.url, { params: request.params });

    if (!res.data.geonames || res.data.geonames.length === 0) {
      throw new Error(`City ${cityName} not found in ${stateName}, ${countryCode}`);
    }

    const city = res.data.geonames[0];
    return {
      lat: city.lat,
      lon: city.lng
    };
  } catch (error) {
    console.error('GeoNames API error:', error);
    // Return mock coordinates for testing
    return {
      lat: 37.7749,
      lon: -122.4194
    };
  }
}