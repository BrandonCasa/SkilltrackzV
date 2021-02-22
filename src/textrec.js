/* eslint-disable no-case-declarations */
const { createCanvas, loadImage } = require('canvas');
const {
  drawArbitraryQuadImage,
  FILL_METHOD,
} = require('canvas-arbitrary-quads');

const cropCanvas = (sourceCanvas, left, top, width, height) => {
  const destCanvas = document.createElement('canvas');
  destCanvas.width = width;
  destCanvas.height = height;
  destCanvas.getContext('2d').drawImage(
    sourceCanvas,
    left,
    top,
    width,
    height, // source rect with content to crop
    0,
    0,
    width,
    height
  ); // newCanvas, same size as source rect
  return destCanvas;
};

export function cropRole(role, canvas, ctx) {
  const sr = 'error';
  switch (role) {
    case 'tank':
      const srcPoints = [
        { x: 8, y: 0 },
        { x: 0, y: 37 },
        { x: 103, y: 37 },
        { x: 103, y: 0 },
      ];

      const dstPoints = [
        { x: 0, y: 0 },
        { x: 0, y: 37 },
        { x: 103, y: 37 },
        { x: 94, y: 0 },
      ];
      console.log('Before:');
      console.log(canvas.toDataURL());
      loadImage(canvas.toDataURL())
        .then((image) => {
          drawArbitraryQuadImage(
            ctx,
            image,
            srcPoints,
            dstPoints,
            FILL_METHOD.BILINEAR
          );
          console.log('After:');
          console.log(canvas.toDataURL());
          return sr;
        })
        .catch((error) => {
          console.error(error);
        });
      break;
    case 'damage':
      break;
    case 'support':
      break;
    default:
      break;
  }
  return sr;
}

export default function recognizeSR() {
  const video = document.getElementById('videoElement');
  let canvas = document.getElementById('canvasElementText');
  let ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas = cropCanvas(canvas, 460, 537, 104, 38);
  ctx = canvas.getContext('2d');

  cropRole('tank', canvas, ctx);
}
