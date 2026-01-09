const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const DataLabels = require('chartjs-plugin-datalabels');
const Annotation = require('chartjs-plugin-annotation');

const width = 400;
const height = 200;

const chartCallback = (ChartJS) => {
    const chartAreaBackground = {
        id: 'chartAreaBackground',
        beforeDraw(chart) {
            if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                const ctx = chart.ctx;
                const chartArea = chart.chartArea;
                ctx.save();
                ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
                ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                ctx.restore();
            }
        }
    };

    ChartJS.register(chartAreaBackground, Annotation);
};

const canvasOptions = {
    'width': width,
    'height': height,
    'chartCallback': chartCallback,
};

const canvas = new ChartJSNodeCanvas(canvasOptions);

const configuration = {
    type: 'bar',
    data: {
        labels: ['One', 'Two'],
        datasets: [{ label: 'Dataset', data: [1, 2] }]
    },
    options: {
        plugins: {
            annotation: {
                annotations: {
                    line1: {
                        type: 'line',
                        yMin: 1.5,
                        yMax: 1.5,
                        borderColor: 'red',
                        borderWidth: 2,
                        scaleID: 'y'
                    }
                }
            }
        }
    }
};

(async () => {
    try {
        const buffer = await canvas.renderToBuffer(configuration);
        console.log('SUCCESS: Generated buffer of length:', buffer.length);
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
})();
