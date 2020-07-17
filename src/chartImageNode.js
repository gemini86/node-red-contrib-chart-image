const { CanvasRenderService } = require('chartjs-node-canvas');
const dataLabels = require('chartjs-plugin-datalabels');

module.exports = function (RED) {
	function chartImageNode(config) {
		RED.nodes.creatNode(this, config);
		const chartCallback = (ChartJS) => {
			ChartJS.pluginService.register({
		        beforeDraw: function (chart, easing) {
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
		};
		var node = this;
		this.on('input', (msg, send, done) => {
			this.width = msg.width || config.width;
			this.height = msg.height || config.height;
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
			if (msg.payload) {
				try {
					var chart = JSON.parse(msg.payload);
					(async (chartConfig) => {
						const image = await canvas.renderToBuffer(chartConfig);
						msg.payload = image;
						node.send(msg);
					})(msg.payload);
					if (done) {
						done();
					}
				} catch (e) {
					this.errorHandler(e, msg);
			} else {
				if (done) {
					done();
				}
			}
		})
	}
	RED.nodes.registerType('chart-image', chartImageNode);
};
