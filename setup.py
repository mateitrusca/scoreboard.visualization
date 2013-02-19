""" This module contains the tool of scoreboard.visualization
"""
import os
from setuptools import setup, find_packages


def read(*rnames):
    """ Read """
    return open(os.path.join(os.path.dirname(__file__), *rnames)).read()

NAME = 'scoreboard.visualization'
PATH = NAME.split('.') + ['version.txt']
VERSION = read(*PATH)

long_description = (
    read('README.txt')
    + '\n' +
    'Change history\n'
    '**************\n'
    + '\n' +
    read('CHANGES.txt')
    + '\n' +
    'Detailed Documentation\n'
    '**********************\n'
    + '\n' +
    read('scoreboard', 'visualization', 'README.txt')
    + '\n' +
    'Contributors\n'
    '************\n'
    + '\n' +
    read('CONTRIBUTORS.txt')
    + '\n' +
    'Download\n'
    '********\n')

tests_require = ['zope.testing']

setup(name=NAME,
      version=VERSION,
      description="Scoreboard Visualization",
      long_description=long_description,
      # Get more strings from
      # http://pypi.python.org/pypi?:action=list_classifiers
      classifiers=[
        'Framework :: Plone',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: GNU General Public License (GPL)',
        ],
      keywords='daviz plone zope',
      author='Eau de Web',
      author_email='office@eaudeweb.ro',
      url='http://github.com/eaudeweb',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['scoreboard', ],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'edw.highcharts',
          'eea.app.visualization',
          # -*- Extra requirements: -*-
          ],
      tests_require=tests_require,
      extras_require=dict(tests=tests_require),
      test_suite='scoreboard.visualization.tests.test_docs.test_suite',
      entry_points="""
      # -*- entry_points -*-
      [z3c.autoinclude.plugin]
      target = plone
      """,
      )
