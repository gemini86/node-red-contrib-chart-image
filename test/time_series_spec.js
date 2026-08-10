const helper = require('node-red-node-test-helper');
const { expect } = require('chai');
const chartImageNode = require('../src/chartImageNode.js');

helper.init(require.resolve('node-red'));

describe('chart-image Node - Time Series', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(() => helper.stopServer(done));
    });

    it('should render the time series chart from the help example', function (done) {
        const flow = [
            { id: 'n1', type: 'chart-image', name: 'time series test', width: 400, height: 200, wires: [['n2']] },
            { id: 'n2', type: 'helper' }
        ];

        helper.load(chartImageNode, flow, () => {
            const n1 = helper.getNode('n1');
            const n2 = helper.getNode('n2');

            n1.on('call:error', function (call) {
                done(new Error(call.args[0]));
            });

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
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'My Time Series',
                            data: [
                                { x: '2024-01-01', y: 10 },
                                { x: '2024-01-02', y: 15 },
                                { x: '2024-01-03', y: 12 }
                            ]
                        }]
                    },
                    options: {
                        scales: {
                            x: {
                                type: 'time',
                                time: { unit: 'day' }
                            }
                        }
                    }
                }
            });
        });
    });
});
