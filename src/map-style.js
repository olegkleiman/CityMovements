import {fromJS} from 'immutable';
import MAP_STYLE from './map-style-basic-v8.json';

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer = fromJS({
  id: 'data',
  source: 'population',
  type: 'fill',
  interactive: true,
  paint: {
    'fill-color': {
      property: 'actual_value',
      stops: [
        [0, '#e0dbdc'],
        [1, '#b2aeaf'],
        [2, '#918e8f'],
        [3, '#6d6b6c'],
        [4, '#4c4a4b']
      ]
    },
    'fill-opacity': 0.8
  }
});

export const defaultMapStyle = fromJS(MAP_STYLE);
