import Dexie from 'dexie';
import matrix from '../dist/assets/etas.json';

console.log('Worker started');

const init = async (dbName) =>  {

      if( await Dexie.exists(dbName) ) {
        console.log(`${dbName} db is already exists`);
        return;
      }

      const db = new Dexie(dbName);
      db.version(1).stores({
          etas: '++id, originId, destinationId, [originId+destinationId], period, day'
      });

      try {

        for(let i = 0; i < matrix.length; i++ ) {

          const row = matrix[i];
          // console.log(`Row: ${JSON.stringify(row)}. Length: ${row.length}`);

          let columns = 0;
          await new Promise( async(resolve, reject) => {

            await Promise.all(row.map( async (subItem) => {

                try {
                  const record = {
                    originId: parseInt(subItem.originId, 10),
                    destinationId: parseInt(subItem.destinationId, 10),
                    eta: subItem.travelTime,
                    day: subItem.day
                  }
                  const _res = await db.etas.put(record);
                  console.log(`record ${JSON.stringify(record)} was put: ${_res}`);
                  columns++;
                  // console.log(`Column: ${columns}. Index: ${_res}`);
                  return _res;
                } catch( err ) {
                  reject(false)
                }
              })
            )

            if( columns == row.length )
              resolve(true)
          });

          // console.log('Row mapped');

        };

        // console.log('Matrix mapped');

      } catch(err) {
        console.error(err);
      }

}

self.addEventListener('message', async function(e) {
  var data = e.data;
  switch (data.cmd) {
    case 'start': {

        const dbName = data.msg;
        init(dbName);
        self.postMessage(`${dbName} db initialized`);

      }
      break;
    case 'stop':
      self.postMessage('WORKER STOPPED: ' + data.msg +
                       '. (buttons will no longer work)');
      self.close(); // Terminates the worker.
      break;
    default:
      self.postMessage('Unknown command: ' + data.msg);
  };
}, false);
