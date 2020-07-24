const { CanvasRenderService } = require('chartjs-node-canvas');
const DataLabels = require('chartjs-plugin-datalabels');

module.exports = function (RED) {
	function chartImageNode(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		this.on('input', (msg, send, done) => {
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
			const canvas = new CanvasRenderService(this.width,this.height,chartCallback);
			if (RED.util.getObjectProperty(msg, 'payload.type') === undefined || RED.util.getObjectProperty(msg, 'payload.data') === undefined) {
				this.errorHandler('msg.payload is not a proper chart.js object', msg);
			} else {
				try {
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
