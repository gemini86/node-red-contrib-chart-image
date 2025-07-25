const { createCanvas } = require('canvas');

try {
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(10, 10, 80, 80);
  console.log('Canvas loaded and rendered successfully');
} catch (err) {
  console.error('Canvas failed:', err);
  process.exit(1);
}
