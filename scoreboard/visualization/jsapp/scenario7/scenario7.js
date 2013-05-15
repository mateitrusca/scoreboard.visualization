/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario7_filters_schema = {
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
         sortBy: 'label',
         sortOrder: 'reverse', 
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
         name: 'unit-measure',
         label: 'Unit of measure',
         dimension: 'unit-measure',
         constraints: {
             'breakdown-group': 'breakdown-group',
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
         }},
        {type: 'multiple_select',
         name: 'ref-area',
         label: 'Country / Countries',
         dimension: 'ref-area',
         default_value: ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'UK'],
         constraints: {
             'unit-measure': 'unit-measure',
             'breakdown-group': 'breakdown-group',
             'time-period': 'time-period',
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
             'time-period': 'time-period',
             'indicator-group': 'indicator-group',
             'indicator': 'indicator'
          }},
         {type: 'all-values', dimension: 'value'}
    ],
    category_facet: 'ref-area',
    multiple_series: 'breakdown',
    annotations: {
        filters: [{name: 'indicator'},
                  {name: 'breakdown'},
                  {name: 'unit-measure'}]
    },
    chart_type: 'columns',
    tooltips: {
        'unit-measure': true,
        'flag': true,
        'note': true
    },
    legend: true,
    labels: {
        title: {facet: 'indicator', field: 'short_label'},
        ordinate: {facet: 'unit-measure', field: 'short_label'},
        unit: {facet: 'unit-measure', field: 'short_label'},
        subtitle: {facet: 'time-period', field: 'label'}
    }
};


App.scenario7_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario7_filters_schema);
};


})(App.jQuery);
