class TestsView(object):

    def __call__(self):
        from scoreboard.visualization.old.views import render_template
        old_context = self.context.restrictedTraverse('/scoreboard')
        return render_template('tests.html', URL=old_context.absolute_url())
