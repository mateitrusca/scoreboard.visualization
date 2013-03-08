import pytest


def sparql_test(func):
    return pytest.mark.skipif("os.environ.get('SBTEST_SPARQL') != 'on'")(func)


def create_cube():
    from scoreboard.visualization.data.cube import Cube
    from scoreboard.visualization.views.scoreboard import data
    dataset = 'http://semantic.digital-agenda-data.eu/dataset/scoreboard'
    return Cube(data.SPARQL_ENDPOINT, dataset)
