(function() {
"use strict";


App.scenario2_chart = function(container, options) {
    var data = _(options['data']).sortBy('year');
    var years = _(data).pluck('year');
    var chart_data = _.zip(years, _(data).pluck('value'));

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
            categories: years,
            min: 2004,
            max: 2012,
            labels: {
                style: {
                    color: '#000000'
                }
             }
        },
        yAxis: {
            title: {
                text: '%_ent',
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
        series: [{
            name: 'Denmark',
            data: chart_data
        }]
    };

    var chart = new Highcharts.Chart(chartOptions);

};

})();
