/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.chart_library['scatter'] = function(container, options) {

    $(container).addClass('normal-chart');

    var series = App.format_series(options['series'], false, 'xy');

    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'scatter',
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
                this.y + ' ' + options.meta_data['y_unit_label']
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
        series: series
    };

    var chart = new Highcharts.Chart(chartOptions);

};


})();
