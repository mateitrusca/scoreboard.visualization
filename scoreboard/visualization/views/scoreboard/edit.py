""" Edit
"""
import simplejson as json
from zope.formlib.form import Fields
from scoreboard.visualization import config
from scoreboard.visualization.views.scoreboard.interfaces import IScoreboardEdit
from eea.app.visualization.views.edit import EditForm
from .view import jsapp_html_for_visualization, get_source


class Edit(EditForm):
    """ Edit tabular view
    """
    label = u"Scoreboard View settings"
    form_fields = Fields(IScoreboardEdit)
    previewname = "scoreboard.highchart.preview.png"

    @property
    def configuration(self):
        default = json.dumps(config.DEFAULTS, indent=2, sort_keys=True)
        return self._data.get('configuration', default)

    @property
    def object_url_json(self):
        return json.dumps(self.context.absolute_url())

    def jsapp_html(self):
        return jsapp_html_for_visualization(self.context)

    def __call__(self, **kwargs):
        if self.request.method == 'POST':
            cfg = json.loads(self.request.form['configuration'])
            cfg_json = json.dumps(cfg, indent=2, sort_keys=True)
            self._data['configuration'] = cfg_json
        return self.index()
