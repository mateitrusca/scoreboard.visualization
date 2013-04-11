/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";

function format_series(data){
    var extract_data = function(series_item){
        return _.object([['name', series_item['ref-area-label']],
                         ['y', series_item['value']]]);
    };

    var labels_collection = []
    var series = _.chain(data).map(function(item){
        var data = _(item['data']).map(extract_data);
        labels_collection = _.chain(item['data']).
                                pluck('ref-area-label').
                                union(labels_collection).
                                value();
        return _.object(
                ['name', 'data'],
                [item['label'], data]);
    }).map(function(item){
        var serie = item['data'];
        _.chain(labels_collection).
            difference(_(serie).pluck('name')).
            each(function(diff_label){
                _(serie).push(
                    _.object(
                        [['name', diff_label],
                         ['y', 'n/a']])
                );
            });
        return _.object(
                ['name', 'data'],
                [item['name'], _(serie).sortBy(function(item){
                    if (isNaN(item['y'])){
                        return 0
                    }
                    return -item['y']
                })]);
    }).value();
    return series;
};

App.chart_library['splitted_columns'] = function(container, options) {

    var series = format_series(options['series']);

    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'column',
            marginBottom: 150
        },
        credits: {
            href: options['credits']['href'],
            text: options['credits']['text'],
            position: {
                align: 'right',
                x: -10,
                verticalAlign: 'bottom',
                y: -2
            }
        },
        title: {
            text: options.meta_data['x_title'],
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em',
                width: '700'
            }
        },
        subtitle: {
            text: options.meta_data['year_text'],
            align: 'left'

        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                align: 'right',
                formatter: options['xlabels_formatter'],
                style: {
                    color: '#000000',
                }
             }
        },
        yAxis: {
            min: 0,
            title: {
                text: options.meta_data['y_title'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }
        },
        legend: {
            enabled: true,
            layout: "vertical"
        },
        tooltip: {
            formatter: options['tooltip_formatter']
        },
        series: series
    };

    var chart = new Highcharts.Chart(chartOptions);
};

})();
