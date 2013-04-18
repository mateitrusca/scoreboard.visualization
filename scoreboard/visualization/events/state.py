from scoreboard.visualization.interfaces import IScoreboardVisualization
from edw.datacube.interfaces import IDataCube
from Products.CMFCore.utils import getToolByName


def datacube_unpublished(obj):
    wft =  getToolByName(obj, 'portal_workflow')
    related = obj.getBRefs()
    for item in related:
        if IScoreboardVisualization.providedBy(item):
            wft.doActionFor(item, 'retract')

def datacube_handler(obj, evt):
    if evt.action == 'retract':
        datacube_unpublished(obj)

def handler(obj, evt):
    if IDataCube.providedBy(obj):
        datacube_handler(obj, evt)
