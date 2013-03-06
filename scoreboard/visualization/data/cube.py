import urllib2
import os
import logging
import jinja2
import sparql

SPARQL_DEBUG = bool(os.environ.get('SPARQL_DEBUG') == 'on')

logger = logging.getLogger(__name__)


class QueryError(Exception):
    pass


sparql_templates = {}


sparql_templates['bits'] = """\
{%- set group_dimensions = ['indicator-group', 'breakdown-group'] -%}
{% macro one_filter(prefix, dimension_code, option_code) %}
  ?observation
    ?{{ prefix }}_dimension ?{{ prefix }}_option .

  {%- if dimension_code.value in group_dimensions %}
  ?{{ prefix }}_dimension
    dad-prop:grouped-using ?{{ prefix }}_dimension_group .
  ?{{ prefix }}_dimension_group
    skos:notation ?{{ prefix }}_dimension_group_code .
  ?{{ prefix }}_option
    dad-prop:membership [
      dad-prop:member-of ?{{ prefix }}_option_group ] .
  ?{{ prefix }}_option_group
    skos:notation ?{{ prefix }}_option_group_code .
  FILTER (
    ?{{ prefix }}_dimension_group_code = {{ dimension_code.n3() }} &&
    ?{{ prefix }}_option_group_code = {{ option_code.n3() }}
  )

  {%- else %}
  ?{{ prefix }}_dimension
    skos:notation ?{{ prefix }}_dimension_code .
  ?{{ prefix }}_option
    skos:notation ?{{ prefix }}_option_code .
  FILTER (
    ?{{ prefix }}_dimension_code = {{ dimension_code.n3() }} &&
    ?{{ prefix }}_option_code = {{ option_code.n3() }}
  )

  {%- endif %}
{% endmacro %}
"""


sparql_templates['dimensions'] = """\
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dad-prop: <http://semantic.digital-agenda-data.eu/def/property/>
SELECT DISTINCT ?notation, ?group_notation WHERE {
  ?dataset
    a qb:DataSet ;
    qb:structure ?structure .
  ?structure
    qb:component ?componentSpec .
  ?componentSpec
    qb:dimension ?dimension ;
    qb:order ?componentSpecOrder .
  ?dimension
    skos:notation ?notation .
  OPTIONAL {
    ?dimension
      dad-prop:grouped-using ?group .
    ?group
      skos:notation ?group_notation .
  }
  FILTER (
    ?dataset = {{ dataset.n3() }}
  )
}
ORDER BY ?componentSpecOrder
LIMIT 100
"""


sparql_templates['dimension_options'] = """\
{%- set group_dimensions = ['indicator-group', 'breakdown-group'] -%}
{%- from 'bits' import one_filter -%}
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX dad-prop: <http://semantic.digital-agenda-data.eu/def/property/>
SELECT DISTINCT ?uri, ?notation, ?label WHERE {
  ?dataset
    a qb:DataSet .
  ?observation
    a qb:Observation ;
    qb:dataSet ?dataset ;
    ?dimension ?option .
  FILTER (
    ?dataset = {{ dataset.n3() }}
  )

{%- for f_dimension_code, f_option_code in filters %}
  {{ one_filter('filter_%d' % loop.index, f_dimension_code, f_option_code) }}
{%- endfor %}

  {%- if dimension_code.value in group_dimensions %}
  ?dimension
    dad-prop:grouped-using ?dimension_group .
  ?dimension_group
    skos:notation ?dimension_code .
  ?option
    dad-prop:membership [
      dad-prop:member-of ?option_group ] .
  ?option_group
    skos:notation ?notation ;
    skos:prefLabel ?label .
  FILTER (
    ?dimension_code = {{ dimension_code.n3() }} &&
    ?option_group = ?uri
  )

  {%- else %}
  ?dimension
    skos:notation ?dimension_code .
  ?option
    skos:notation ?notation ;
    skos:prefLabel ?label .
  FILTER (
    ?dimension_code = {{ dimension_code.n3() }} &&
    ?option = ?uri
  )

  {%- endif %}
}
LIMIT 100
"""


sparql_templates['data'] = """\
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#>
PREFIX dad-prop: <http://semantic.digital-agenda-data.eu/def/property/>
SELECT DISTINCT {% for f in columns %} {%- set n = loop.index -%}
                ?col{{n}}, {% endfor -%} ?value WHERE {
  ?dataset
    a qb:DataSet .
  ?observation
    a qb:Observation ;
    qb:dataSet ?dataset ;
    {%- for f in filters %} {%- set n = loop.index %}
    ?filter{{n}}_dimension ?filter{{n}}_option ;
    {%- endfor %}
    {%- for c in columns %} {%- set n = loop.index %}
    ?col{{n}}_dimension ?col{{n}}_option ;
    {%- endfor %}
    sdmx-measure:obsValue ?value .
  {%- for f in filters %} {%- set n = loop.index %}
  ?filter{{n}}_dimension
    skos:notation ?filter{{n}}_dimension_code .
  ?filter{{n}}_option
    skos:notation ?filter{{n}}_option_code .
  {%- endfor %}
  {%- for c in columns %} {%- set n = loop.index %}
  ?col{{n}}_dimension
    skos:notation ?col{{n}}_dimension_code .
  ?col{{n}}_option
    skos:notation ?col{{n}} .
  {%- endfor %}
  FILTER (
    {%- for dimension_code, option_code in filters %} {%- set n = loop.index %}
    ?filter{{n}}_dimension_code = {{ dimension_code.n3() }} &&
    ?filter{{n}}_option_code = {{ option_code.n3() }} &&
    {%- endfor %}
    {%- for c in columns %} {%- set n = loop.index %}
    ?col{{n}}_dimension_code = {{ c.n3() }} &&
    {%- endfor %}
    ?dataset = {{ dataset.n3() }}
  )
}
LIMIT 1000
"""


sparql_env = jinja2.Environment(loader=jinja2.DictLoader(sparql_templates))


class Cube(object):

    def __init__(self, endpoint, dataset):
        self.endpoint = endpoint
        self.dataset = sparql.IRI(dataset)

    def _execute(self, query, as_dict=False):
        if SPARQL_DEBUG:
            logger.info('Running query: \n%s', query)
        try:
            res = sparql.query(self.endpoint, query)
        except urllib2.HTTPError, e:
            if 400 <= e.code < 600:
                raise QueryError(e.fp.read())
            else:
                raise
        rv = (sparql.unpack_row(r) for r in res)
        if as_dict:
            return (dict(zip(res.variables, r)) for r in rv)
        else:
            return rv

    def get_dimensions(self):
        query = sparql_env.get_template('dimensions').render(**{
            'dataset': self.dataset,
        })
        return list(self._execute(query, as_dict=True))

    def get_dimension_options(self, dimension, filters=[]):
        query = sparql_env.get_template('dimension_options').render(**{
            'dataset': self.dataset,
            'dimension_code': sparql.Literal(dimension),
            'filters': [(sparql.Literal(f), sparql.Literal(v))
                        for f, v in filters],
        })
        return list(self._execute(query, as_dict=True))

    def get_data(self, columns, filters):
        assert columns[-1] == 'value', "Last column must be 'value'"
        query = sparql_env.get_template('data').render(**{
            'dataset': self.dataset,
            'columns': [sparql.Literal(c) for c in columns[:-1]],
            'filters': [(sparql.Literal(f), sparql.Literal(v))
                        for f, v in filters],
        })
        for row in self._execute(query):
            yield dict(zip(columns, row))
