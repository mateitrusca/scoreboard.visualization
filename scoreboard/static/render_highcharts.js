(function() {
"use strict";


App.render_highcharts = function(container, data) {
    var options = {
        'year_text': "Year 2011",
        'indicator_label': "% of population who have never used the internet",
        'credits': {
            'href': 'http://ec.europa.eu/digital-agenda/en/graphs/',
            'text': 'European Commission, Digital Agenda Scoreboard'
        },
        'tooltip_formatter': function() {
            return '<b>'+ this.x +'</b><br>: ' +
                   Math.round(this.y*10)/10 + ' %_ind';
        }
    };

    data = _(data).sortBy(function(item) {
        return - item['value'];
    });

    var country_names = _(data).map(function(item) {
        return item['country_name'];
    });

    var values = _(data).map(function(item) {
        return item['value'];
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
                data: values
            }
        ]
    };

    var chart = new Highcharts.Chart(chartOptions);
};

})();
