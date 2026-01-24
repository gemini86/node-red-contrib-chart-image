'use strict';

const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

module.exports = function (RED) {
  function ChartImageNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const defaultWidth = Number(config.width) > 0 ? Number(config.width) : 800;
    const defaultHeight = Number(config.height) > 0 ? Number(config.height) : 600;
    const defaultMime = (config.mime || 'image/png').toLowerCase();

    function deepCopy(obj) {
      if (typeof structuredClone === 'function') return structuredClone(obj);
      return JSON.parse(JSON.stringify(obj));
    }

    node.on('input', async (msg, send, done) => {
      send = send || function () { node.send.apply(node, arguments); };

      if (!msg || typeof msg.payload !== 'object' || msg.payload === null) {
        node.error('msg.payload must be a Chart.js config object', msg);
        done();
        return;
      }

      const width =
        Number(msg.width) > 0 ? Number(msg.width) :
          Number(msg.payload.width) > 0 ? Number(msg.payload.width) :
            defaultWidth;

      const height =
        Number(msg.height) > 0 ? Number(msg.height) :
          Number(msg.payload.height) > 0 ? Number(msg.payload.height) :
            defaultHeight;

      let chartConfig;
      try {
        chartConfig = deepCopy(msg.payload);
      } catch (err) {
        node.error('Failed to deep-copy chart config', msg);
        done();
        return;
      }

      const mime = (msg.mime || defaultMime).toLowerCase();

      try {
        // New renderer per message, plugins managed by chartjs-node-canvas
        const chartJSNodeCanvas = new ChartJSNodeCanvas({
          width,
          height,
          plugins: {
            modern: ['chartjs-plugin-annotation'],
            requireLegacy: ['chartjs-plugin-datalabels'],
          },
        });

        const buffer = await chartJSNodeCanvas.renderToBuffer(chartConfig, mime);

        msg.payload = buffer;
        msg.width = width;
        msg.height = height;
        msg.mime = mime;

        send(msg);
      } catch (err) {
        node.error(err, msg);
      }

      done();
    });
  }

  RED.nodes.registerType('chart-image', ChartImageNode);
};
