/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.scenario3_chart = function(container, options, meta_data) {
    var countrycolor = function(code) {
        if (_.isNull(App.COUNTRY_COLOR[code])) {
            return '#1C3FFD';
        } else {
            return App.COUNTRY_COLOR[code];
        }
    }


    var label_formatter = function() {
        return this.point.name;
    };

    var series = _(options['series']).map(function(datapoint) {
        var name = datapoint['ref-area'];
        var code = App.COUNTRY_CODE[name];
        return {
            'name': name + ' ' + code,
            'color': countrycolor(code),
            'data': [{
                'name': code,
                'x': datapoint['value']['x'],
                'y': datapoint['value']['y']
            }],
            'marker': {
                'radius': 5,
                'symbol': 'circle',
                'states': {
                    hover: {'enabled': true, 'lineColor': 'rgb(100,100,100)'}
                }
            },
            'dataLabels': {
                'enabled': true,
                'x': 16,
                'y': 4,
                'formatter': label_formatter
            }
        }
    });

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
            text: (meta_data['indicator_x_label'] + ' vs. ' +
                   meta_data['indicator_y_label']),
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em'
            }

        },
        xAxis: [{
            title: {
                enabled: true,
                text: meta_data['indicator_x_label'],
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
                text: meta_data['period_label'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }
        }],
        yAxis: {
            title: {
                text: meta_data['indicator_y_label'],
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
                this.x +' %_of_total_cost,<br>y: '+ this.y +' %_ind_iu3');
            }
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
