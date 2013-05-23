/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.chart_library['scatter'] = function(container, options) {

    $(container).addClass('high-chart');
    $(container).parent().addClass('scatter-chart');

    var series = App.format_series(
                    options['series'],
                    options['sort'],
                    options['multidim'],
                    options['unit_is_pc'],
                    options['category_facet'],
                    options['highlights']);

    var init_series = JSON.parse(JSON.stringify(series[0]));

    // formatter is lost after stringify
    _(init_series).each(function(item){
        item['dataLabels']['formatter'] = function(){
            return this.point.name;
        }
    });

    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'scatter',
            zoomType: 'xy',
            marginLeft: 100,
            marginRight: 150,
            marginTop: 70,
            marginBottom: 100,
            height: 670,
            width: 750,
            ignoreHiddenSeries: false
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
        title: null,
        xAxis: [{
            title: {
                enabled: true,
                text: options['title_formatter'](
                        options.meta_data['title_x'],
                        options.meta_data['breakdown_x']),
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            },
			min: 0,
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
            labels: {
                style: {
                    color: '#000000'
                }
             }

        },{
            opposite:true,
            title: {
                text: options.meta_data['period_label'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }
        }],
        yAxis: {
            title: {
                text: options['title_formatter'](
                        options.meta_data['title_y'],
                        options.meta_data['breakdown_y']),
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            },
			min: 0,
            labels: {
                style: {
                    color: '#000000'
                }
            }
        },
        tooltip: {
            formatter: options['tooltip_formatter'],
            style: {
                width:400
            }
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            x: 10,
            y: 30,
            borderWidth: 0
        },
        plotOptions: {
            scatter: {
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                }
            }
        },
        series: init_series
    };

    if (!options['legend']){
        App.disable_legend(chartOptions, options);
    }

    var chart = new Highcharts.Chart(chartOptions);

    if (options['plotlines']){
        App.add_plotLines(chart, series[0], options['plotlines']);
    }

    if (options['animation']){
        if(!App.chart_controls){
            App.chart_controls = new App.GraphControlsView({
                model: new Backbone.Model(),
                chart: chart,
                snapshots_data: series,
                interval: window.interval_set,
                multiseries: options['multiseries'],
                plotlines: options['plotlines'],
                chart_type: options['plotlines']
            });
            App.chart_controls.$el.insertBefore(container);
        }else{
            App.chart_controls.chart = chart;
            App.chart_controls.snapshots_data = series;
            App.chart_controls.update_chart();
        };
    }


};


})();
