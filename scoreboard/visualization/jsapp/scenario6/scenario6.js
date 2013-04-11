/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario6_filters_schema = {
    filters: [
        {type: 'select',
         name: 'indicator-group',
         label: 'Indicator group',
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'indicator',
         label: 'Indicator',
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'indicator-group'
         }
        },
        {type: 'select',
         name: 'breakdown',
         label: 'Breakdown',
         dimension: 'breakdown',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'unit-measure',
         label: 'Unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator',
             'breakdown': 'breakdown'
         }},
        {type: 'multiple_select',
         name: 'countries',
         label: 'Countries',
         dimension: 'ref-area',
         default_all: true,
         position: '.right_column',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator',
             'breakdown': 'breakdown',
             'unit-measure': 'unit-measure'
         }}
    ],
    annotations: {
        'description': {
            title: "Label x-axis",
            source: '/dimension_value_metadata',
            filters: [{name: 'indicator', part: 'label'},
                      {name: 'breakdown', part: 'label'}]
        }
    },
    chart_type: 'evolution_columns',
    chart_datasource: {
        client_filter: 'countries',
        groupby_dimension: 'time-period',
        rel_url: '/datapoints',
        extra_args: [
            ['fields', 'ref-area,value']
        ]
    },
    chart_meta_labels: [
        {targets: ['x_title'],
         filter_name: 'indicator',
         type: 'short_label'},
        {targets: ['y_title', 'unit'],
         filter_name: 'unit-measure',
         type: 'short_label'}
    ]
};


App.scenario6_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario6_filters_schema);
};


})(App.jQuery);
