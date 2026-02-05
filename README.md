# node-red-contrib-chart-image

Generate a chart in image form using Chart.js
## Details
A chart image buffer will be generated using the chart.js definition object found in <code>msg.payload</code>. See the chart.js documentation for more info on [defining a chart](https://www.chartjs.org/docs/4.4.9/configuration/).

## Canvas Size
Setting `msg.width` and/or `msg.height` to the desired size in pixels will override the node configuration.

## Default Color Palette
If no `backgroundColor` or `borderColor` is defined for a dataset, Chart.js assigns the global default color of `rgba(0,0,0,0.1)`. To make life a little easier, this node changes that behavior to assign each dataset a color from a preset palette of 32 colors. If you define your own colors in a dataset, that color will be used; you should define both `backgroundColor` and `borderColor` if both are to be displayed.

## Canvas Background Color
To set a non-transparent canvas background, define a CSS color under `msg.payload.options.chartBackgroundColor` or `msg.payload.options.chartBackgroundColour` in your Chart.js configuration. Both American and British spellings are supported for convenience.
The node will pass this to the chartjs-node-canvas convenience plugin to fill the canvas.

````javascript
msg.payload = {
    // ... your chart config ...
    options: {
        chartBackgroundColor: 'white', // or '#ffffff', 'rgba(255,255,255,1)', etc.
        // chartBackgroundColour: 'white' // British spelling also supported
    }
};
````

## Plugins

This node includes the built-in Chart.js plugins as well as a couple others, for convenience. **Time series charts are supported out of the box** via the [chartjs-adapter-moment](https://github.com/chartjs/chartjs-adapter-moment) adapter, which is automatically registered for you.

#### Supported built-in plugins:
- Legend
- Title
- Subtitle
- Filler
- Decimation

#### Included for convenience (disabled by default):
- chartjs-plugin-annotation
- chartjs-plugin-datalabels
- chartjs-adapter-moment (for time series axes)

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

e.g.,

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

Configuring a dataset to use `chartjs-plugin-datalabels` will override this global config.

e.g.,

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

### Time Series support

To use time series axes, simply specify `type: 'time'` for your axis in the Chart.js config. The adapter is already included and registered, so you do **not** need to install or import anything extra.

Example:

````javascript
msg.payload = {
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
                time: {
                    unit: 'day'
                }
            }
        }
    }
};
````

See the [Chart.js time scale documentation](https://www.chartjs.org/docs/latest/axes/cartesian/time.html) for more options and formatting details.

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
