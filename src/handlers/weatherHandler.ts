import { WeatherServiceServer, Granularity, WeatherVariable, granularityToJSON } from '../../gen/weather';
import axios from 'axios';
import { getCityCoordinates } from '../geonames';

export const getWeatherHandler: WeatherServiceServer['getWeather'] = async (call, callback) => {
  try {
    // Access fields using snake_case names from protobuf
    const countryCode = (call.request as any).country_code;
    const stateName = (call.request as any).state_name;
    const cityName = (call.request as any).city_name;
    const startTime = (call.request as any).start_time;
    const endTime = (call.request as any).end_time;
    const granularity = call.request.granularity;
    const variables = call.request.variables;

    // Add null checks for required fields
    if (!countryCode || !stateName || !cityName || !startTime || !endTime || !granularity || !variables) {
      callback(new Error('Missing required fields'), null);
      return;
    }

    // Check for UNRECOGNIZED values
    if (granularity === Granularity.UNRECOGNIZED) {
      callback(new Error('Invalid granularity value'), null);
      return;
    }

    const { lat, lon } = await getCityCoordinates(countryCode, stateName, cityName);
    const granularityStr = granularityToJSON(granularity);
    const isHourly = granularityStr === 'HOURLY';
    const varNames: Record<string, string> = {
      TEMPERATURE: isHourly ? 'temperature_2m' : 'temperature_2m_max,temperature_2m_min',
      HUMIDITY: isHourly ? 'relativehumidity_2m' : 'relativehumidity_2m_max,relativehumidity_2m_min'
    };

    const variableKeys = variables
      .filter(v => v !== WeatherVariable.UNRECOGNIZED)
      .map(v => {
        switch (v) {
          case WeatherVariable.TEMPERATURE:
            return 'TEMPERATURE';
          case WeatherVariable.HUMIDITY:
            return 'HUMIDITY';
          default:
            return 'TEMPERATURE'; // fallback
        }
      });

    const query = isHourly ? 'hourly' : 'daily';
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
    const result: Array<{ timestamp: string; value: number; variable: string }> = [];

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
    callback(error as any, null);
  }
};