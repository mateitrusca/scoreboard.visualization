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


def run_query(method_ob, **kwargs):
    result = method_ob(**kwargs)
    return [dict(zip(result.var_names, unpack_row(row)))
           for row in result.rdfterm_rows]


class IScoreboard(Interface):
    """ Marker interface for demo page """


class ScenarioView(object):

    def json_response(self, data):
        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(data, indent=2, sort_keys=True)

    def render_template(self, name='scenario.html', **kwargs):
        data = {'URL': self.context.absolute_url()}
        data.update(kwargs)
        return render_template(name, **data)

    def index(self):
        return self.render_template('index.html')

    def scenario1(self):
        return self.render_template(entry_point='App.scenario1_initialize')

    def scenario2(self):
        return self.render_template(entry_point='App.scenario2_initialize')

    def scenario3(self):
        return self.render_template(entry_point='App.scenario3_initialize')

    def filters_data(self):
        years = defaultdict(list)
        for row in run_query(self.context['get_all_indicators_to_years']):
            years[row['indicator']].append(row['year_label'])

        indicators = []
        for row in run_query(self.context['get_all_indicator_labels']):
            indicators.append({
                'uri': row['indicator'],
                'label': row['label'],
                'years': sorted(years[row['indicator']], reverse=True),
            })

        countries = []
        for row in run_query(self.context['get_countries']):
            countries.append({
                'uri': row['country'],
                'label': row['label'],
            })

        return self.json_response({
            'indicators': indicators,
            'countries': countries,
        })


class TestsView(object):

    def __call__(self):
        return render_template('tests.html', URL=self.context.absolute_url())


class DataView(object):

    def __call__(self):
        args = dict(self.request.form)
        method_name = args.pop('method')
        out = run_query(self.context[method_name], **args)

        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        return json.dumps(out, indent=2, sort_keys=True)


def GET_confirmation(view):
    @wraps(view)
    def wrapper(self):
        if self.request.method == 'GET':
            return render_template('confirm.html')
        return view(self)
    return wrapper


class FixturesView(object):

    def get_fixtures_path(self):
        return path(__file__).parent / 'fixtures.json'

    @GET_confirmation
    def dump(self):
        if os.environ.get('SCOREBOARD_FIXTURES_DUMP', '') != 'on':
            return ("Dumping fixtures not allowed. Set environment variable "
                    "SCOREBOARD_FIXTURES_DUMP=on to enable.\n")

        fixtures = []
        for ob in self.context.objectValues([ZSPARQLMETHOD]):
            fixtures.append({
                'id': ob.getId(),
                'title': ob.title,
                'endpoint_url': ob.endpoint_url,
                'timeout': ob.timeout,
                'arg_spec': ob.arg_spec,
                'query': ob.query,
            })

        with (self.get_fixtures_path()).open('wb') as f:
            json.dump(fixtures, f, indent=2, sort_keys=True)
        return 'ok, %d objects dumped\n' % len(fixtures)

    @GET_confirmation
    def load(self):
        from Products.ZSPARQLMethod.Method import manage_addZSPARQLMethod
        with (self.get_fixtures_path()).open('rb') as f:
            fixtures = json.load(f)
        n = 0
        for data in fixtures:
            id = str(data['id'])
            old_ob = self.context.get(id, None)
            if old_ob is not None:
                assert old_ob.meta_type == ZSPARQLMETHOD
                del self.context[id]
            manage_addZSPARQLMethod(self.context, id,
                                    data['title'], data['endpoint_url'])
            ob = self.context[id]
            ob.timeout = data['timeout']
            ob.arg_spec = data['arg_spec']
            ob.query = data['query']
            n += 1
        return '%d objects loaded\n' % (n)
