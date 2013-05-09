"""
"""
import json
from zope.component import queryUtility
from Products.Five.browser import BrowserView
from eea.app.visualization.zopera import IPropertiesTool
from scoreboard.visualization.jsapp import jsapp_html
from scoreboard.visualization.config import EU

class TestsView(BrowserView):

    @property
    def jsapp_prefix(self):
        return '/++resource++scoreboard-jsapp'

    def jsapp_html(self):
        return jsapp_html(
                DATASOURCE_URL='',
                SCENARIO_URL='',
                DATA_REVISION='')

class EuropeanUnion(BrowserView):
    """ European Union Countries
    """
    def __call__(self, **kwargs):
        ptool = queryUtility(IPropertiesTool)
        stool = getattr(ptool, 'scoreboard_properties', None)
        if not stool:
            return json.dumps(EU)

        eu = stool.getProperty('EU', None)
        if not eu:
            return json.dumps(EU)

        try:
            json.loads(eu)
        except Exception:
            return json.dumps(EU)
        else:
            return eu
