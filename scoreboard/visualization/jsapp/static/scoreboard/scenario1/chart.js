/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.scenario1_chart = function(container, options) {
    var series = _(options['series']).sortBy('value').reverse();
    var country_names = _(series).pluck('ref-area');
    var values = _(series).pluck('value');

    var values = _(series).map(
        function(value, key, list){
            if (value['ref-area'] === "EU27"){
                return {'y': value.value,
                        'color': '#35478C'}
            }
            else{
                return value.value;
            }
    });

    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'column',
            marginBottom: 150
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
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em'
            }
        },
        subtitle: {
            text: options['year_text'],
            align: 'left'

        },
        xAxis: {
            categories: country_names,
            labels: {
                rotation: -45,
                align: 'right',
                style: {
                    color: '#000000'
                }
             }
        },
        yAxis: {
            min: 0,
            title: {
                text: options['indicator_label'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }
        },
        legend: {
            enabled:false
        },
        tooltip: {
            formatter: options['tooltip_formatter']
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        series: [
            {
                name: options['indicator_label'],
                color: '#7FB2F0',
                data: values,
                animation: false
            }
        ]
    };

    var chart = new Highcharts.Chart(chartOptions);
};

})();
