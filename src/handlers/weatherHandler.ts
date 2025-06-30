import { WeatherServiceServer } from '../../gen/weather';
import axios from 'axios';
import { getCityCoordinates } from '../geonames';

export const getWeatherHandler: WeatherServiceServer['getWeather'] = async (call, callback) => {
  try {
    const { countryCode, stateName, cityName, startTime, endTime, granularity, variables } = call.request;

    const { lat, lon } = await getCityCoordinates(countryCode, stateName, cityName);
    const varNames = {
      TEMPERATURE: granularity === 'HOURLY' ? 'temperature_2m' : 'temperature_2m_max,temperature_2m_min',
      HUMIDITY: granularity === 'HOURLY' ? 'relativehumidity_2m' : 'relativehumidity_2m_max,relativehumidity_2m_min'
    };

    const variableKeys = variables.map(v => WeatherVariable[v]);
    const query = granularity === 'HOURLY' ? 'hourly' : 'daily';
    const variableList = variableKeys.map(k => varNames[k]).join(',');

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lon,
        [query]: variableList,
        start_date: startTime.split('T')[0],
        end_date: endTime.split('T')[0],
        timezone: 'UTC'
      }
    });

    const timeSeries = response.data[query];
    const result = [];

    for (const key of Object.keys(timeSeries)) {
      if (key === 'time') continue;
      timeSeries[key].forEach((val: number, idx: number) => {
        result.push({
          timestamp: timeSeries['time'][idx],
          value: val,
          variable: key
        });
      });
    }

    callback(null, { data: result });
  } catch (error) {
    callback(error, null);
  }
};