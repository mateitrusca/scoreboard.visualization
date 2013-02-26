from jinja2 import Template
import sparql


dimensions_query = Template("""\
PREFIX qb: <http://purl.org/linked-data/cube#>
SELECT ?dimension WHERE {
?dataset
  a qb:DataSet ;
  qb:structure ?structure .
?structure
  qb:component ?componentSpec .
?componentSpec
  qb:dimension ?dimension ;
  qb:order ?componentSpecOrder .
  FILTER (
    ?dataset = {{ dataset.n3() }}
  )
}
ORDER BY ?componentSpecOrder
LIMIT 100
""")


class Cube(object):

    def __init__(self, endpoint, dataset):
        self.endpoint = endpoint
        self.dataset = sparql.IRI(dataset)

    def _execute(self, query):
        res = sparql.query(self.endpoint, query)
        return (sparql.unpack_row(r) for r in res)

    def get_dimensions(self):
        query = dimensions_query.render(dataset=self.dataset)
        return [r[0] for r in self._execute(query)]
