import sublime, sublime_plugin

class RecurseCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		for pos in self.view.sel():
			self.view.insert(edit, pos.begin(), "Hello there!")