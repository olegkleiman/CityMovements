const center = require('@turf/center').default;
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import regions from '../dist/assets/nebula.json';

const apiKey = 'AIzaSyAZ46YK7LBAW6gqxkgJ1AA6ForQ2mvhWUU';

const regionCenters = regions.features.map( region => (
  {
    center: center(region.geometry),
    id: region.properties.Id
  }
));

const LINES_LENGHT = regionCenters.length

const lines = [];
let linesCount = 0;

for(let i = 0 ;
    i < LINES_LENGHT;
    i++) {
  const originLon = regionCenters[i].center.geometry.coordinates[0];
  const originLat = regionCenters[i].center.geometry.coordinates[1];

  let itemsCount = 0;
  const items = [];

  regionCenters.map( async (regionCenter, index) => {

    const destinationLon = regionCenter.center.geometry.coordinates[0];
    const destinationLat = regionCenter.center.geometry.coordinates[1];

    const res = await new Promise( (resolve, reject) => {

      setTimeout( async() => {
        const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?destination=${destinationLat},${destinationLon}&key=${apiKey}&origin=${originLat},${originLon}&mode=transit`;

        try {
          const res = await fetch(apiUrl);
          const json = await res.json();
          if( json.routes.length ) {
            const point = json.routes[0].legs[0];
            const eta = Math.ceil(point.duration.value/60);
            const item = {
              originId: regionCenters[i].id,
              destinationId: regionCenter.id,
              travelTime: eta
            }
            // console.log(item);
            items.push(item);
          }
        } catch(err) {
          console.error(err);
        }

        if( ++itemsCount >= regionCenters.length ) {
          resolve(true);
        }

      }, 300 * index);


    });

    console.log(items);
    lines.push(items);
    if( ++linesCount >= LINES_LENGHT ) {
      saveLines();
    }

  })

}

function saveLines() {
  console.log(lines);
  var out_path = path.resolve(__dirname, '../dist/assets/etas.json');
  fs.writeFile(out_path, JSON.stringify(lines), (err) => {
    if( err )
      console.error(err);
    else
      console.log(`{out_path} written`);
  })
}
