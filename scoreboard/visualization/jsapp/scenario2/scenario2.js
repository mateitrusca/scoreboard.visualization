/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario2_filters_schema = {
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
         name: 'ref-area',
         label: 'Countries',
         dimension: 'ref-area',
         default_value: ['EU27'],
         constraints: {
             'indicator-group': 'indicator-group',
             'indicator': 'indicator',
             'breakdown': 'breakdown',
             'unit-measure': 'unit-measure'
         }},
         {type: 'all-values', name: 'time-period', dimension: 'time-period'},
         {type: 'all-values', name: 'value', dimension: 'value'}
    ],
    category_facet: 'time-period',
    multiple_series: 'ref-area',
    annotations: {
        filters: [{name: 'indicator'},
                  {name: 'breakdown-group'},
                  {name: 'breakdown'},
                  {name: 'unit-measure'}]
    },
    chart_type: 'lines',
    tooltips: {
        'unit-measure': true,
        'flag': true,
        'note': true
    },
    'series-legend-label': 'long',
    'series-ending-label': 'long',
    'series-point-label': 'long',
    sort: {
        by: 'category',
        order: -1,
        each_series: true
    },
    labels: {
        title: {facet: 'indicator', field: 'short_label'},
        subtitle: {facet: 'breakdown', field: 'label'},
        ordinate: {facet: 'unit-measure', field: 'short_label'},
        unit: {facet: 'unit-measure', field: 'short_label'}
    }
};


App.scenario2_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario2_filters_schema);
};


})(App.jQuery);
