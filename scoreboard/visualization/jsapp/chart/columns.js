/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";

App.chart_library['columns'] = function(container, options) {

    var series = App.format_series(
                    options['series'],
                    options['sort'],
                    '', //type e.g.: 'xy'/'xyz'
                    options['unit_is_pc'],
                    options['category_facet']);
    var init_serie = series;
    if (options['animation']){
        init_serie = [series[0]];
    }

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
            text: options.meta_data['title'],
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em',
                width: '700'
            }
        },
        subtitle: {
            text: options.meta_data['subtitle'],
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
                text: options.meta_data['ordinate'],
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
            formatter: options['tooltip_formatter'],
            style: {
                width:400
            }
        },
        series: init_serie
    };

    if (!options['legend']){
        App.disable_legend(chartOptions);
    }

    var chart = new Highcharts.Chart(chartOptions);

    if (options['plotlines']){
        App.add_plotLines(chart, init_serie, options['plotlines']);
    }

    if (options['animation']){
        if(!App.chart_controls){
            App.chart_controls = new App.GraphControlsView({
                model: new Backbone.Model(),
                chart: chart,
                snapshots_data: series,
                interval: window.interval_set,
                plotlines: options['plotlines'],
                chart_type: options['plotlines']
            });
            App.chart_controls.$el.insertAfter(container);
        }else{
            App.chart_controls.chart = chart;
            App.chart_controls.snapshots_data = series;
        };
    }
};

})();
