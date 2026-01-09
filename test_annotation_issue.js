const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const DataLabels = require('chartjs-plugin-datalabels');
const Annotation = require('chartjs-plugin-annotation');

const width = 800;
const height = 600;

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
    // Register datalabels since display is true in the config
    ChartJS.register(DataLabels);
};

const canvasOptions = {
    'width': width,
    'height': height,
    'chartCallback': chartCallback,
};

const canvas = new ChartJSNodeCanvas(canvasOptions);

// The exact configuration from the issue
const configuration = {
    "data": {
        "datasets": [
            {
                "borderColor": "#8f3bb8",
                "borderWidth": 4,
                "data": [
                    21.56925,
                    23.6475,
                    23.94525,
                    23.787,
                    23.00125,
                    21.622,
                    21.1915,
                    20.48875,
                    20.8395,
                    20.4495,
                    20.1965,
                    20.17525,
                    20.3035,
                    20.66675
                ],
                "datalabels": {
                    "display": false
                },
                "fill": false,
                "pointBackgroundColor": "#8f3bb8",
                "pointRadius": 2,
                "tension": 0.4,
                "type": "line"
            },
            {
                "backgroundColor": "yellow",
                "barPercentage": 0.5,
                "borderColor": "yellow",
                "borderWidth": 2,
                "data": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
                ],
                "datalabels": {
                    "display": false
                },
                "type": "bar"
            },
            {
                "backgroundColor": "#ff9830",
                "barPercentage": 2,
                "borderColor": "#ff9830",
                "borderWidth": 2,
                "data": [
                ],
                "type": "bar"
            }
        ],
        "labels": [
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            0,
            1,
            2,
            3,
            4,
            5
        ]
    },
    "options": {
        "plugins": {
            "annotation": {
                "annotations": {
                    "annotation0": {
                        "borderColor": "green",
                        "borderWidth": 2,
                        "scaleID": "y",
                        "type": "line",
                        "value": 10
                    },
                    "annotation1": {
                        "borderColor": "yellow",
                        "borderWidth": 2,
                        "scaleID": "y",
                        "type": "line",
                        "value": 20
                    },
                    "annotation2": {
                        "borderColor": "orange",
                        "borderWidth": 2,
                        "scaleID": "y",
                        "type": "line",
                        "value": 30
                    },
                    "annotation3": {
                        "borderColor": "red",
                        "borderWidth": 2,
                        "scaleID": "y",
                        "type": "line",
                        "value": 17.3913043478261
                    }
                }
            },
            "datalabels": {
                "align": "end",
                "anchor": "center",
                "color": "black",
                "display": true,
                "font": {
                    "size": 24,
                    "weight": "normal"
                },
                "offset": -35
            },
            "legend": {
                "display": false
            }
        },
        "responsive": false,
        "scales": {
            "x": {
                "ticks": {
                    "color": "#E0E0E0",
                    "font": {
                        "size": 35
                    }
                }
            },
            "y": {
                "beginAtZero": true,
                "max": 35,
                "ticks": {
                    "display": false,
                    "font": {
                        "size": 20
                    }
                }
            }
        }
    },
    "type": "bar"
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
