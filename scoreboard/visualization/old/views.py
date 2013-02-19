import os
from collections import defaultdict
from functools import wraps
import simplejson as json
from zope.interface import Interface
import jinja2
from path import path
from sparql import unpack_row


ZSPARQLMETHOD = 'Z SPARQL Method'


def get_js_templates(parent=path(__file__).abspath().parent / 'static'):
    out = {tmpl.name: tmpl.text('utf-8') for tmpl in parent.files('*.html')}

    for folder in parent.dirs():
        for sub_name, text in get_js_templates(folder).iteritems():
            out['%s/%s' % (folder.name, sub_name)] = text

    return out


jinja_env = jinja2.Environment(
    loader=jinja2.PackageLoader(__name__, 'templates'))
jinja_env.globals['STATIC'] = '/++resource++scoreboard'
jinja_env.globals['get_js_templates'] = get_js_templates
jinja_env.filters['json'] = lambda v: jinja2.Markup(json.dumps(v))


def render_template(name, **kwargs):
    return jinja_env.get_template(name).render(**kwargs)


queries = {q['id']: q for q in json.loads(
    (path(__file__).parent / 'fixtures.json').bytes())}


def run_query(method_name, **kwargs):
    from Products.ZSPARQLMethod.Method import ZSPARQLMethod
    q = queries[method_name]
    method_ob = ZSPARQLMethod(q['id'], q['title'], q['endpoint_url'])
    method_ob.arg_spec = q['arg_spec']
    method_ob.query = q['query']
    result = method_ob(**kwargs)
    return [dict(zip(result.var_names, unpack_row(row)))
           for row in result.rdfterm_rows]


class IScoreboard(Interface):
    """ Marker interface for demo page """


class ScenarioView(object):

    def json_response(self, data):
        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(data, indent=2, sort_keys=True)

    def filters_data(self):
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

        return self.json_response({
            'indicators': indicators,
            'countries': countries,
        })


class DataView(object):

    def __call__(self):
        args = dict(self.request.form)
        method_name = args.pop('method')
        out = run_query(method_name, **args)

        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(out, indent=2, sort_keys=True)
