""" Monkey patch for sparql_client to always send quesries as POST
"""
import sparql
from sparql import Service as BasedService
from sparql import _Query
import copy

class PatchedService(BasedService):

    def createQuery(self):
        q = _Query(self)
        q._setMethod('POST') # PATCH
        q._default_graphs = copy.deepcopy(self._default_graphs)
        q._headers_map = copy.deepcopy(self._headers_map)
        q._named_graphs = copy.deepcopy(self._named_graphs)
        q._prefix_map = copy.deepcopy(self._prefix_map)
        return q

sparql.Service = PatchedService
