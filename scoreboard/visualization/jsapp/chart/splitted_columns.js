/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.chart_library['splitted_columns'] = function(container, options, meta_data) {
    var series = _(options['series']).map(function(item){
        var data = _(item['data']).pluck('value');
        return _.object(
            ['name', 'data'],
            [item['label'], data]
        );
    });

    var country_names = _(_(options['series']).pluck('data')).reduce(function(prev, next){
        return _(_(prev).pluck('ref-area-label')).union(
                 _(next).pluck('ref-area-label'));
    });

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
            text: meta_data['x_title'],
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em',
                width: '700'
            }
        },
        subtitle: {
            text: meta_data['year_text'],
            align: 'left'

        },
        xAxis: {
            categories: country_names,
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
                text: meta_data['y_title'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }
        },
        legend: {
            enabled:false
        },
        tooltip: {
            formatter: options['tooltip_formatter']
        },
        series: series
    };

    var chart = new Highcharts.Chart(chartOptions);
};

})();
