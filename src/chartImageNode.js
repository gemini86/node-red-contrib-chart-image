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
        // Always include built-in plugins and allow users to add more via msg.plugins
        const modernPlugins = ['chartjs-plugin-annotation'];
        const legacyPlugins = ['chartjs-plugin-datalabels'];

        // Support chart background via chartjs-node-canvas convenience plugin
        // Prefer background color from chart config: msg.payload.options.chartBackgroundColor
        // Default to transparent (no background color passed in to chatjs-node-canvas)
        let backgroundColor;
        try {
          const opt = chartConfig && chartConfig.options;
          if (opt && typeof opt.chartBackgroundColor === 'string' && opt.chartBackgroundColor.length > 0) {
            backgroundColor = opt.chartBackgroundColor;
          } else if (opt.chartBackgroundColour && typeof opt.chartBackgroundColour === 'string' && opt.chartBackgroundColour.length > 0) {
            backgroundColor = opt.chartBackgroundColour;
          }
        } catch (_) {
          node.warn('Error reading chart background color from config, using defaults');
        }
        try {
          if (chartConfig?.options?.plugins?.datalabels === undefined) {
            // Disable datalabels plugin by default if not explicitly disabled
            RED.util.setObjectProperty(chartConfig, 'options.plugins.datalabels.display', false, true);
          }
        } catch (e) {
          node.warn('Error setting default datalabels plugin display option');
          node.log(e);          
        }
        if (msg.plugins && typeof msg.plugins === 'object') {
          try {
            const values = Array.isArray(msg.plugins)
              ? msg.plugins
              : Object.values(msg.plugins);
            for (const p of values) {
              if (!p) continue;
              // chartjs-node-canvas supports either module names (string) or plugin objects
              if (typeof p === 'string' || typeof p === 'object' || typeof p === 'function') {
                modernPlugins.push(p);
              }
            }
          } catch (e) {
            // If msg.plugins is malformed, ignore and continue with built-ins
            node.warn('msg.plugins is malformed, ignoring additional plugins');
          }
        }

        const chartJSNodeCanvas = new ChartJSNodeCanvas({
          width,
          height,
          backgroundColour: backgroundColor ?? 'transparent',
          plugins: {
            modern: modernPlugins,
            requireLegacy: legacyPlugins,
          }
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
