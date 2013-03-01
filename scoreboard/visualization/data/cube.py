from jinja2 import Template
import sparql


dimensions_query = Template("""\
PREFIX qb: <http://purl.org/linked-data/cube#>
SELECT DISTINCT ?dimension_code WHERE {
  ?dataset
    a qb:DataSet ;
    qb:structure ?structure .
  ?structure
    qb:component ?componentSpec .
  ?componentSpec
    qb:dimension ?dimension ;
    qb:order ?componentSpecOrder .
  ?dimension
    skos:notation ?dimension_code .
  FILTER (
    ?dataset = {{ dataset.n3() }}
  )
}
ORDER BY ?componentSpecOrder
LIMIT 100
""")


dimension_options_query = Template("""\
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?option AS ?uri, ?notation, ?label WHERE {
  ?dataset
    a qb:DataSet .
  ?observation
    a qb:Observation ;
    qb:dataSet ?dataset ;
    {%- for n in filters %}
    {%- set n = loop.index %}
    ?filter{{n}}_dimension ?filter{{n}}_option ;
    {%- endfor %}
    ?dimension ?option .
  ?dimension
    skos:notation ?dimension_code .
  {%- for f in filters %}
  {%- set n = loop.index %}
  ?filter{{n}}_dimension
    skos:notation ?filter{{n}}_dimension_code .
  ?filter{{n}}_option
    skos:notation ?filter{{n}}_option_code .
  {%- endfor %}
  ?option
    skos:notation ?notation ;
    skos:prefLabel ?label .
  FILTER (
    ?dataset = {{ dataset.n3() }} &&
    {%- for filter_dimension_code, filter_option_code in filters %}
    {%- set n = loop.index %}
    ?filter{{n}}_dimension_code = {{ filter_dimension_code.n3() }} &&
    ?filter{{n}}_option_code = {{ filter_option_code.n3() }} &&
    {%- endfor %}
    ?dimension_code = {{ dimension_code.n3() }}
  )
}
LIMIT 1000
""")


data_query = Template("""\
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#>
PREFIX dad-prop: <http://semantic.digital-agenda-data.eu/def/property/>
SELECT DISTINCT ?col1, ?value WHERE {
  ?dataset
    a qb:DataSet .
  ?observation
    a qb:Observation ;
    qb:dataSet ?dataset ;
    {%- for n in filters %}
    {%- set n = loop.index %}
    ?filter{{n}}_dimension ?filter{{n}}_option ;
    {%- endfor %}
    dad-prop:ref-area ?ref_area ;
    sdmx-measure:obsValue ?value .
  {%- for f in filters %}
  {%- set n = loop.index %}
  ?filter{{n}}_dimension
    skos:notation ?filter{{n}}_dimension_code .
  ?filter{{n}}_option
    skos:notation ?filter{{n}}_option_code .
  {%- endfor %}
  ?ref_area
    skos:notation ?col1 .
  FILTER (
    {%- for filter_dimension_code, filter_option_code in filters %}
    {%- set n = loop.index %}
    ?filter{{n}}_dimension_code = {{ filter_dimension_code.n3() }} &&
    ?filter{{n}}_option_code = {{ filter_option_code.n3() }} &&
    {%- endfor %}
    ?dataset = {{ dataset.n3() }}
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

    def get_dimension_options(self, dimension, filters=[]):
        data = {
            'dataset': self.dataset,
            'dimension_code': sparql.Literal(dimension),
            'filters': [(sparql.Literal(f), sparql.Literal(v))
                        for f, v in filters],
        }
        query = dimension_options_query.render(**data)
        return [{
            'uri': r[0],
            'notation': r[1],
            'label': r[2],
        } for r in self._execute(query)]

    def get_data(self, columns, filters):
        assert columns[-1] == 'value', "Last column must be 'value'"
        query = data_query.render(**{
            'dataset': self.dataset,
            'columns': columns[:-1],
            'filters': [(sparql.Literal(f), sparql.Literal(v))
                        for f, v in filters],
        })
        return [{
            'ref-area': r[0],
            'value': r[1],
        } for r in self._execute(query)]
