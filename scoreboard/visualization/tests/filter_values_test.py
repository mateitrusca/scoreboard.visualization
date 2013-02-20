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

LIMIT 1000
""")


def prepare_query(facet, **constraints):
    return query_template.render(facet=facet)


def test_select_facet():
    assert "SELECT DISTINCT ?indicator WHERE" in prepare_query('indicator')
    assert "SELECT DISTINCT ?year_label WHERE" in prepare_query('year_label')
