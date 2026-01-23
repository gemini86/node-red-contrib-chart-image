const {
    ChartJSNodeCanvas
} = require('chartjs-node-canvas');

const DataLabelsMod = require('chartjs-plugin-datalabels');
const DataLabels = DataLabelsMod?.default  ?? DataLabelsMod;

    const AnnotationMod = require('chartjs-plugin-annotation');
    const Annotation = AnnotationMod?.default  ?? AnnotationMod;

        const pallet = [
            'rgba(51,102,204,1)', 'rgba(220,57,18,1)', 'rgba(255,153,0,1)', 'rgba(16,150,24,1)', 'rgba(153,0,153,1)',
            'rgba(0,153,198,1)', 'rgba(221,68,119,1)', 'rgba(102,170,0,1)', 'rgba(184,46,46,1)', 'rgba(49,99,149,1)',
            'rgba(51,102,204,1)', 'rgba(153,68,153,1)', 'rgba(34,170,153,1)', 'rgba(170,170,17,1)', 'rgba(102,51,204,1)',
            'rgba(230,115,0,1)', 'rgba(139,7,7,1)', 'rgba(101,16,103,1)', 'rgba(50,146,98,1)', 'rgba(85,116,166,1)',
            'rgba(59,62,172,1)', 'rgba(183,115,34,1)', 'rgba(22,214,32,1)', 'rgba(185,19,131,1)', 'rgba(244,53,158,1)',
            'rgba(156,89,53,1)', 'rgba(169,196,19,1)', 'rgba(42,119,141,1)', 'rgba(102,141,28,1)', 'rgba(190,164,19,1)',
            'rgba(12,89,34,1)', 'rgba(116,52,17,1)'
        ];

        function toOpacity(color, aValue) {
            if (color && aValue !== undefined && aValue !== null) {
                if (typeof aValue !== 'string' && typeof aValue !== 'number')
                    aValue = 1;
                if (typeof color === 'string') {
                    let vals = color.split('(')[1].split(')')[0];
                    vals = vals.split(',');
                    vals.pop();
                    vals.push(String(aValue));
                    return `rgba(${vals.join(',')})`;
                }
                return color;
            }
            return '#caca69';
        }

        function deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        function isPlainObject(v) {
            return !!v && typeof v === 'object' && !Array.isArray(v);
        }

        function pickExport(mod) {
            return mod?.default  ?? mod;
        }

        module.exports = function (RED) {
            function chartImageNode(config) {
                RED.nodes.createNode(this, config);
                const node = this;

                node._canvas = null;
                node._ChartJS = null;
                node._w = null;
                node._h = null;

                // user plugin tracking (only user plugins get unregistered)
                node._registeredUserPlugins = new Map(); // name -> pluginObj
                node._registeredUserPluginObjs = new Set(); // pluginObj set

                // Built-ins that can appear in options.plugins without msg.plugins
                const BUILTIN_PLUGIN_NAMES = new Set([
                            'annotation', // we register this as core
                            'datalabels', // we register this as core
                            'legend', // built into Chart.js
                            'title', // built into Chart.js
                            'tooltip' // built into Chart.js
                        ]);

                const chartAreaBackground = {
                    id: 'chartAreaBackground',
                    beforeDraw(chart) {
                        const bg = chart?.config?.options?.chartArea?.backgroundColor;
                        if (!bg)
                            return;
                        const ctx = chart.ctx;
                        const area = chart.chartArea;
                        ctx.save();
                        ctx.fillStyle = bg;
                        ctx.fillRect(area.left, area.top, area.right - area.left, area.bottom - area.top);
                        ctx.restore();
                    }
                };

                function registerCorePlugins(ChartJS) {
                    // Always attempt registration; ignore duplicates safely
                    const safeRegister = (p) => {
                        try {
                            ChartJS.register(p);
                        } catch (_) {}
                    };

                    safeRegister(chartAreaBackground);
                    safeRegister(Annotation);
                    safeRegister(DataLabels);
                }

                function unregisterAllUserPlugins() {
                    const ChartJS = node._ChartJS;
                    if (!ChartJS) {
                        node._registeredUserPlugins.clear();
                        node._registeredUserPluginObjs.clear();
                        return;
                    }

                    for (const pluginObj of node._registeredUserPluginObjs) {
                        try {
                            ChartJS.unregister(pluginObj);
                        } catch (_) {}
                    }
                    node._registeredUserPlugins.clear();
                    node._registeredUserPluginObjs.clear();
                }

                function ensureCanvas(width, height) {
                    const w = Number(width);
                    const h = Number(height);
                    const sizeChanged = (node._canvas === null) || (node._w !== w) || (node._h !== h);

                    if (!sizeChanged)
                        return;

                    // Rebuild canvas on size change; also clear user plugins
                    unregisterAllUserPlugins();

                    node._w = w;
                    node._h = h;

                    node._canvas = new ChartJSNodeCanvas({
                        width: w,
                        height: h,
                        chartCallback: (ChartJS) => {
                            node._ChartJS = ChartJS;
                            registerCorePlugins(ChartJS);
                        }
                    });
                }

                function resolveUserPluginsFromMsg(msg) {
                    const resolved = new Map();

                    if (msg.plugins === undefined || msg.plugins === null)
                        return resolved;
                    if (!isPlainObject(msg.plugins)) {
                        this.errorHandler('msg.plugins must be { pluginName: pluginObject | "installed-module-name" }');
                    }

                    for (const [name, val] of Object.entries(msg.plugins)) {
                        if (typeof val === 'string') {
                            let mod;
                            try {
                                mod = require(val);
                            } catch (e) {
                                this.errorHandler(`Failed to require("${val}") for msg.plugins.${name}: ${e?.message ?? e}`);
                            }
                            const pluginObj = pickExport(mod);
                            if (!pluginObj)
                                this.errorHandler(`msg.plugins.${name} from "${val}" resolved to empty export`);
                            resolved.set(name, pluginObj);
                        } else if (typeof val === 'function' || isPlainObject(val)) {
                            resolved.set(name, val);
                        } else {
                            this.errorHandler(`msg.plugins.${name} must be a plugin object/function or module-name string`);
                        }
                    }

                    return resolved;
                }

                function normalizeChartConfig(msg) {
                    const chart = deepClone(msg.payload);

                    chart.options ??= {};
                    chart.options.plugins ??= {};

                    // datalabel behavior
                    if (chart.options.plugins.datalabels) {
                        if (chart.options.plugins.datalabels.display === undefined) {
                            chart.options.plugins.datalabels.display = true;
                        }
                    } else {
                        chart.options.plugins.datalabels = {
                            display: false
                        };
                    }

                    // palette defaults
                    const datasets = chart?.data?.datasets;
                    if (Array.isArray(datasets)) {
                        datasets.forEach((ds, i) => {
                            if (ds && typeof ds === 'object') {
                                if (!('backgroundColor' in ds))
                                    ds.backgroundColor = toOpacity(pallet[i % pallet.length], 0.9);
                                if (!('borderColor' in ds))
                                    ds.borderColor = pallet[i % pallet.length];
                            }
                        });
                    }

                    return chart;
                }

                function validateChartPluginRefs(chart, desiredUserPlugins) {
                    const plugins = chart?.options?.plugins;
                    if (!isPlainObject(plugins))
                        return;

                    for (const name of Object.keys(plugins)) {
                        if (BUILTIN_PLUGIN_NAMES.has(name))
                            continue;

                        if (!desiredUserPlugins.has(name)) {
                            throw new Error(`Chart references options.plugins.${name}, but "${name}" is not present in msg.plugins for this message. Provide msg.plugins.${name} (plugin object/function or installed module string), or remove options.plugins.${name}.`);
                        }
                    }
                }

                function syncUserPlugins(desired) {
                    const ChartJS = node._ChartJS;
                    if (!ChartJS)
                        return;

                    // unregister no-longer-desired
                    for (const [name, pluginObj] of node._registeredUserPlugins.entries()) {
                        if (!desired.has(name)) {
                            try {
                                ChartJS.unregister(pluginObj);
                            } catch (_) {}
                            node._registeredUserPlugins.delete(name);
                            node._registeredUserPluginObjs.delete(pluginObj);
                            node.log(`Unregistered user plugin: ${name}`);
                        }
                    }

                    // register newly desired
                    for (const [name, pluginObj] of desired.entries()) {
                        if (node._registeredUserPlugins.has(name))
                            continue;

                        try {
                            ChartJS.register(pluginObj);
                            node._registeredUserPlugins.set(name, pluginObj);
                            node._registeredUserPluginObjs.add(pluginObj);
                            node.log(`Registered user plugin: ${name}`);
                        } catch (e) {
                            this.errorHandler(`Failed to register user plugin "${name}": ${e?.message ?? e}`);
                        }
                    }
                }

                node.on('input', async(msg, send, done) => {
                    send = send || function () {
                        node.send.apply(node, arguments);
                    };

                    this.errorHandler = (e, msg = null) => {
                        if (done) {
                            done(e);
                        } else {
                            node.error(e, msg);
                        }
                    };

                    try {
                        if (RED.util.getObjectProperty(msg, 'payload.type') === undefined ||
                            RED.util.getObjectProperty(msg, 'payload.data') === undefined) {
                            this.errorHandler('msg.payload is not a proper chart.js object');
                        }

                        const width = (msg.width !== undefined) ? Number(msg.width) : Number(config.width);
                        const height = (msg.height !== undefined) ? Number(msg.height) : Number(config.height);

                        ensureCanvas(width, height);

                        const desiredUserPlugins = resolveUserPluginsFromMsg(msg);

                        const chart = normalizeChartConfig(msg);
                        validateChartPluginRefs(chart, desiredUserPlugins);
                        

                        // Make registry match this message's user plugins
                        syncUserPlugins(desiredUserPlugins);

                        const image = await node._canvas.renderToBuffer(chart);

                        msg.payload = image;
                        send(msg);
                        done && done();
                    } catch (e) {
                        this.errorHandler(e, msg);
                        done && done(e);
                    }
                });

                // Signature-safe close handler (won’t crash on different Node-RED versions)
                node.on('close', function () {
                    const args = Array.from(arguments);
                    const done = typeof args[args.length - 1] === 'function' ? args[args.length - 1] : null;

                    try {
                        unregisterAllUserPlugins();
                        node._canvas = null;
                        node._ChartJS = null;
                    } catch (e) {
                        node.error(e);
                    } finally {
                        if (done)
                            done();
                    }
                });
            }

            RED.nodes.registerType('chart-image', chartImageNode);
        };
