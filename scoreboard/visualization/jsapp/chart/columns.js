/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";


App.columns_chart = function(container, options, meta_data) {
    var series = options['series'][0]['data'];
    series = _(series).sortBy('value').reverse();
    var country_names = _(series).pluck('ref-area-label');
    var values = _(series).map(
        function(item){
            var result = item['value'] * 100;
            if (item['ref-area'] === "EU27"){
                return {'y': result,
                        'color': '#35478C'}
            }
            else{
                return result;
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
            text: meta_data['x_title'],
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em',
                width: '700'
            }
        },
        subtitle: {
            text: meta_data['year_text'],
            align: 'left'

        },
        xAxis: {
            categories: country_names,
            labels: {
                rotation: -45,
                align: 'right',
                formatter: options['xlabels_formatter'],
                style: {
                    color: '#000000',
                }
             }
        },
        yAxis: {
            min: 0,
            title: {
                text: meta_data['y_title'],
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
