/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.chart_library['lines'] = function(container, options) {
    $(container).addClass('high-chart');
    $(container).parent().addClass('spline-chart');
    var series = App.format_series(
                    options['series'],
                    options['sort'],
                    options['multidim'],
                    options['unit_is_pc'],
                    options['category_facet'],
                    options['highlights']);
	_.map(series, function(elem) {
        if ( elem.data.length > 0 ) {
            _(_.last(elem.data)).extend({
                dataLabels: {
                  enabled: true,
                  crop: false,
                  x: 3,
                  align: 'left',
                  verticalAlign: 'middle',
                  formatter: function() { return this.series.name }
                }
            });
        }
    });
    var all_years = _(series[0]['data']).pluck('code');
    var chartOptions = {
        chart: {
            renderTo: container,
            type: 'spline',
            zoomType: 'y',
            marginLeft: 100,
            marginRight: 170,
            marginTop: 60,
            marginBottom: 50,
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
            x: 0,
            margin: 30,
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em',
                width: '800'
            }
        },
        subtitle: {
            text: (options.meta_data['subtitle'] != 'Total') ? options.meta_data['subtitle'] : null,
            x: 0,
            y: 45,
            margin: 30,
            style: {
                color: '#000000',
                fontSize:'1em',
                width: '600'
            }
        },
        xAxis: {
            categories: all_years,
            labels: {
                style: {
                    color: '#000000'
                }
             }
        },
        yAxis: {
            min:0,
            max: options['unit_is_pc'][0]?100:null,
            title: {
                text: options.meta_data['ordinate'],
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
            borderWidth: 0,
            itemStyle: {
                width: 150
            }
        },
        plotOptions: {
            series: {
                connectNulls: true,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                    var ex = this.series.xAxis.getExtremes();
                    if (this.x == ex.dataMax) {
                        this.series.options.dataLabels.y = -8;
                        this.series.options.dataLabels.x = 25;
                        return this.series.name;
                        } else {
                            return "";
                        }
                    }
                },
                marker: {
                    fillColor: null,
                    lineWidth: 4,
                    lineColor: null
                }
            }
        },
        series: series
    };

    App.disable_legend(chartOptions, options);

    var chart = new Highcharts.Chart(chartOptions);

};

})();
