import simplejson as json
from zope.interface import Interface
import jinja2
from path import path


def get_templates():
    templates_dir = path(__file__).abspath().parent / 'templates' / 'js'
    return {t.namebase: t.text() for t in templates_dir.listdir()}


jinja_env = jinja2.Environment(
    loader=jinja2.PackageLoader(__name__, 'templates'))
jinja_env.globals['STATIC'] = '/++resource++scoreboard'
jinja_env.globals['get_templates'] = get_templates
jinja_env.filters['json'] = lambda v: jinja2.Markup(json.dumps(v))


def render_template(name, **kwargs):
    return jinja_env.get_template(name).render(**kwargs)


class IDemo(Interface):
    """ Marker interface for demo page """


class DemoView(object):

    def __call__(self):
        return render_template('demo.html')


class TestsView(object):

    def __call__(self):
        return render_template('tests.html')
