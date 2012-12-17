import os
from collections import defaultdict
from functools import wraps
import simplejson as json
from zope.interface import Interface
import jinja2
from path import path
from sparql import unpack_row


ZSPARQLMETHOD = 'Z SPARQL Method'


def get_templates():
    templates_dir = path(__file__).abspath().parent / 'templates' / 'js'
    return {t.namebase: t.text('utf-8') for t in templates_dir.listdir()}


jinja_env = jinja2.Environment(
    loader=jinja2.PackageLoader(__name__, 'templates'))
jinja_env.globals['STATIC'] = '/++resource++scoreboard'
jinja_env.globals['get_templates'] = get_templates
jinja_env.filters['json'] = lambda v: jinja2.Markup(json.dumps(v))


def render_template(name, **kwargs):
    return jinja_env.get_template(name).render(**kwargs)


def run_query(method_ob, **kwargs):
    result = method_ob(**kwargs)
    return [dict(zip(result.var_names, unpack_row(row)))
           for row in result.rdfterm_rows]


class IDemo(Interface):
    """ Marker interface for demo page """


class DemoView(object):

    def __call__(self):
        return render_template('demo.html', URL=self.context.absolute_url())


class GetFiltersView(object):

    def scenario1(self):
        years = defaultdict(list)
        for row in run_query(self.context['get_all_indicators_to_years']):
            years[row['indicator']].append(row['year_label'])

        indicators = []
        for row in run_query(self.context['get_all_indicator_labels']):
            indicators.append({
                'uri': row['indicator'],
                'label': row['label'],
                'years': years[row['indicator']],
            })

        self.request.RESPONSE.setHeader("Content-Type", "application/json")
        out = {'indicators': indicators}
        return json.dumps(out, indent=2, sort_keys=True)


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
            old_ob = self.context.get(data['id'], None)
            if old_ob is not None:
                assert old_ob.meta_type == ZSPARQLMETHOD
                del self.context[data['id']]
            manage_addZSPARQLMethod(self.context, data['id'],
                                    data['title'], data['endpoint_url'])
            ob = self.context[data['id']]
            ob.timeout = data['timeout']
            ob.arg_spec = data['arg_spec']
            ob.query = data['query']
            n += 1
        return '%d objects loaded\n' % (n)
