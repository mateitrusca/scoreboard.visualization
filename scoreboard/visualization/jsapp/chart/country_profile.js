/*global $, App, _, Highcharts, Backbone */
/*jshint sub:true */

(function() {
"use strict";

App.chart_library['country_profile'] = function(container, options) {

    var sort = _.object(["sort_by", "order"],['value', -1]);
    var percent = options['unit_is_pc'];
    var series = App.format_series(options['series'], sort, '', percent);
    var all_series = options.all_series;

    var mapping = {};
    _(all_series.datapoints).forEach(function(item){
        var key, oldValue, newValue, exists, myName, myValue;
        key = item.indicator;

        myName = options.meta_data['ref-area'];
        myValue = _(series[0].data).find(function(ind){
            return (ind.code === key);
        });
        myValue = myValue ? myValue.y : 0;

        exists = mapping[key];
        if(!exists){
            mapping[key] = {
                'min': {'value': Math.min(), 'ref-area': ''},
                'max': {'value': Math.max(), 'ref-area': ''},
                'med': {'value': 0, 'ref-area': ''},
                'rank': {'value': 1, 'ref-area': myName}
            };
        }

        // Update rank
        if(item.value > myValue){
            mapping[key]['rank']['value'] += 1;
        }

        // Update min
        oldValue = mapping[key]['min']['value'];
        newValue = Math.min(item.value, oldValue);
        if(newValue !== oldValue){
            mapping[key]['min']['value'] = newValue;
            mapping[key]['min']['ref-area'] = item['ref-area'];
        }

        // Update max
        oldValue = mapping[key]['max']['value'];
        newValue = Math.max(item.value, oldValue);
        if(newValue !== oldValue){
            mapping[key]['max']['value'] = newValue;
            mapping[key]['max']['ref-area'] = item['ref-area'];
        }

        // Update med
        if(item['ref-area'] === 'EU27'){
            mapping[key]['med']['value'] = item.value;
            mapping[key]['med']['ref-area'] = item['ref-area'];
        }
    });

    // Update series with new values
    _(series[0].data).forEach(function(item){
        var key = item.code;
        var val = item.y;
        var min = mapping[key]['min']['value'];
        var max = mapping[key]['max']['value'];
        var med = mapping[key]['med']['value'];
        var rank = mapping[key]['rank']['value'];
        item.old_y = item.y;
        item.eu = med;
        item.rank = rank;
        if (val <= med){
            item.y = (val - min) / (med - min);
        }else{
            item.y = 1 + (val - med) / (max - med);
        }
    });

    var x_formatter = function(value){
        if(!value.toFixed){
            return value;
        }

        if(value > 100){
            return value.toFixed(0);
        }else{
            return value.toFixed(2);
        }
    };

    // Highchart
    if(options.subtype === 'bar'){

        var x_title = options.meta_data['x_title'];
        if(options.meta_data['ref-area'] && options.meta_data['indicator-group']){
            x_title = [options.meta_data['ref-area'], options.meta_data['indicator-group']].join(', ');
        }
        x_title = 'Country profile for ' + x_title;

        var chartOptions = {
            chart: {
                renderTo: container,
                defaultSeriesType: 'bar',
                height: 700,
                marginBottom: 100,
                marginLeft: 250,
                marginRight: 50
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
                text: x_title,
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
                    style: {
                        color: '#000000'
                    }
                 }
            },
            yAxis: [{
                min: 0,
                tickPositions: [0, 1, 2],
                 labels: {
                    formatter: function() {
                        return ['Min', 'EU27', 'Max'][this.value];
                    }
                },
                title: {
                    text: options.meta_data['y_title'],
                    style: {
                        color: '#000000',
                        fontWeight: 'bold'
                    }
                }
            },
            {
                title: {text: null},
                min: 0,
                max: 2,
                tickPositions: [0, 1, 2],
                plotBands: [{
                    color: 'red',
                    width: 2,
                    value: 1,
                    zIndex: 5
                }],
                labels: {
                    formatter: function() {
                        return ['Min', 'EU27', 'Max'][this.value];
                    }
                },
                opposite:true
            }],
            legend: {
                enabled: true,
                layout: "vertical"
            },
            tooltip: {
                formatter: function(){
                    return x_formatter(this.point.old_y);
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        formatter: function(){
                            return x_formatter(this.point.old_y);
                        }
                    }
                }
            },
            series: series
        };

        if (!options['legend']){
            App.disable_legend(chartOptions);
        }

        var chart = new Highcharts.Chart(chartOptions);

    // Custom table
    }else{
        App.country_profile = new App.CountryProfileView({
            el: '#' + $(container).attr('id'),
            model: new Backbone.Model(),
            data: series[0].data,
            meta_data: options.meta_data,
            credits: options.credits,
            x_formatter: x_formatter
        });
    }
};

})();
