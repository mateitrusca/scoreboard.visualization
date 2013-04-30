/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";

App.chart_library['evolution_columns'] = function(container, options) {
    var sort = _.object(["sort_by", "order"],['label', 1]);
    var percent = options['unit_is_pc'];
    var time_snapshots = App.format_series(options['series'], sort, '', percent);
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
            text: time_snapshots[0]['name'],
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
                color: App.bar_colors['bar_color'],
                data: series,
                animation: false
            }
        ]
    };

    if (percent[0]){
        chartOptions.yAxis['max'] = 100;
    }

    if (!options['legend']){
        App.disable_legend(chartOptions);
    }

    var chart = new Highcharts.Chart(chartOptions);

    if(!App.chart_controls){
        App.chart_controls = new App.GraphControlsView({
            model: new Backbone.Model(),
            chart: chart,
            snapshots_data: time_snapshots,
            interval: window.interval_set,
        });
        App.chart_controls.$el.insertAfter(container);
    }else{
        App.chart_controls.chart = chart;
    };
};

})();
