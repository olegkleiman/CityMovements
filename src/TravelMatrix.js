import moment from 'moment';
import Dexie from 'dexie';

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

const UNKNOWN_TRAVEL_TIME = 150;
const DEFAULT_COLOR = [160, 160, 180, 200];

class TravelMatrix {

  constructor() {
    this.dbName = '';
    this.initialized = false;
    this.matrix = new Map();
  }

  async init(dbName, regionIds) {

        if( await !Dexie.exists(dbName) ) {
          console.log(`${dbName} db does not exists`);
          this.initialized = false;
          return;
        }

        console.log('Trying to read from IndexedDB');

        const db = new Dexie(dbName);
        db.version(1).stores({
          etas: '++id, originId, destinationId, [originId+destinationId], period, day'
        });

        this.initialized = true;
        this.dbName = dbName;

        await Promise.all( regionIds.map( async (regionId) => {

          try {
            const length = await db.etas.where('originId').equals(regionId).count();
            const collection = await db.etas.where('originId').equals(regionId);

            const _etas = [];
            await new Promise( (resolve, reject) => {
              let count = 0;
              collection.each( item => {
                _etas.push(item);
                if( ++count == length )
                  resolve(true);
              });
            })

            this.matrix.set(regionId, _etas);

          } catch( err ) {
            console.error(err);
            Promise.reject(false);
          }

        }));

        db.close();
  }

  getTravelTime(sourceId, targetId) {

    if( !this.initialized ) {
      return UNKNOWN_TRAVEL_TIME;
    }

    const collection = this.matrix.get(parseInt(sourceId, 10));
    const foundDestination = collection.find( item => item.destinationId == parseInt(targetId, 10) );

    return foundDestination ? foundDestination.eta : UNKNOWN_TRAVEL_TIME;
  }

  timeToColor(travelTime) {
    let color = DEFAULT_COLOR;
    for(let i = 0; i < palette.length; i++) {
      if( travelTime <= palette[i].max ) {
        const _color = palette[i].color;
        color = _color;
        break;
      }
    }
    return color;
  }
};

export { TravelMatrix, UNKNOWN_TRAVEL_TIME };
