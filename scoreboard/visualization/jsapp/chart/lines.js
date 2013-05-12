/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.chart_library['lines'] = function(container, options) {
    var sort = _.object(["sort_by", "order"],['label', 1]);
    var percent = options['unit_is_pc'];
    var series = App.format_series(options['series'], sort, '', percent);
	_.map(series, function(elem) {
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
    });
    var all_years = _(series[0]['data']).pluck('code');
    var chartOptions = {
        chart: {
            renderTo: container,
            type: 'spline',
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
                text: options.meta_data['y_title'],
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
                            this.x +': '+ Math.round(this.y*10)/10 + options.meta_data['unit'];
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

    if (!options['legend']){
        App.disable_legend(chartOptions);
    }

    var chart = new Highcharts.Chart(chartOptions);

};

})();
