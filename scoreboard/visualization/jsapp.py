import simplejson as json
import jinja2
from path import path


MODULE_PATH = path(__file__).abspath().parent


def get_js_templates(parent=MODULE_PATH / 'jsapp'):
    out = {tmpl.name: tmpl.text('utf-8') for tmpl in parent.files('*.html')}

    for folder in parent.dirs():
        for sub_name, text in get_js_templates(folder).iteritems():
            out['%s/%s' % (folder.name, sub_name)] = text

    return out


jinja_env = jinja2.Environment()
jinja_env.globals['STATIC'] = '/++resource++scoreboard-jsapp'
jinja_env.globals['get_js_templates'] = get_js_templates
jinja_env.filters['json'] = lambda v: jinja2.Markup(json.dumps(v))


def jsapp_html(DATASOURCE_URL, SCENARIO_URL, DATA_REVISION):
    tmpl = jinja_env.from_string((MODULE_PATH / 'jsapp.html').text('utf-8'))
    return tmpl.render(**{
        'URL': DATASOURCE_URL,
        'SCENARIO_URL': SCENARIO_URL,
        'DATA_REVISION': DATA_REVISION,
    })
