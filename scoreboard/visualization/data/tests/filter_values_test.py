def query(*args, **kwargs):
    from scoreboard.visualization.data.filters import prepare_facet_query
    return prepare_facet_query(*args, **kwargs)


def test_select_facet():
    assert "SELECT DISTINCT ?indicator WHERE" in query('indicator')
    assert "SELECT DISTINCT ?year_label WHERE" in query('year_label')


def test_one_constraint():
    assert ("FILTER (str(?year_label) = '2005')"
            in query('indicator', year_label='2005'))


def test_two_constraints():
    assert ("FILTER (str(?year_label) = '2005' && str(?unit) = '%_pop')"
            in query('indicator', year_label='2005', unit='%_pop'))
