> ⚠️ **Legacy / Deprecated**
>
> Version 1.x of this node is deprecated.
>  
> Please use **v2.0.3 or later**.  
> Migration details are available in the v2.0.3 release notes.

# node-red-contrib-chart-image

Generate a chart in image form using Chart.js
## Details:
A chart image buffer will be generated using the chart.js definition object found in <code>msg.payload</code>. See the chart.js documentation for more info on defining a chart.

#### Canvas Size:
Setting `msg.width` and/or `msg.height` to the desired size in pixels will override the node configuration.

#### Default Color Pallet:
If no `backgroundColor` or `borderColor` is defined for a dataset, Chartjs assigns the global default color of `rgba(0,0,0,0.1)`. To make life a little easier, this node changes that behavior to assign each dataset a color from preset pallet, which includes 32 colors. If you define your own colors in a dataset, that color will be used, you do have to define both `backgroundColor` and `borderColor` if both are to be displayed. for line charts, use `fill:false` to prevent the use of `backgroundColor`.

#### Plugins:
This node includes `chartjs-plugin-datalabels` and `chartjs-plugin-annotations`. Each can be defined as you would according to their documentation. You can also define the chart background color by defining a `chartArea` object under the options scope.

````javascript
chartArea: {
    backgroundColor: 'white'
}
````

 - NOTE: chartjs-plugin-datalabels registers itself automatically when imported. This node looks for a `display:true` object in the datalabels definition to register or unregistert the plugin. This prevents datalabels showing up aninvited.

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
Additional plugins can be used by installing the desired plugin in the Node-RED install directory and following the settings.js example to import the module into your Node-RED instance.

````javascript
functionGlobalContext: {
        // os:require('os'),
        // jfive:require("johnny-five"),
        // j5board:require("johnny-five").Board({repl:false}),
		myMuchNeededPlugin: require('chartjs-plugin-yourplugin')
    },
````
From there, you can pass it to your chart vie `msg.plugins`.

````javascript
msg.plugins = {
    myMuchNeededPlugin: global.get('myMuchNeededPlugin')
};
````
Then you just need to define the plugin options in your chart definition object.

#### Resources
- [Chart.js documentation](https://www.chartjs.org/docs/latest/)
- [charjs-code-canvas documentation](https://www.npmjs.com/package/chartjs-node-canvas)
- [chartjs-plugin-datalabels documentation](https://chartjs-plugin-datalabels.netlify.app/guide/)
- [chartjs-plugin-annotations](https://github.com/chartjs/chartjs-plugin-annotation#readme)

#### Please report bugs, suggest improvements!
https://github.com/gemini86/node-red-contrib-chart-image/issues

#### If you find this node useful,
<a href="https://www.buymeacoffee.com/NxcwUpD" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
