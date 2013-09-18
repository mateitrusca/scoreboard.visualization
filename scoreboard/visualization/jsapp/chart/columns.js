/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";

App.chart_library['columns'] = function(view, options) {

    var container = view.el
    $(container).addClass('high-chart');
    var series = App.format_series(
                    options['series'],
                    options['sort'],
                    options['multidim'],
                    options['unit_is_pc'],
                    options['category_facet'],
                    options['highlights'],
                    options['animation']);
    var init_series = series;
    if (options['animation']){
        init_series = JSON.parse(JSON.stringify(series.slice(-1)));
    }

    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'column',
            zoomType: 'y',
            marginLeft: 100,
            marginRight: 170,
            marginTop: 80,
            marginBottom: 100,
            height: 450,
            width: 1100
        },
        colors: App.SERIES_COLOR,
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
            useHTML:true,
            text: options.titles.title,
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em',
                width: '700'
            }
        },
        subtitle: {
            text: options.titles.subtitle,
            style: {
                fontWeight: 'bold',
                fontSize: '16px'
            },
            align: 'left',
            x: 70
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: -45,
                align: 'right',
                formatter: options['xlabels_formatter'],
                style: {
                    color: '#000000',
                    width: 700
                }
             }
        },
        yAxis: {
            min: 0,
            max: options['unit_is_pc'][0]?100:null,
            title: {
                text: options.titles.yAxisTitle,
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
            }
        },
        tooltip: {
            formatter: options['tooltip_formatter'],
            style: {
                width:400
            }
        },
        series: init_series
    };

    App.set_default_chart_options(chartOptions);
    if (!options['legend']){
        App.disable_legend(chartOptions, options);
    }
    App.override_zoom();
    var chart = new Highcharts.Chart(chartOptions);
    var metadata = {
        'chart-title': options.titles.title,
        'chart-subtitle': options.titles.subtitle,
        'chart-xAxisTitle': options.titles.xAxisTitle,
        'chart-yAxisTitle': options.titles.yAxisTitle,
        'source-dataset': options.credits.text,
        'chart-url': document.URL,
        'filters-applied': _(this.model.attributes).pairs()
    };
    view.trigger('chart_ready', series, metadata);

    if (options['plotlines']){
        App.add_plotLines(chart, init_series, options['plotlines']);
    }

    if (options['animation']){
        if(!App.chart_controls){
            App.chart_controls = new App.GraphControlsView({
                model: new Backbone.Model(),
                chart: chart,
                snapshots_data: series,
                interval: window.interval_set,
                plotlines: options['plotlines'],
                chart_type: options['plotlines'],
                sort: options['sort']
            });
            $('#the-filters .footer').append(App.chart_controls.$el);
        }else{
            App.chart_controls.chart = chart;
            App.chart_controls.update_data(series);
        };
    }
};

})();
