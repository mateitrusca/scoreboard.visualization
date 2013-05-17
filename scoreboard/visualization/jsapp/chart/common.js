/*global App, _ */
/*jshint sub:true */


(function() {
"use strict";

function sort_serie(serie, sort){
    serie = _(serie).sortBy( function(item){
        if (sort.first_serie){
            return _.chain(sort.first_serie)
                    .pluck('name').indexOf(item['name'])
                    .value();
        }
        else{
            if (sort.sort_by == 'value'){
                var value = item['y'];
                if (isNaN(value)){
                    value = 0;
                }
                return sort.order * value;
            }
            if (sort.sort_by == 'label'){
                return item['name'];
            }
        }
    });
    return serie;
};

App.bar_colors = {
    bar_color: "#7FB2F0",
    special_bar_color: "#35478C",
    na_bar_color: "#DDDDDD"
};


App.format_series = function (data, sort, type, percent, category){
    var multiplicators = _(percent).map(function(pc){
        return pc?100:1;
    });
    if (type=='xy' || type=='xyz'){
        var countrycolor = function(code) {
            if (_.isNull(App.COUNTRY_COLOR[code])) {
                return '#1C3FFD';
            } else {
                return App.COUNTRY_COLOR[code];
            }
        }


        var label_formatter = function() {
            return this.point.name;
        };

        var all_collection = {}
        var series = _.chain(data).map(function(serie){
            return _.chain(serie['data']).map(function(datapoint) {
                var notation = datapoint[category]['notation'];
                var data = [{
                    'name': notation,
                    'attributes': _(datapoint).omit('value'),
                    'x': datapoint['value']['x'] * multiplicators[0],
                    'y': datapoint['value']['y'] * multiplicators[1]
                }]
                if (type == 'xyz'){
                    data[0]['z'] = datapoint['value']['z'] * multiplicators[1]
                }
                var output = {
                    'name': App.COUNTRY_NAME[notation],
                    'code': notation,
                    'color': countrycolor(notation),
                    'data': data,
                    'marker': {
                        'radius': 5,
                        'symbol': 'circle',
                        'states': {
                            hover: {'enabled': true, 'lineColor': 'rgb(100,100,100)'}
                        }
                    },
                    'dataLabels': {
                        'enabled': true,
                        'x': 16,
                        'y': 4,
                        'formatter': label_formatter
                    }
                }
                _.chain(data).
                  each(function(item){
                      var new_serie = _(output).omit('data');
                      new_serie['data'] = [_(data[0]).omit(['x', 'y', 'z'])];
                      _(all_collection).extend(
                        _.object([[item['name'], new_serie]])
                      )
                  }).
                  uniq(all_collection);
                return output
            }).value();
        }).map(function(serie){
            var all_codes = _(all_collection).keys();
            _.chain(all_codes)
             .difference(_(serie).pluck('code'))
             .each(function(diff_code){
                serie.push(all_collection[diff_code]);
             });
            return _(serie).sortBy('name');
        }).value();
    }else{
        var first_serie = false;
        var extract_data = function(series_item){
            var value = series_item['value'];
            if(percent){
                if (percent[0]){
                    value*=100;
                }
            }
            return _.object([['name', series_item[category]['label']],
                             ['code', series_item[category]['notation']],
                             ['attributes', _(series_item).omit('value')],
                             ['y', value]]);
        };

        var diffs_collection = {}
        var series = _.chain(data).map(function(item){
            var data = _(item['data']).map(extract_data);
            _.chain(data).
              each(function(item){
                  _(diffs_collection).extend(
                    _.object([[item['code'], item['attributes']]])
                  )
              }).
              uniq(diffs_collection).
              value();
            return _.object(
                    ['name', 'data'],
                    [item['label'], data]);
        }).map(function(item){
            var serie = item['data'];
            _.chain(diffs_collection).
              keys().
              difference(_(serie).pluck('code')).
              each(function(diff_code){
                  var data = diffs_collection[diff_code][category];
                  var attributes = _.object([[category, data]]);
                  _(serie).push(
                      _.object([['code', data['notation']],
                                ['name', data['label']],
                                ['attributes', attributes],
                                ['y', null]])
                  );
              });
            if (sort && !first_serie){
                serie = sort_serie(serie, sort);
                if(sort.retain_first_serie_order){
                    first_serie = serie;
                }
            }
            else if (sort){
                    _(sort).extend({'first_serie': first_serie});
                    serie = sort_serie(serie, sort);
            }
            return _.object(
                    ['name', 'data'],
                    [item['name'], serie]);
        }).value();
    }
    return _(series).sortBy('name');

}

App.compute_plotLines = function compute_plotLines(coord, series, axis_type){
    var values = _.chain(series);
    var map_stage = function(serie){
        if (axis_type == 'categories'){
            var value = null;
            if (serie.length % 2 == 0){
                value = serie.length/2;
            }
            else{
                value = (serie.length-1)/2;
            }
            return _.object([
                ['min', value],
                ['max', value]
            ]);
        }
        else{
            var min =  _.chain(serie).pluck(coord).min().value();
            var max = _.chain(serie).pluck(coord).max().value();
            return _.object([
                ['min', min],
                ['max', max]
            ]);
        }
    };
    var reduce_stage = function(memo, item){
        var min = _([item.min, memo.min]).min();
        var max = _([item.max, memo.max]).max();
        return _.object([
            ['min', min],
            ['max', max]
        ]);
    };
    values = values.pluck('data').map(map_stage).reduce(reduce_stage).value();
    return (values.min + values.max)/2;
}

App.add_plotLines = function(chart, series, chart_type){
    _.chain([chart.xAxis, chart.yAxis]).each(function(item){
        _(item).each(function(axis){
            if (_.chain(chart_type).keys().contains(axis.xOrY).value()){
                axis.removePlotLine('median');
                axis.addPlotLine({
                    value: App.compute_plotLines(axis.xOrY, series, chart_type[axis.xOrY]),
                    width: 2,
                    color: 'red',
                    id: 'median'
                });
            }
        });
    });
}

App.disable_legend = function(chartOptions, legend_options){
    var disabled_legend = {
        legend: {enabled: false}
    };
    _(chartOptions).extend(disabled_legend);
}

})();

