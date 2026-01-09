const helper = require('node-red-node-test-helper');
const { expect } = require('chai');
const chartImageNode = require('../src/chartImageNode.js');

helper.init(require.resolve('node-red'));

describe('chart-image Node - Annotations Only', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(() => helper.stopServer(done));
    });

    it('should generate an image buffer for a chart with annotations', function (done) {
        this.timeout(10000);
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
                        labels: ['One', 'Two', 'Three'],
                        datasets: [{ label: 'Dataset', data: [1, 2, 3] }]
                    },
                    options: {
                        plugins: {
                            annotation: {
                                annotations: {
                                    line1: {
                                        type: 'line',
                                        yMin: 2,
                                        yMax: 2,
                                        borderColor: 'red',
                                        borderWidth: 2,
                                        scaleID: 'y'
                                    }
                                }
                            }
                        }
                    }
                }
            });
        });
    });
});
