const { desktopCapturer } = require('electron');
const { app } = window.require('electron').remote;
const ImageDataURI = require('image-data-uri');
const fs = require('fs');
const Path = require('path');
const tf = require('@tensorflow/tfjs');
export function initCapture(model, callback) {
  desktopCapturer
    .getSources({ types: ['window', 'screen'] })
    .then(async (sources) => {
      for (const source of sources) {
        console.log(source);
        if (source.name === 'Entire Screen') {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: source.id,
                  minWidth: 1280,
                  maxWidth: 2560,
                  minHeight: 720,
                  maxHeight: 1440,
                  maxFrameRate: 4,
                },
              },
            });
            handleStream(stream, model, callback);
          } catch (e) {
            handleError(e);
          }
          return;
        }
      }
    });
}

function handleStream(stream, model, callback) {
  const video = document.getElementById('videoElement');
  let lastTime = -1;
  const draw = async () => {
    var time = video.currentTime;
    if (time !== lastTime) {
      //console.log('time: ' + time);
      const canvas = document.getElementById('canvasElementAI');
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      let tensor = imageToInput(ctx.getImageData(0, 0, 224, 224), 3);
      tensor = tensor.reshape([-1, 224, 224, 3]);
      const result = await model.predict(tensor);
      const json = JSON.parse(result.toString().slice(13, -2));
      if (json[0] <= 0.5) {
        callback('Something Other Than Play Screen Detected...');
      } else {
        callback('Play Screen Detected!');
      }
      lastTime = time;
    }

    //wait approximately 16ms and run again
    requestAnimationFrame(draw);
  };

  video.srcObject = stream;
  video.onloadedmetadata = (e) => {
    video.play();
    draw();
  };
}

function handleError(e) {
  console.log(e);
}

const imageByteArray = (image, numChannels) => {
  const pixels = image.data;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values;
};

const imageToInput = (image, numChannels) => {
  const values = imageByteArray(image, numChannels);
  const outShape = [image.height, image.width, numChannels];
  const input = tf.tensor3d(values, outShape, 'int32');

  return input;
};

const getMethods = (obj) => {
  let properties = new Set();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).map((item) => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  return [...properties.keys()].filter(
    (item) => typeof obj[item] === 'function'
  );
};

export async function sendCanvasAI(model, callback) {
  const video = document.getElementById('videoElement');
  const canvas = document.getElementById('canvasElementAI');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let tensor = imageToInput(ctx.getImageData(0, 0, 224, 224), 3);
  tensor = tensor.reshape([-1, 224, 224, 3]);
  const result = await model.predict(tensor);
  const json = JSON.parse(result.toString().slice(13, -2));
  if (json[0] <= 0.5) {
    callback('Something Other Than Play Screen Detected...');
  } else {
    callback('Play Screen Detected!');
  }
}
