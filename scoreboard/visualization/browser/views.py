"""
"""
import json
from zope.component import queryUtility
from Products.Five.browser import BrowserView
from eea.app.visualization.zopera import IPropertiesTool
from scoreboard.visualization.jsapp import jsapp_html
from scoreboard.visualization.config import EU, BLACKLIST

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
    @property
    def eu(self):
        ptool = queryUtility(IPropertiesTool)
        stool = getattr(ptool, 'scoreboard_properties', None)
        if not stool:
            return EU

        eu = stool.getProperty('EU', None)
        if not eu:
            return EU

        try:
            json.loads(eu)
        except Exception:
            return EU
        else:
            return eu

    def __call__(self, **kwargs):
        return json.dumps(self.eu)

class BlackList(BrowserView):
    """ Blacklisted indicators
    """
    @property
    def blacklist(self):
        ptool = queryUtility(IPropertiesTool)
        stool = getattr(ptool, 'scoreboard_properties', None)
        if not stool:
            return BLACKLIST

        blacklist = stool.getProperty('BLACKLIST', None)
        if not blacklist:
            return BLACKLIST

        try:
            json.loads(blacklist)
        except Exception:
            return BLACKLIST
        else:
            return blacklist

    def __call__(self, **kwargs):
        return json.dumps(self.blacklist)
