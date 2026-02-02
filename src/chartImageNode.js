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

      // Determine debug mode: config.debug (node config), msg.debug (overrides config)
      const debug = Boolean(node.debug);

      if (!msg || typeof msg.payload !== 'object' || msg.payload === null) {
        node.error('msg.payload must be a Chart.js config object', msg);
        done();
        return;
      }

      let width, height;
      if (Number(msg.width) > 0) {
        width = Number(msg.width);
        if (debug) node.warn('[chart-image] Using msg.width: ' + width);
      } else {
        width = defaultWidth;
        if (debug) node.warn('[chart-image] Using width from config: ' + width);
      }

      if (Number(msg.height) > 0) {
        height = Number(msg.height);
        if (debug) node.warn('[chart-image] Using msg.height: ' + height);
      } else {
        height = defaultHeight;
        if (debug) node.warn('[chart-image] Using height from config: ' + height);
      }
      // Check for incompatible or missing options
      if (debug) {
        if (!chartConfig.type) {
          node.warn('[chart-image] Chart type is missing in config. This may cause Chart.js to fail.');
        }
        if (!chartConfig.data) {
          node.warn('[chart-image] Chart data is missing in config. This may cause Chart.js to fail.');
        }
        if (chartConfig.options && chartConfig.options.responsive === true) {
          node.warn('[chart-image] options.responsive=true is not supported in image rendering. The canvas size is fixed.');
        }
        if (chartConfig.options && chartConfig.options.animation === true) {
          node.warn('[chart-image] options.animation=true is not supported in image rendering. Animations are disabled.');
        }
      }

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
        const modernPlugins = ['chartjs-plugin-annotation', 'chartjs-adapter-moment'];
        const legacyPlugins = ['chartjs-plugin-datalabels'];

        // Support chart background via chartjs-node-canvas convenience plugin
        // Prefer background color from chart config: msg.payload.options.chartBackgroundColor
        // Default to transparent (no background color passed in to chartjs-node-canvas)
        let backgroundColor;
        try {
          const opt = chartConfig && chartConfig.options;
          if (opt && typeof opt.chartBackgroundColor === 'string' && opt.chartBackgroundColor.length > 0) {
            backgroundColor = opt.chartBackgroundColor;
            if (debug) node.warn('[chart-image] Using chartBackgroundColor: ' + backgroundColor);
          } else if (opt.chartBackgroundColour && typeof opt.chartBackgroundColour === 'string' && opt.chartBackgroundColour.length > 0) {
            backgroundColor = opt.chartBackgroundColour;
            if (debug) node.warn('[chart-image] Using chartBackgroundColour: ' + backgroundColor);
          } else if (debug) {
            node.warn('[chart-image] No chart background color specified, using transparent.');
          }
        } catch (_) {
          if (debug) node.warn('[chart-image] Error reading chart background color from config, using defaults');
        }
        try {
          if (chartConfig?.options?.plugins?.datalabels === undefined) {
            // Disable datalabels plugin by default if not explicitly disabled
            RED.util.setObjectProperty(chartConfig, 'options.plugins.datalabels.display', false, true);
            if (debug) node.warn('[chart-image] Datalabels plugin not specified, disabling by default.');
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
                if (debug) node.warn('[chart-image] Added custom plugin: ' + (typeof p === 'string' ? p : '[object]'));
              }
            }
          } catch (e) {
            // If msg.plugins is malformed, ignore and continue with built-ins
            node.warn('msg.plugins is malformed, ignoring additional plugins');
          }
        }

        if (debug) {
          node.warn('[chart-image] Rendering chart with width: ' + width + ', height: ' + height + ', mime: ' + mime);
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

        if (debug) node.warn('[chart-image] Chart image buffer generated successfully.');

        send(msg);
      } catch (err) {
        node.error(err, msg);
      }

      done();
    });
  }

  RED.nodes.registerType('chart-image', ChartImageNode);
};
