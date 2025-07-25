# node-red-contrib-chart-image

Generate a chart in image form using Chart.js
## Details:
A chart image buffer will be generated using the chart.js definition object found in <code>msg.payload</code>. See the chart.js documentation for more info on defining a chart.

#### Canvas Size:
Setting `msg.width` and/or `msg.height` to the desired size in pixels will override the node configuration.

#### Default Color Pallet:
If no `backgroundColor` or `borderColor` is defined for a dataset, Chartjs assigns the global default color of `rgba(0,0,0,0.1)`. To make life a little easier, this node changes that behavior to assign each dataset a color from preset pallet, which includes 32 colors. If you define your own colors in a dataset, that color will be used, you do have to define both `backgroundColor` and `borderColor` if both are to be displayed. for line charts, use `fill:false` to prevent the use of `backgroundColor`.

#### Plugins:
`chartjs-plugin-datalabels` and `chartjs-plugin-annotation` are included with this node. Starting with Chart.js&nbsp;v3 plugins must be registered with `Chart.register`. This node handles registration automatically when you include plugin options in `options.plugins`.
If you previously used `chartjs-plugin-annotations`, the old `plugins.annotations` array will still work but is migrated to the new `annotation` plugin format internally.
See the [datalabels migration guide](https://chartjs-plugin-datalabels.netlify.app/guide/migration.html) and the [annotation migration guide](https://www.chartjs.org/chartjs-plugin-annotation/latest/guide/migrationV3.html) for details.

Example datalabel configuration:

````javascript
msg.payload = {
    options: {
        plugins: {
            datalabels: { display: true }
        }
    }
}
````

Example annotation configuration:

````javascript
msg.payload = {
    options: {
        plugins: {
            annotation: {
                annotations: [
                    {
                        type: 'line',
                        scaleID: 'y-axis-0',
                        value: 80,
                        borderColor: 'red'
                    }
                ]
            }
        }
    }
}
````

Example line chart:

````javascript
msg.payload = {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
            label: 'Values',
            data: [1, 2, 3]
        }]
    },
    options: {
        plugins: {
            datalabels: { display: true },
            annotation: {
                annotations: [{
                    type: 'line',
                    scaleID: 'y',
                    value: 2,
                    borderColor: 'blue'
                }]
            }
        }
    }
}
````

Legacy `plugins.annotations` arrays will still work. Additional plugins can be supplied via `msg.plugins` and configured in `options.plugins`.

#### Resources
- [Chart.js documentation](https://www.chartjs.org/docs/latest/)
- [charjs-code-canvas documentation](https://www.npmjs.com/package/chartjs-node-canvas)
- [chartjs-plugin-datalabels documentation](https://chartjs-plugin-datalabels.netlify.app/guide/)
- [chartjs-plugin-annotation documentation](https://github.com/chartjs/chartjs-plugin-annotation#readme)
- [datalabels migration guide](https://chartjs-plugin-datalabels.netlify.app/guide/migration.html)
- [annotation migration guide](https://www.chartjs.org/chartjs-plugin-annotation/latest/guide/migrationV3.html)

#### Verify Canvas on Node.js 20
After installing dependencies, run:

```
node test/test-canvas.js
```
to check that the `canvas` library works.

#### Please report bugs, suggest improvements!
https://github.com/gemini86/node-red-contrib-chart-image/issues

#### If you find this node useful,
<a href="https://www.buymeacoffee.com/NxcwUpD" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
