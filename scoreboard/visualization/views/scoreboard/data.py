from collections import defaultdict
import simplejson as json
from path import path
from Products.Five.browser import BrowserView
from sparql import unpack_row
from Products.ZSPARQLMethod.Method import ZSPARQLMethod
from ...data.cube import Cube


queries = {q['id']: q for q in json.loads(
    (path(__file__).parent / 'queries.json').bytes())}

SPARQL_ENDPOINT = 'http://virtuoso.scoreboardtest.edw.ro/sparql'
DATASET = 'http://semantic.digital-agenda-data.eu/dataset/scoreboard'


def run_query(method_name, **kwargs):
    q = queries[method_name]
    method_ob = ZSPARQLMethod(q['id'], "", SPARQL_ENDPOINT)
    method_ob.arg_spec = q['arg_spec']
    method_ob.query = q['query']
    result = method_ob(**kwargs)
    return [dict(zip(result.var_names, unpack_row(row)))
           for row in result.rdfterm_rows]


class FiltersView(object):

    def __call__(self):
        years = defaultdict(list)
        for row in run_query('map_indicators_years'):
            years[row['indicator']].append(row['year_label'])

        indicators = []
        for row in run_query('all_indicators'):
            indicators.append({
                'uri': row['indicator'],
                'label': row['label'],
                'years': sorted(years[row['indicator']], reverse=True),
                'comment': row['comment'],
                'publisher': row['publisher'],
                'unit': row['unit'],
            })

        countries = []
        for row in run_query('all_countries'):
            countries.append({
                'uri': row['country'],
                'label': row['label'],
            })

        out = {
            'indicators': indicators,
            'countries': countries,
        }
        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(out, indent=2, sort_keys=True)


class CubeView(BrowserView):

    def __init__(self, ctx, request):
        super(CubeView, self).__init__(ctx, request)
        self.cube = Cube(SPARQL_ENDPOINT, DATASET)

    def jsonify(self, data):
        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(data, indent=2, sort_keys=True)

    def dimension_labels(self):
        form = dict(self.request.form)
        dimension = form.pop('dimension')
        value = form.pop('value')
        [labels] = self.cube.get_dimension_labels(dimension, value)
        return self.jsonify(labels)

    def dimension_values(self):
        form = dict(self.request.form)
        dimension = form.pop('dimension')
        filters = sorted(form.items())
        options = self.cube.get_dimension_options(dimension, filters)
        return self.jsonify({'options': options})

    def dimension_values_xy(self):
        form = dict(self.request.form)
        dimension = form.pop('dimension')
        (filters, x_filters, y_filters) = ([], [], [])
        for k, v in sorted(form.items()):
            if k.startswith('x-'):
                x_filters.append((k[2:], v))
            elif k.startswith('y-'):
                y_filters.append((k[2:], v))
            else:
                filters.append((k, v))
        options = self.cube.get_dimension_options_xy(dimension, filters,
                                                     x_filters, y_filters)
        return self.jsonify({'options': options})

    def datapoints(self):
        form = dict(self.request.form)
        fields = form.pop('fields').split(',')
        filters = sorted(form.items())
        rows = list(self.cube.get_data(fields=fields, filters=filters))
        return self.jsonify({'datapoints': rows})

    def datapoints_xy(self):
        form = dict(self.request.form)
        columns = form.pop('columns').split(',')
        xy_columns = form.pop('xy_columns').split(',')
        (filters, x_filters, y_filters) = ([], [], [])
        for k, v in sorted(form.items()):
            if k.startswith('x-'):
                x_filters.append((k[2:], v))
            elif k.startswith('y-'):
                y_filters.append((k[2:], v))
            else:
                filters.append((k, v))
        rows = list(self.cube.get_data_xy(columns=columns,
                                          xy_columns=xy_columns,
                                          filters=filters,
                                          x_filters=x_filters,
                                          y_filters=y_filters))
        return self.jsonify({'datapoints': rows})


class DataView(object):

    def __call__(self):
        args = dict(self.request.form)
        method_name = args.pop('method')
        out = run_query(method_name, **args)

        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(out, indent=2, sort_keys=True)
