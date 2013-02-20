/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.scenario2_chart = function(container, options) {
    var year_min = 2004;
    var year_max = 2012;
    var all_years = _.range(year_min, year_max);

    var series = _(options['series']).map(function(info) {
        var pairs = _(info['data']).sortBy('year');
        var chart_data = _.zip(_(pairs).pluck('year'),
                               _(pairs).pluck('value'));
        return {
            'name': info['label'],
            'data': chart_data,
            'animation': false
        };
    });

    var chartOptions = {
        chart: {
            renderTo: container,
            type: 'spline',
            marginRight: 50,
            marginBottom: 100
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
            text: options['indicator_label'],
            x: -20,
            margin: 30,
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em'
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
            title: {
                text: options['indicator_label'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            },
            labels: {
                style: {
                    color: '#000000'
                }
            },
            min: 0
        },
        tooltip: {
            formatter: function() {
            return '<b>'+ this.series.name +'</b><br/>'+
                            this.x +': '+ Math.round(this.y*10)/10 +' %_ent';
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
            series: {
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

    var chart = new Highcharts.Chart(chartOptions);

};

})();
