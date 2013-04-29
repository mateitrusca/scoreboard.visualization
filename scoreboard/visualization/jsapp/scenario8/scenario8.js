/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario8_filters_schema = {
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
         name: 'breakdown-group',
         label: 'Breakdown group',
         dimension: 'breakdown-group',
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'select',
         name: 'unit-measure',
         label: 'Unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
         {type: 'select',
          name: 'ref-area',
          label: 'Country',
          dimension: 'ref-area',
          constraints: {
             'unit-measure': 'unit-measure',
             'breakdown-group': 'breakdown-group',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
          }},
         {type: 'all-values',
          dimension: 'breakdown',
          label: 'Breakdown',
          name: 'breakdown',
          constraints: {
             'unit-measure': 'unit-measure',
             'breakdown-group': 'breakdown-group',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator',
             'ref-area': 'ref-area'
          }},
         {type: 'all-values', dimension: 'time-period'},
         {type: 'all-values', dimension: 'value'}
    ],
    category_facet: 'time-period',
    multiple_series: 'breakdown',
    annotations: {
        source: '/dimension_value_metadata',
        filters: [{name: 'indicator', part: 'label'},
                  {name: 'breakdown-group', part: 'label'},
                  {name: 'unit-measure', part: 'label'}]
    },
    chart_type: 'lines',
    chart_meta_labels: [
        {targets: ['x_title'],
         filter_name: 'breakdown-group',
         type: 'short_label'},
        {targets: ['y_title', 'unit'],
         filter_name: 'unit-measure',
         type: 'short_label'},
    ]
};


App.scenario8_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario8_filters_schema);
};


})(App.jQuery);
