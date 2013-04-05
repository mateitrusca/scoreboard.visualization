""" Edit
"""
import json
from zope.formlib.form import Fields
from scoreboard.visualization.views.scoreboard.interfaces import IScoreboardEdit
from eea.app.visualization.views.edit import EditForm

class Edit(EditForm):
    """ Edit tabular view
    """
    label = u"Scoreboard View settings"
    form_fields = Fields(IScoreboardEdit)
    previewname = "scoreboard.highchart.preview.png"

    @property
    def configuration(self):
        return self._data.get('configuration', '{}')

    def __call__(self, **kwargs):
        return self.index()
