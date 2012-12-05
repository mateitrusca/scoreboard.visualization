import simplejson as json
from zope.interface import Interface
import jinja2
from path import path
from sparql import unpack_row


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
