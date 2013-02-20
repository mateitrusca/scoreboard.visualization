from jinja2 import Template


query_template = Template("""\
PREFIX prop: <http://data.lod2.eu/scoreboard/properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT DISTINCT ?{{ facet }} WHERE {

?observation
    prop:indicator ?indicator ;
    prop:year ?year ;
    prop:unit ?unit ;
    prop:country ?country ;
    a qb:Observation .

?year
    rdfs:label ?year_label .

?country
    rdfs:label ?country_label .

}

{% if constraints %}
FILTER (
  {%- for name, value in constraints.iteritems() -%}
    str(?{{ name }}) = '{{ value }}'
    {%- if not loop.last %} && {% endif -%}
  {%- endfor -%}
)
{% endif %}

LIMIT 1000
""")


def prepare_facet_query(facet, **constraints):
    # TODO constraint string quoting
    return query_template.render(facet=facet, constraints=constraints)
