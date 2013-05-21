/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario3_bubbles_filters_schema = {
    facets: [
        {type: 'select',
         name: 'x-indicator-group',
         label: "(X) indicator group",
         dimension: 'indicator-group',
         constraints: {}},
        {type: 'select',
         name: 'x-indicator',
         label: "(X) indicator",
         dimension: 'indicator',
         constraints: {
             'indicator-group': 'x-indicator-group'
         }},
        {type: 'ignore',
         name: 'x-breakdown-group',
         label: "(X) breakdown group",
         dimension: 'breakdown-group',
         constraints: {
             'indicator':       'x-indicator'
         }},
        {type: 'select',
         name: 'x-breakdown',
         label: "(X) breakdown",
         dimension: 'breakdown',
         constraints: {
             'indicator':       'x-indicator'
         }},
        {type: 'select',
         name: 'x-unit-measure',
         label: "(X) unit of measure",
         dimension: 'unit-measure',
         constraints: {
             'indicator':       'x-indicator',
             'breakdown':       'x-breakdown'
         }},

        {type: 'select',
         name: 'y-indicator-group',
         label: "(Y) indicator group",
         dimension: 'indicator-group',
         position: 'upper-right',
         constraints: {}},
        {type: 'select',
         name: 'y-indicator',
         label: "(Y) indicator",
         dimension: 'indicator',
         position: 'upper-right',
         constraints: {
             'indicator-group': 'y-indicator-group'
         }},
        {type: 'ignore',
         name: 'y-breakdown-group',
         label: "(Y) breakdown group",
         dimension: 'breakdown-group',
         position: 'upper-right',
         constraints: {
             'indicator':       'y-indicator'
         }},
        {type: 'select',
         name: 'y-breakdown',
         label: "(Y) breakdown",
         dimension: 'breakdown',
         position: 'upper-right',
         constraints: {
             'indicator':       'y-indicator'
         }},
        {type: 'select',
         name: 'y-unit-measure',
         label: "(Y) unit of measure",
         dimension: 'unit-measure',
         position: 'upper-right',
         constraints: {
             'indicator':       'y-indicator',
             'breakdown':       'y-breakdown'
         }},
        {type: 'select',
         name: 'z-indicator-group',
         label: "(Z) indicator group",
         dimension: 'indicator-group',
         position: 'bottom-right',
         constraints: {}},
        {type: 'select',
         name: 'z-indicator',
         label: "(Z) indicator",
         dimension: 'indicator',
         position: 'bottom-right',
         constraints: {
             'indicator-group': 'z-indicator-group'
         }},
        {type: 'ignore',
         name: 'z-breakdown-group',
         label: "(Z) breakdown group",
         dimension: 'breakdown-group',
         position: 'bottom-right',
         constraints: {
             'indicator':       'x-indicator'
         }},
        {type: 'select',
         name: 'z-breakdown',
         label: "(Z) breakdown",
         dimension: 'breakdown',
         position: 'bottom-right',
         constraints: {
             'indicator':       'z-indicator'
         }},
        {type: 'select',
         name: 'z-unit-measure',
         label: "(Z) unit of measure",
         dimension: 'unit-measure',
         position: 'bottom-right',
         constraints: {
             'indicator':       'z-indicator',
             'breakdown':       'z-breakdown'
         }},
        {type: 'select',
         multidim_common: true,
         name: 'time-period',
         label: "Year",
         sortBy: 'label',
         sortOrder: 'reverse', 
         dimension: 'time-period',
         position: 'bottom-left',
         constraints: {
             'x-indicator':    'x-indicator',
             'x-breakdown':    'x-breakdown',
             'x-unit-measure': 'x-unit-measure',
             'y-indicator':    'y-indicator',
             'y-breakdown':    'y-breakdown',
             'y-unit-measure': 'y-unit-measure',
             'z-indicator':    'z-indicator',
             'z-breakdown':    'z-breakdown',
             'z-unit-measure': 'z-unit-measure'
         }},
        {type: 'multiple_select',
         multidim_common: true,
         name: 'ref-area',
         on_client: true,
         label: 'Country / Countries',
         dimension: 'ref-area',
         default_value: ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'IT', 'CY', 'LV', 'LT', 'LU', 'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE', 'UK'],
         position: '.right_column',
         constraints: {
             'x-indicator':    'x-indicator',
             'x-breakdown':    'x-breakdown',
             'x-unit-measure': 'x-unit-measure',
             'y-indicator':    'y-indicator',
             'y-breakdown':    'y-breakdown',
             'y-unit-measure': 'y-unit-measure',
             'z-indicator':    'z-indicator',
             'z-breakdown':    'z-breakdown',
             'z-unit-measure': 'z-unit-measure',
             'time-period': 'time-period'
         }},
         {type: 'all-values', dimension: 'value', multidim_value: true}
    ],
    category_facet: 'ref-area',
    annotations: {
        filters: [{name: 'x-indicator'},
                  {name: 'x-breakdown'},
                  {name: 'x-unit-measure'},
                  {name: 'y-indicator'},
                  {name: 'y-breakdown'},
                  {name: 'y-unit-measure'},
                  {name: 'z-indicator'},
                  {name: 'z-breakdown'},
                  {name: 'z-unit-measure'}]
    },
    chart_type: 'bubbles',
    legend: true,
    multidim: 3,
    plotlines: {x: 'values', y: 'values'},
    labels: {
        title_x: {
         facet: 'x-indicator',
         field: 'short_label'},
        title_y: {
         facet: 'y-indicator',
         field: 'short_label'},
        title_z: {
         facet: 'z-indicator',
         field: 'short_label'},
        period_label: {
         facet: 'time-period',
         field: 'label'}
    }
};


App.scenario3_bubbles_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario3_bubbles_filters_schema);
};


})(App.jQuery);
