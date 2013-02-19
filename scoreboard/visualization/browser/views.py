class TestsView(object):

    def __call__(self):
        from scoreboard.visualization.old.views import render_template
        return render_template('tests.html', URL=self.context.absolute_url())
