import simplejson as json
from Products.Five.browser import BrowserView
from scoreboard.visualization.jsapp import jsapp_html


class TestsView(BrowserView):

    @property
    def static_prefix(self):
        return '/++resource++scoreboard-jsapp'

    def jsapp_html(self):
        return jsapp_html(
                DATASOURCE_URL='',
                SCENARIO_URL='',
                DATA_REVISION='')
