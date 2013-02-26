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


dimension_values_query = Template("""\
PREFIX qb: <http://purl.org/linked-data/cube#>
Prefix skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?value, ?notation, ?label WHERE {
?dataset
  a qb:DataSet .
?observation
  a qb:Observation ;
  qb:dataSet ?dataset ;
  ?dimension ?value .
?value
  skos:notation ?notation ;
  skos:prefLabel ?label .
  FILTER (
    ?dataset = {{ dataset.n3() }} &&
    ?dimension = {{ dimension.n3() }}
  )
}
LIMIT 1000
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

    def get_dimension_values(self, dimension):
        query = dimension_values_query.render(dataset=self.dataset,
                                              dimension=sparql.IRI(dimension))
        return [{
            'value': r[0],
            'notation': r[1],
            'label': r[2],
        } for r in self._execute(query)]
