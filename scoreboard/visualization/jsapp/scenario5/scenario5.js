/*global App, $script */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario5_filters_schema = {
    facets: [
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
         }},
        {type: 'select',
         name: 'time-period',
         label: 'Period',
         dimension: 'time-period',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'breakdown-group',
         label: 'Breakdown group',
         dimension: 'breakdown-group',
         constraints: {
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'breakdown',
         label: 'Breakdown',
         dimension: 'breakdown',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'unit-measure',
         label: 'Unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'breakdown': 'breakdown',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'multiple_select',
         name: 'ref-area',
         label: 'Country / Countries',
         dimension: 'ref-area',
         default_all: true,
         position: '.right_column',
         constraints: {
             'unit-measure': 'unit-measure',
             'breakdown-group': 'breakdown-group',
             'breakdown': 'breakdown',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
         {type: 'all-values', dimension: 'value'}
    ],
    category_facet: 'ref-area',
    annotations: {
        source: '/dimension_value_metadata',
        filters: [{name: 'indicator', part: 'label'},
                  {name: 'breakdown-group', part: 'label'},
                  {name: 'breakdown', part: 'label'},
                  {name: 'unit-measure', part: 'label'}]
    },
    chart_type: 'map',
    chart_meta_labels: [
        {targets: ['x_title'], filter_name: 'indicator', type: 'short_label'},
        {targets: ['y_title', 'unit'],
         filter_name: 'unit-measure', type: 'short_label'},
        {targets: ['year_text'], filter_name: 'time-period', type: 'label'}
    ]
};


App.scenario5_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario5_filters_schema);
};


})(App.jQuery);
