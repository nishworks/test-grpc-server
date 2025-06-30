import axios from 'axios';

const GEONAMES_USERNAME = 'your_username'; // replace with your actual GeoNames username

export async function getCityCoordinates(countryCode: string, stateName: string, cityName: string) {
  const res = await axios.get('http://api.geonames.org/searchJSON', {
    params: {
      country: countryCode,
      adminName1: stateName,
      name_equals: cityName,
      featureClass: 'P',
      maxRows: 1,
      username: GEONAMES_USERNAME
    }
  });

  const city = res.data.geonames[0];
  return {
    lat: city.lat,
    lon: city.lng
  };
}