# node-red-contrib-chart-image

Generate a chart in image form using Chart.js
# Details
A chart image buffer will be generated using the chart.js definition object found in <code>msg.payload</code>. See the chart.js documentation for more info on [defining a chart](https://www.chartjs.org/docs/4.4.9/configuration/).

## Canvas Size
Setting `msg.width` and/or `msg.height` to the desired size in pixels will override the node configuration.

## Default Color Palette
If no `backgroundColor` or `borderColor` is defined for a dataset, Chart.js assigns the global default color of `rgba(0,0,0,0.1)`. To make life a little easier, this node changes that behavior to assign each dataset a color from a preset palette of 32 colors. If you define your own colors in a dataset, that color will be used; you should define both `backgroundColor` and `borderColor` if both are to be displayed.

## Canvas Background Color
To set a non-transparent canvas background, define a CSS color under `msg.payload.options.chartBackgroundColor` (or `msg.payload.options.chartBackgroundColour`) in your Chart.js configuration. The node will pass this to the chartjs-node-canvas convenience plugin to fill the canvas.

````javascript
msg.payload = {
    // ... your chart config ...
    options: {
        chartBackgroundColor: 'white' // or '#ffffff', 'rgba(255,255,255,1)', etc.
    }
};
````

## Plugins

This node includes the built-in Chart.js plugins as well as a couple others, for convenience.

#### Supported built-in plugins:
- Legend
- Title
- Subtitle
- Filler

Note 
: For unknown reasons, the built-in data decimation plugin is not currently working. A separate plugin to handle this is in the works, until then, you'll need to handle data decimation elsewhere in the flow or provide a plugin.

#### Included for convenience (disabled by default):
- chartjs-plugin-annotation
- chartjs-plugin-datalabels

### Using Annotation

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
See `chartjs-plugin-annotation` [documentation](https://github.com/chartjs/chartjs-plugin-annotation#readme) for more info.

See a complete example in [examples/annotation_example.json](examples/annotation_example.json).

### Using Datalabels

Under normal Chart.js use, `chartjs-plugin-datalabels` is enabled by default when registered. Instead, `node-red-contrib-chart-image` node looks for a `display: true` object in the datalabels definition to register or unregister the plugin, preventing datalabels from showing up uninvited.

eg:

 ````javascript
msg.payload = {
    options: {
           plugins: {
               datalabels: {
                   display:true // Otherwise, this will be set to false
               }
           }
       }
}
````

Configuring a dataset to use `chartjs-plug-datalabels` will override this global config.

eg:

 ````javascript
msg.payload = {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar'],
        datasets: [{
            label: 'Sales',
            data: [12, 19, 15],
            datalabels: {
                display: true
            }
        }]
    }
}
````
See `chartjs-plugin-datalabels` [documentation](https://chartjs-plugin-datalabels.netlify.app/guide/) for more info.

### Additional Plugins via `msg.plugins`

You can add plugins at runtime via `msg.plugins`.

Preferred (modern Node-RED): use the Function node “Setup” tab to require or install your plugin, then attach it to `msg.plugins` in your Function logic. For example, after setting up `myMuchNeededPlugin` in the Setup tab, set:

````javascript
msg.plugins = [ myMuchNeededPlugin ]; // Must be an array
````
Alternatively (legacy): you can still add modules in `settings.js` using `functionGlobalContext`, then reference them from a Function node and pass them via `msg.plugins`:

````javascript
functionGlobalContext: {
        // os:require('os'),
        // jfive:require("johnny-five"),
        // j5board:require("johnny-five").Board({repl:false}),
        myMuchNeededPlugin: require('chartjs-plugin-yourplugin')
    },
````

Then in your Function node:

````javascript
msg.plugins = [ global.get('myMuchNeededPlugin') ]
````
Any plugins you provide via `msg.plugins` are added in addition to those provided by default. Define plugin options under `options.plugins[pluginId]` in your Chart.js configuration.

#### Resources
- [Chart.js documentation](https://www.chartjs.org/docs/4.4.9/)
- [chartjs-node-canvas documentation](https://www.npmjs.com/package/chartjs-node-canvas)
- [chartjs-plugin-datalabels documentation](https://chartjs-plugin-datalabels.netlify.app/guide/)
- [chartjs-plugin-annotation](https://github.com/chartjs/chartjs-plugin-annotation#readme)

#### Please report bugs, suggest improvements!
https://github.com/gemini86/node-red-contrib-chart-image/issues

#### If you find this node useful,
<a href="https://www.buymeacoffee.com/NxcwUpD" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
