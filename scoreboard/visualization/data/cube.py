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
    {%- for f in filters %}
    {%- set n = loop.revindex %}
    ?filter{{n}} ?filter{{n}}_value ;
    {%- endfor %}
    ?dimension ?value .
  ?value
    skos:notation ?notation ;
    skos:prefLabel ?label .
  FILTER (
    ?dataset = {{ dataset.n3() }} &&
    {%- for filter, filter_value in filters %}
    {%- set n = loop.revindex %}
    ?filter{{n}} = {{ filter.n3() }} &&
    ?filter{{n}}_value = {{ filter_value.n3() }} &&
    {%- endfor %}
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

    def get_dimension_values(self, dimension, filters=[]):
        data = {
            'dataset': self.dataset,
            'dimension': sparql.IRI(dimension),
            'filters': [(sparql.IRI(f), sparql.IRI(v)) for f, v in filters],
        }
        query = dimension_values_query.render(**data)
        return [{
            'value': r[0],
            'notation': r[1],
            'label': r[2],
        } for r in self._execute(query)]
