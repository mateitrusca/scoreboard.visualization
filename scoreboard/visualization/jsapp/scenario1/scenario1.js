/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario1_filters_schema = {
    facets: [
        {type: 'select',
         name: 'indicator-group',
         label: 'Indicator group',
         dimension: 'indicator-group',
         include_wildcard: true,
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
        filters: [{name: 'indicator'},
                  {name: 'breakdown-group'},
                  {name: 'breakdown'},
                  {name: 'unit-measure'}]
    },
    chart_type: 'columns',
    plotlines: {y: 'values'},
    labels: {
        title: {facet: 'indicator', field: 'short_label'},
        subtitle: {facet: 'time-period', field: 'label'},
        ordinate: {facet: 'unit-measure', field: 'short_label'},
        unit: {facet: 'unit-measure', field: 'short_label'}
    }
};


App.scenario1_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario1_filters_schema);
};


})(App.jQuery);
