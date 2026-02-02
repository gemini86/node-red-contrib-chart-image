const helper = require('node-red-node-test-helper');
const { expect } = require('chai');
const chartImageNode = require('../src/chartImageNode.js');

helper.init(require.resolve('node-red'));

describe('chart-image Node', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(() => helper.stopServer(done));
    });

    it('should generate an image buffer for a basic chart', function (done) {
        const flow = [
            { id: 'n1', type: 'chart-image', name: 'test chart', width: 400, height: 200, wires: [['n2']] },
            { id: 'n2', type: 'helper' }
        ];

        helper.load(chartImageNode, flow, () => {
            const n1 = helper.getNode('n1');
            const n2 = helper.getNode('n2');

            n2.on('input', function (msg) {
                try {
                    expect(Buffer.isBuffer(msg.payload)).to.equal(true);
                    expect(msg.payload.length).to.be.greaterThan(0);
                    done();
                } catch (err) {
                    done(err);
                }
            });

            n1.receive({
                payload: {
                    type: 'bar',
                    data: {
                        labels: ['One', 'Two'],
                        datasets: [{ label: 'Dataset', data: [1, 2] }]
                    },
                    options: {
                        plugins: {
                            datalabels: {
                                display: true
                            }
                        }
                    }
                }
            });
        });
    });

    it('should generate chart with time scale using chartjs-adapter-moment', function (done) {
        const flow = [
            { id: 'n1', type: 'chart-image', name: 'test chart', width: 400, height: 200, wires: [['n2']] },
            { id: 'n2', type: 'helper' }
        ];

        helper.load(chartImageNode, flow, () => {
            const n1 = helper.getNode('n1');
            const n2 = helper.getNode('n2');

            n2.on('input', function (msg) {
                try {
                    expect(Buffer.isBuffer(msg.payload)).to.equal(true);
                    expect(msg.payload.length).to.be.greaterThan(0);
                    done();
                } catch (err) {
                    done(err);
                }
            });

            // Test with a time scale chart that requires chartjs-adapter-moment
            n1.receive({
                payload: {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Time Series Data',
                            data: [
                                { x: '2024-01-01', y: 10 },
                                { x: '2024-01-02', y: 20 },
                                { x: '2024-01-03', y: 15 }
                            ]
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'day'
                                }
                            }
                        }
                    }
                }
            });
        });
    });
});
