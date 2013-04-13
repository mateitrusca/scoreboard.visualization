/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";

var bar_color = "#7FB2F0";
var special_bar_color = "#35478C";
var na_bar_color = "#DDDDDD";

App.chart_library['evolution_columns'] = function(container, options) {
    var time_snapshots = App.format_series(options['series']);
    var series = time_snapshots[0]['data'];

    var chartOptions = {
        chart: {
            zoomType: 'y',
            renderTo: container,
            defaultSeriesType: 'column',
            marginBottom: 150,
            marginRight: 80,
            events: {
                load: function() {
                }
            }
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
            max: 100,
            title: {
                text: options.meta_data['y_title'],
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
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        series: [
            {
                name: options['indicator_label'],
                color: bar_color,
                data: series,
                animation: false
            }
        ]
    };

    var chart = new Highcharts.Chart(chartOptions);

    var slider_values = _(options['group_labels']).keys().sort();
    App.chart_controls = new App.GraphControlsView({
        model: new Backbone.Model(),
        chart: chart,
        snapshots_data: time_snapshots,
        interval: window.interval_set,
        range: _.object( [['min', parseInt(slider_values[0])],
                         ['max', parseInt(_(slider_values).last())]] )
    });
    App.chart_controls.$el.insertAfter(container);
};

})();
