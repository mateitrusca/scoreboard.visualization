from jinja2 import Template


query_template = Template("""\
PREFIX prop: <http://data.lod2.eu/scoreboard/properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX country: <http://data.lod2.eu/scoreboard/country/>

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


def prepare_query(facet, **constraints):
    return query_template.render(facet=facet, constraints=constraints)


def test_select_facet():
    assert "SELECT DISTINCT ?indicator WHERE" in prepare_query('indicator')
    assert "SELECT DISTINCT ?year_label WHERE" in prepare_query('year_label')


def test_one_constraint():
    assert ("FILTER (str(?year_label) = '2005')"
            in prepare_query('indicator', year_label='2005'))


def test_two_constraints():
    assert ("FILTER (str(?year_label) = '2005' && str(?unit) = '%_pop')"
            in prepare_query('indicator', year_label='2005', unit='%_pop'))
