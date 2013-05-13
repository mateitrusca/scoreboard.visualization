/*global $, App, _, Highcharts, Backbone */
/*jshint sub:true */

(function() {
"use strict";

App.chart_library['country_profile'] = function(container, options) {

    var sort = _.object(["sort_by", "order"],['value', -1]);
    var percent = options['unit_is_pc'];
    var category = options['category_facet'];
    var series = App.format_series(options['series'], sort, '', percent, category);

    var stack_series = [
        {
            name: 'Under EU27 average',
            color: '#7dc30f',
            dataLabels: {
                color: '#436b06',
                enabled: true,
                align: 'right',
                formatter: function(){
                    if(this.point.y){
                        return x_formatter(this.point.original);
                    }else{
                        return '';
                    }
                }
            },
            data: []
        },
        {
            name: 'Above EU27 average',
            color: '#436b06',
            dataLabels: {
                color: '#7dc30f',
                enabled: true,
                align: 'right',
                formatter: function(){
                    if(this.point.y){
                        return x_formatter(this.point.original);
                    }else{
                        return '';
                    }
                }
            },
            data: []
        }
    ];

    // Update series with new values
    _(series[0].data).forEach(function(item){
        item.eu = item.attributes.eu;
        item.rank = item.attributes.rank;
        item.original = item.attributes.original;

        item.name = item.attributes.indicator['short-label'];
        if(item.attributes.breakdown['label']){
            item.name += ' by ' + item.attributes.breakdown['label'];
        }
        if(item.attributes['unit-measure']['label']){
            item.name += ' in ' + item.attributes['unit-measure']['label'];
        }

        // Fill stack
        var fake;
        if(item.original > item.eu){
            stack_series[1].data.push(item);
            fake = $.extend({}, item);
            fake.y = 0;
            stack_series[0].data.push(fake);
        }else{
            stack_series[0].data.push(item);
            fake = $.extend({}, item);
            fake.y = 0;
            stack_series[1].data.push(fake);
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

        var title = options.meta_data['title'];
        if(options.meta_data['ref-area'] && options.meta_data['indicator-group']){
            title = [options.meta_data['ref-area'], options.meta_data['indicator-group']].join(', ');
        }
        title = 'Country profile for ' + title;

        var chartOptions = {
            chart: {
                renderTo: container,
                defaultSeriesType: 'bar',
                marginTop: 60,
                marginBottom: 100,
                marginLeft: 200,
                marginRight: 200,
                height: 200 + series[0].data.length * 75,
                width: 850,
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
                text: title,
                style: {
                    color: '#000000',
                    fontWeight: 'bold',
                    fontSize:'1.2em',
                    width: '700'
                }
            },
            subtitle: {
                text: options.meta_data['subtitle']
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
                    text: options.meta_data['ordinate'],
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
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: 10,
                y: 30,
                borderWidth: 0
            },
            tooltip: {
                formatter: function(){
                    return x_formatter(this.point.original);
                }
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                }
            },
            series: stack_series
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

App.CountryProfileView = Backbone.View.extend({

    template: App.get_template('chart/country_profile.html'),

    initialize: function(options) {
        this.options = $.extend({}, options);
        this.render();
    },

    table: function(){
        var table = [];
        var self = this;
        _(this.options.data).forEach(function(item){
            var row = {};
            row.name = item.name;
            row.eu = self.options.x_formatter(item.eu);
            row.rank = item.rank ? item.rank : '-';
            row.value = self.options.x_formatter(item.original);
            table.push(row);
        });
        return table;
    },

    render: function(){
        this.$el.html(
            this.template({
                'ref-area': this.options.meta_data['ref-area'],
                'time-period': this.options.meta_data['time-period'],
                'credits': this.options.credits,
                'table': this.table()
            })
        );
    }
});

})();
