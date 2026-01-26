# node-red-contrib-chart-image

Generate a chart in image form using Chart.js
## Details
A chart image buffer will be generated using the chart.js definition object found in <code>msg.payload</code>. See the chart.js documentation for more info on defining a chart.

#### Canvas Size
Setting `msg.width` and/or `msg.height` to the desired size in pixels will override the node configuration.

#### Default Color Palette
If no `backgroundColor` or `borderColor` is defined for a dataset, Chart.js assigns the global default color of `rgba(0,0,0,0.1)`. To make life a little easier, this node changes that behavior to assign each dataset a color from a preset palette of 32 colors. If you define your own colors in a dataset, that color will be used; you should define both `backgroundColor` and `borderColor` if both are to be displayed. For line charts, set `fill: false` to prevent the use of `backgroundColor`.

#### Canvas Background Color
To set a non-transparent canvas background, define a CSS color under `msg.payload.options.chartBackgroundColor` (or `msg.payload.options.chartBackgroundColour`) in your Chart.js configuration. The node will pass this to the chartjs-node-canvas convenience plugin to fill the canvas.

````javascript
msg.payload = {
    // ... your chart config ...
    options: {
        backgroundColor: 'white' // or '#ffffff', 'rgba(255,255,255,1)', etc.
    }
};
````

#### Plugins

This node includes `chartjs-plugin-annotation` and `chartjs-plugin-datalabels`. Configure them under `options.plugins` according to their documentation.

Using Annotation

The annotation plugin allows you to add lines, boxes, points, and other annotations to your charts. Here's an example of adding a horizontal line annotation:

````javascript
msg.payload = {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
            label: 'Sales',
            data: [12, 19, 15]
        }]
    },
    options: {
        plugins: {
            annotation: {
                annotations: {
                    myImportantLine: {
                        type: 'line',
                        yMin: 15,
                        yMax: 15,
                        borderColor: 'red',
                        borderWidth: 2,
                        scaleID: 'y'
                    }
                }
            }
        }
    }
};
````

See the complete example in [examples/annotation_example.json](examples/annotation_example.json).

Note: `chartjs-plugin-datalabels` registers itself automatically when imported. This node looks for a `display: true` object in the datalabels definition to register or unregister the plugin, preventing datalabels from showing up uninvited.

eg:

 ````javascript
msg.payload = {
    options: {
           plugins: {
               datalabels: {
                   display:true
               }
           }
       }
}
````
#### Additional Plugins via `msg.plugins` 

**Note:** This only works for modern Chart.js plugins, see [chartjs-node-canvas docs](https://www.npmjs.com/package/chartjs-node-canvas?activeTab=readme#usage)

You can add plugins to be registered at runtime via `msg.plugins`.

#### Preferred (modern Node-RED): Install your needed plugin in your node-red working directory. **OR**, if your settings file allows, use the Function node “Setup” tab to require or install your plugin, then point to it via `msg.plugins` in your Function logic. For example, after your plugin is installed, set:

````javascript
msg.plugins = {
    myMuchNeededPlugin: 'my-much-needed-plugin-id' // This should be the actual plugin ID of your needed plugin
};
````
Please read the documentation for your plugin, as it may or may not be enabled by default once registered.

The node continues to include and handle `chartjs-plugin-annotation` and `chartjs-plugin-datalabels` as before. Any plugins you provide via `msg.plugins` are added in addition to those. Define plugin options under `options.plugins[pluginId]` in your Chart.js configuration.

#### Resources
- [Chart.js documentation](https://www.chartjs.org/docs/latest/)
- [chartjs-node-canvas documentation](https://www.npmjs.com/package/chartjs-node-canvas)
- [chartjs-plugin-datalabels documentation](https://chartjs-plugin-datalabels.netlify.app/guide/)
- [chartjs-plugin-annotation](https://github.com/chartjs/chartjs-plugin-annotation#readme)

#### Please report bugs, suggest improvements!
https://github.com/gemini86/node-red-contrib-chart-image/issues

#### If you find this node useful,
<a href="https://www.buymeacoffee.com/NxcwUpD" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
