from collections import defaultdict
import simplejson as json
from path import path
from sparql import unpack_row
from Products.ZSPARQLMethod.Method import ZSPARQLMethod


queries = {q['id']: q for q in json.loads(
    (path(__file__).parent / 'queries.json').bytes())}

SPARQL_ENDPOINT = 'http://virtuoso.scoreboard.edw.ro/sparql'


def run_query(method_name, **kwargs):
    q = queries[method_name]
    method_ob = ZSPARQLMethod(q['id'], q['title'], SPARQL_ENDPOINT)
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


class DataView(object):

    def __call__(self):
        args = dict(self.request.form)
        method_name = args.pop('method')
        out = run_query(method_name, **args)

        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(out, indent=2, sort_keys=True)
