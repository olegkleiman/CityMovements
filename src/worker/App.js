import Worker from 'worker-loader!./task.js';

const worker = new Worker();

worker.addEventListener("message", function (event) {
  console.log(event.data);
});

worker.postMessage({'cmd': 'start', 'msg': 'Hi'});
worker.onmessage = function (event) {
  console.log('onMessage: ' + JSON.stringify(event));
};
