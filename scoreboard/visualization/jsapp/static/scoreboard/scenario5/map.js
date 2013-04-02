/*global App, _, chroma, Kartograph */
/*jshint sub:true */

(function() {
"use strict";


App.scenario5_map = function(container, options) {
    var series = options['series'][0]['data'];
    var value_by_country = _.object(
        _(series).map(function(v) {
            return v['ref-area']
        }),
        _(series).pluck('value'));

    var colorscale = new chroma.ColorScale({
        colors: chroma.brewer['YlOrBr'],
        limits: [0, _(_(series).pluck('value')).max()]
    });

    var n = 0;
    var map = Kartograph.map(container);
    map.loadMap(App.STATIC + '/europe.svg', function() {
        map.addLayer('countries', {
            titles: function(feature) {
                return feature.id;
            },
            styles: {
                stroke: '0.5px'
            },
            tooltips: function(feature) {
                var code = feature['code'];
                var value = value_by_country[code];
                return [App.COUNTRY_NAME[code],
                        (value ? App.round(value, 3) : 'n/a')];
            }
        });
        map.getLayer('countries').style({
            fill: function(feature) {
                var value = value_by_country[feature['code']];
                if(_.isUndefined(value)) {
                    return '#ccc';
                }
                else {
                    return colorscale.getColor(value);
                }
            }
        });
    });

};


})();
