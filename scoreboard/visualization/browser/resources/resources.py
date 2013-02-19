""" CSS/JS resources provided by this package
"""
from zope.interface import implements
from eea.app.visualization.interfaces import IVisualizationViewResources
from eea.app.visualization.interfaces import IVisualizationEditResources

class ViewResources(object):
    """ Resources to be used in view mode
    """
    implements(IVisualizationViewResources)

    @property
    def extcss(self):
        """ Required CSS resources
        """
        return []

    @property
    def css(self):
        """ CSS resources
        """
        return [
            '++resource++scoreboard.visualization.view.css',
        ]

    @property
    def extjs(self):
        """ Required JS resources
        """
        return []

    @property
    def js(self):
        """ JS resources
        """
        return [
            '++resource++scoreboard.visualization.view.js',
        ]

class EditResources(object):
    """ Resources to be used in edit mode
    """
    implements(IVisualizationEditResources)

    @property
    def extcss(self):
        """ Required CSS resources
        """
        return []

    @property
    def css(self):
        """ CSS resources
        """
        return [
            '++resource++scoreboard.visualization.edit.css',
        ]

    @property
    def extjs(self):
        """ Required JS resources
        """
        return []

    @property
    def js(self):
        """ JS resources
        """
        return [
            '++resource++scoreboard.visualization.edit.js',
        ]
