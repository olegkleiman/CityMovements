import casual from 'casual';
import fs from 'fs';

const timeTravelData = [];


for(let i = 1; i <= 31; i++) {

  const row = [];

  for(let j = 1; j < 31; j++) {
    const item = {
      id: j,
      travelTime: casual.integer(0, 60 * 40) // 40 min
    };
    row.push(item)
  }

  timeTravelData.push(row);
}

fs.writeFile('times.json', JSON.stringify(timeTravelData), err => {
  if( err )
    console.error(err);
  else
    console.table(timeTravelData);
});
