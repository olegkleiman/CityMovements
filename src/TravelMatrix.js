import moment from 'moment';
import times from '../dist/assets/times.json';

const palette =
[
  { min: 0, max: 5, color: [255, 255, 217, 200]},
  { min: 5, max:10, color: [202, 234, 180, 200]},
  { min: 10, max: 15, color: [143, 211, 186, 200]},
  { min: 15, max: 20, color: [80, 186, 195, 200]},
  { min: 20, max: 25, color: [43, 156, 193, 200]},
  { min: 25, max: 30, color: [34, 126, 183, 200]},
  { min: 30, max: 35, color: [34, 96, 169, 200]},
  { min: 35, max: 40, color: [26, 70, 138, 200]},
  { min: 40, max: 50, color: [17, 46, 109, 200]},
  { min: 50, max: 60, color: [5, 25, 77, 200]}
];

const TravelMatrix = {

  getTravelTime(sourceId, targetId) {

    const item = times[sourceId];
    const foundDestination = item.find( destination => {
      return destination.id == targetId
    })

    return foundDestination ? foundDestination.travelTime : 150;
  },

  timeToColor(travelTime) {
    let color = [160, 160, 180, 200];
    for(let i = 0; i < palette.length; i++) {
      if( travelTime <= palette[i].max ) {
        const _color = palette[i].color;
        color = _color;
        break;
      }
    }

    // console.log(color);
    return color;
  }
};

export default TravelMatrix;
