const { CanvasRenderService } = require('chartjs-node-canvas');
const DataLabels = require('chartjs-plugin-datalabels');
const Annotation = require('chartjs-plugin-annotation'); //eslint-disable-line no-unused-vars
const pallet = [
	'rgba(51,102,204,1)', 'rgba(220,57,18,1)', 'rgba(255,153,0,1)', 'rgba(16,150,24,1)', 'rgba(153,0,153,1)',
	'rgba(0,153,198,1)', 'rgba(221,68,119,1)', 'rgba(102,170,0,1)', 'rgba(184,46,46,1)', 'rgba(49,99,149,1)',
	'rgba(51,102,204,1)', 'rgba(153,68,153,1)', 'rgba(34,170,153,1)', 'rgba(170,170,17,1)', 'rgba(102,51,204,1)',
	'rgba(230,115,0,1)', 'rgba(139,7,7,1)', 'rgba(101,16,103,1)', 'rgba(50,146,98,1)', 'rgba(85,116,166,1)',
	'rgba(59,62,172,1)', 'rgba(183,115,34,1)', 'rgba(22,214,32,1)', 'rgba(185,19,131,1)', 'rgba(244,53,158,1)',
	'rgba(156,89,53,1)', 'rgba(169,196,19,1)', 'rgba(42,119,141,1)', 'rgba(102,141,28,1)', 'rgba(190,164,19,1)',
	'rgba(12,89,34,1)', 'rgba(116,52,17,1)'
];

function toOpacity(color,aValue) {
	if (color && aValue) {
		if (typeof aValue !== 'string' && typeof aValue !== 'number'){
			aValue = 1;
		}
		if (typeof color === 'string') {
			let vals = color.split('(')[1].split(')')[0];
			vals = vals.split(',');
			vals.pop();
			vals.push(aValue.toString());
			return `rgba(${vals.join(',')})`;
		}
		return color;
	} else return '#caca69';
}

module.exports = function (RED) {
	function chartImageNode(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		this.on('input', (msg, send, done) => {
			if (msg.width) {
				this.width = Number(msg.width);
			} else {
				this.width = Number(config.width);
			}
			if (msg.height) {
				this.height = Number(msg.height);
			} else {
				this.height = Number(config.height);
			}
			send = send || function () {
				node.send.apply(node, arguments);
			};
			this.errorHandler = (e, msg) => {
				if (done) {
					done(e);
				} else {
					node.error(e, msg);
				}
			};
			const chartCallback = (ChartJS) => {
				ChartJS.pluginService.register({
					beforeDraw: function (chart) {
						if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
							var ctx = chart.chart.ctx;
							var chartArea = chart.chartArea;
							ctx.save();
							ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
							ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
							ctx.restore();
						}
					}
				});
				if (msg.plugins) {
					let pluginsToAdd = Object.getOwnPropertyNames(msg.plugins);
					pluginsToAdd.forEach(plugin => {
						node.log(plugin + ' has been registered to chart plugins');
						ChartJS.plugins.register(msg.plugins[plugin]);
					});
				}
				var displayDataLabels;
				try {
					displayDataLabels = RED.util.getObjectProperty(msg, 'payload.options.plugins.datalabels.display');
				} catch (e){
					node.log('datalabels plugin not defined correctly or not included. Plugin not registered on this chart.');
					displayDataLabels = false;
				}
				if (displayDataLabels) {
					ChartJS.plugins.register(DataLabels);
				} else ChartJS.plugins.unregister(DataLabels);
			};
			const canvas = new CanvasRenderService(this.width,this.height,chartCallback);
			if (RED.util.getObjectProperty(msg, 'payload.type') === undefined || RED.util.getObjectProperty(msg, 'payload.data') === undefined) {
				this.errorHandler('msg.payload is not a proper chart.js object', msg);
			} else {
				try {
					if (msg.payload.data.datasets[0]) {
						msg.payload.data.datasets.forEach((e,i) => {
							if (!('backgroundColor' in e)) {
								e.backgroundColor = toOpacity(pallet[i],0.9);
							}
							if (!('borderColor' in e)) {
								e.borderColor = pallet[i];
							}
						});
					}
					var chart = msg.payload;
					(async (chartConfig) => {
						const image = await canvas.renderToBuffer(chartConfig);
						msg.payload = image;
						send(msg);
					})(chart);
					if (done) {
						done();
					}
				} catch (e) {
					this.errorHandler(e, msg);
				}
			}
			if (done) {
				done();
			}
		});
	}
	RED.nodes.registerType('chart-image', chartImageNode);
};
