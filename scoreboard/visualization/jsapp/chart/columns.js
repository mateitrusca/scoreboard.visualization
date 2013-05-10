/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";

App.chart_library['columns'] = function(container, options) {

    var sort = _.object(["sort_by", "order"],['value', -1]);
    var percent = options['unit_is_pc'];
    var category = options['category_facet'];
    var series = App.format_series(options['series'], sort, '', percent, category);

    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'column',
            marginLeft: 100,
            marginRight: 170,
            marginTop: 50,
            marginBottom: 100,
            height: 450,
            width: 1100
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
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 10,
            y: 30,
            borderWidth: 0,
            itemStyle: {
                width: 150
            },
        },
        tooltip: {
            formatter: options['tooltip_formatter']
        },
        series: series
    };

    if (!options['legend']){
        App.disable_legend(chartOptions);
    }

    var chart = new Highcharts.Chart(chartOptions);
};

})();
