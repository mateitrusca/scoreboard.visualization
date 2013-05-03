/*global App, _, Highcharts */
/*jshint sub:true */

(function() {
"use strict";

App.chart_library['country_profile'] = function(container, options) {

    var sort = _.object(["sort_by", "order"],['value', -1]);
    var percent = options['unit_is_pc'];
    var series = App.format_series(options['series'], sort, '', percent);

    //var xlabels_formatter = function() {
        //var max_length = 35;
        //if (this.value.length > (max_length + 3)){
            //return this.value.substr(0, max_length) + '...';
        //}
        //return this.value;
    //};

    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'bar',
            height: 700,
            marginBottom: 100,
            marginLeft: 250
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
            text: options.meta_data['x_title'],
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em',
                width: '700'
            }
        },
        subtitle: {
            text: options.meta_data['year_text']
        },
        xAxis: {
            type: 'category',
            labels: {
                rotation: 0,
                align: 'right',
                //formatter: xlabels_formatter,
                style: {
                    color: '#000000',
                }
             }
        },
        yAxis: {
            min: 0,
            //tickPositions: [0],
            title: {
                text: options.meta_data['y_title'],
                style: {
                    color: '#000000',
                    fontWeight: 'bold'
                }
            }
        },
        legend: {
            enabled: true,
            layout: "vertical"
        },
        tooltip: {
            formatter: options['tooltip_formatter']
        },
        series: series
    };

    if (!options['legend']){
        App.disable_legend(chartOptions);
    }

    var chart = new Highcharts.Chart(chartOptions);
};

})();
