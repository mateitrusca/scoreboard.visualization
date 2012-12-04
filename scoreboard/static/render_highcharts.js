(function() {
"use strict";


App.render_highcharts = function(container, data) {
    var chartOptions = {
        chart: {
            renderTo: container,
            defaultSeriesType: 'column',
            marginBottom: 150
        },
        credits: {
            href: 'http://ec.europa.eu/digital-agenda/en/graphs/',
            text: 'European Commission, Digital Agenda Scoreboard',
            position: {
                align: 'right',
                x: -10,
                verticalAlign: 'bottom',
                y: -2
            }
        },
        title: {
            text: '<br>% of population who have never used the internet',
            style: {
                color: '#000000',
                fontWeight: 'bold',
                fontSize:'1.2em'
            }
        },
        subtitle: {
            text: 'Year 2011',
            align: 'left'

        },
        xAxis: {
            categories: ['Romania','Bulgaria','Greece','Cyprus','Portugal',
                         'Italy','Lithuania','Poland','Malta','Spain',
                         'Slovenia','Hungary','Latvia',
                         'European Union - 27 countries','Czech Republic',
                         'Ireland','Estonia','Slovak Republic',
                         'Austria','France','Germany','Belgium','United Kingdom',
                         'Finland','Luxembourg','Denmark','Netherlands','Norway',
                         'Sweden','Iceland'],
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
                text: '%_ind',
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
            formatter: function() {
                return '<b>'+ this.x +'</b><br>: ' +
                       Math.round(this.y*10)/10 + ' %_ind';
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        series: [
            {
                name: '% of population who have never used the internet',
                color: '#7FB2F0',
                data: [54.21,45.81,44.77,40.72,40.5,38.58,33.1,32.71,29.71,29.16,
                       29.1,28.01,26.61,24.27,23.83,21.24,20.01,19.54,18.49,17.83,
                       15.84,14.11,11.23,8.89,8.13,7.24,6.97,4.63,4.62,4.2]
            }
        ]
    };

    var chart = new Highcharts.Chart(chartOptions);
};

})();
