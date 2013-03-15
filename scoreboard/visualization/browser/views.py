from Products.Five.browser import BrowserView
from scoreboard.visualization.jsapp import jsapp_html


class TestsView(BrowserView):

    @property
    def static_prefix(self):
        return '/++resource++scoreboard'

    def jsapp_html(self):
        return jsapp_html(URL=self.context.absolute_url(),
                          DATA_REVISION='')
