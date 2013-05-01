/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.chart_library['bubbles'] = function(container, options) {

    $(container).addClass('normal-chart');

    var percent = options['unit_is_pc'];
    var series = App.format_series(options['series'], false, 'xyz', percent);

    var chartOptions = {
        chart: {
            type: 'bubble',
            renderTo: container,
            zoomType: 'xy',
            marginRight: 25,
            marginBottom: 150,
            marginTop: 100

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
            text: (options.meta_data['indicator_x_label'] + ' vs. ' +
                   options.meta_data['indicator_y_label']),
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em'
            }

        },
        xAxis: [{
            title: {
                enabled: true,
                text: options.meta_data['indicator_x_label'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            },
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
                text: 'Year 2011',
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }
        }],
        yAxis: {
            title: {
                text: options.meta_data['indicator_y_label'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            },
            labels: {
                style: {
                    color: '#000000'
                }
            }
        },
        tooltip: {
            formatter: function() {
            return ('<b>'+ this.series.name +'</b><br/>x: '+
                this.x + ' ' + options.meta_data['x_unit_label'] + '<br>y: '+
                this.y + ' ' + options.meta_data['y_unit_label'] + '<br>z: '+
                this.point.z + ' ' + options.meta_data['z_unit_label']
            )}
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            x: 0,
            y: -20,
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
        series: series[0]
    };

    if (options['plotlines']){
        chartOptions = App.add_plotLines(chartOptions, series, options['plotlines']);
    }

    if (!options['legend']){
        App.disable_legend(chartOptions);
    }

    var chart = new Highcharts.Chart(chartOptions);

    if (options['animation']){
        if(!App.chart_controls){
            App.chart_controls = new App.GraphControlsView({
                model: new Backbone.Model(),
                chart: chart,
                snapshots_data: series,
                interval: window.interval_set,
                multiseries: options['multiseries']
            });
            App.chart_controls.$el.insertAfter(container);
        }else{
            App.chart_controls.chart = chart;
            App.chart_controls.snapshots_data = series;
        };
    }

};


})();
