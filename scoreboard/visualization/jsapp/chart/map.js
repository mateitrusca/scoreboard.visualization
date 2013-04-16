/*global App, _, chroma, Kartograph */
/*jshint sub:true */

(function($) {
"use strict";

function get_value_for_code(code, series){
    if (code == 'GB'){
        code = 'UK';
    }
    if (code == 'GR'){
        code = 'EL';
    }
    var data = _.chain(series).pluck('data').first().
                 find(function(item){
                     return item['code'] == code;
                 }).value();
    if(data){
        return data['y'];
    }
}

App.chart_library['map'] = function(container, options) {
    var map_div = $('<div class="map-chart">');
    $(container).empty().append(map_div);
    var percent = options['unit_is_pc'];
    var series = App.format_series(options['series'], false, '', percent);
    var max_value = _.chain(series).pluck('data').
                      first().pluck('y').max().value();
    var colorscale = new chroma.ColorScale({
        colors: chroma.brewer['YlOrBr'],
        limits: [0, max_value]
    });
    var unit = options['meta_data']['unit'];

    var n = 0;
    var map = Kartograph.map(map_div[0]);
    map.loadMap(App.JSAPP + '/europe.svg', function() {
        map.addLayer('countries', {
            titles: function(feature) {
                return feature.id;
            },
            styles: {
                stroke: '0.5px'
            },
            tooltips: function(feature) {
                var code = feature['code'];
                var value = get_value_for_code(code, series);
                return [App.COUNTRY_NAME[code],
                        (value ? App.round(value, 3) + ' ' + unit : 'n/a')];
            }
        });
        map.getLayer('countries').style({
            fill: function(feature) {
                var value = get_value_for_code(feature.code, series);
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


})(App.jQuery);
