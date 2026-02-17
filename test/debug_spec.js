const helper = require('node-red-node-test-helper');
const { expect } = require('chai');
const chartImageNode = require('../src/chartImageNode.js');

helper.init(require.resolve('node-red'));

describe('chart-image Node - Debug Option', function () {
    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function (done) {
        helper.unload().then(() => helper.stopServer(done));
    });

    it('should emit node.warn() messages when debug is enabled in config', function (done) {
        const flow = [
            { id: 'n1', type: 'chart-image', name: 'debug test', width: 400, height: 200, debug: true, wires: [['n2']] },
            { id: 'n2', type: 'helper' }
        ];

        helper.load(chartImageNode, flow, () => {
            const n1 = helper.getNode('n1');
            const n2 = helper.getNode('n2');
            let warnCalled = false;
            // Patch node.warn to detect debug output
            const origWarn = n1.warn;
            n1.warn = function(msg) {
                warnCalled = true;
                origWarn.call(n1, msg);
            };

            n2.on('input', function (msg) {
                try {
                    expect(Buffer.isBuffer(msg.payload)).to.equal(true);
                    expect(warnCalled).to.equal(true);
                    done();
                } catch (err) {
                    done(err);
                }
            });

            n1.receive({
                payload: {
                    type: 'bar',
                    data: {
                        labels: ['A', 'B'],
                        datasets: [{ label: 'Test', data: [1, 2] }]
                    },
                    options: {}
                }
            });
        });
    });

    it('should NOT emit node.warn() messages when debug is disabled in config', function (done) {
        const flow = [
            { id: 'n1', type: 'chart-image', name: 'debug test', width: 400, height: 200, debug: false, wires: [['n2']] },
            { id: 'n2', type: 'helper' }
        ];

        helper.load(chartImageNode, flow, () => {
            const n1 = helper.getNode('n1');
            const n2 = helper.getNode('n2');
            let warnCalled = false;
            // Patch node.warn to detect debug output
            const origWarn = n1.warn;
            n1.warn = function(msg) {
                warnCalled = true;
                origWarn.call(n1, msg);
            };

            n2.on('input', function (msg) {
                try {
                    expect(Buffer.isBuffer(msg.payload)).to.equal(true);
                    expect(warnCalled).to.equal(false);
                    done();
                } catch (err) {
                    done(err);
                }
            });

            n1.receive({
                payload: {
                    type: 'bar',
                    data: {
                        labels: ['A', 'B'],
                        datasets: [{ label: 'Test', data: [1, 2] }]
                    },
                    options: {}
                }
            });
        });
    });
});
