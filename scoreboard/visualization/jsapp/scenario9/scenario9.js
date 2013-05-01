/*global App, Backbone, _ */
/*jshint sub:true */

(function($) {
"use strict";


App.scenario9_filters_schema = {
    facets: [
        {type: 'select',
         name: 'indicator-group',
         label: 'Indicator group',
         dimension: 'indicator-group',
         constraints: {}
         },
        {type: 'select',
         name: 'ref-area',
         label: 'Country',
         dimension: 'ref-area',
         constraints: {
             'indicator-group': 'indicator-group'
            }
        },
        {type: 'select',
         name: 'time-period',
         label: 'Year',
         dimension: 'time-period',
         constraints: {
             'indicator-group': 'indicator-group',
             "ref-area": "ref-area"
            }
         },
         {type: 'all-values', dimension: 'value'}
    ],
    category_facet: 'ref-area',
    multiple_series: null,
    annotations: {
        source: '/dimension_value_metadata',
        filters: []
    },
    chart_type: 'country_profile',
    chart_meta_labels: []
};


App.scenario9_initialize = function() {
    App.create_visualization($('#scenario-box')[0],
                             App.scenario9_filters_schema);
};


})(App.jQuery);
