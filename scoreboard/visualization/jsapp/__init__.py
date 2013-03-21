import simplejson as json
import jinja2
from path import path


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


def jsapp_html(DATASOURCE_URL, DATA_REVISION):
    return render_template('jsapp.html', **{
        'URL': DATASOURCE_URL,
        'DATA_REVISION': DATA_REVISION,
    })
