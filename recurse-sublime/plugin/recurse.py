import sublime, sublime_plugin
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "osc4py3-1.0.1"))

from osc4py3.as_eventloop import *
from osc4py3 import oscbuildparse
import time

class A(object): pass

a = A()
a.value = ""

def handlerfunction(args):
	a.value = "".join(args)

def plugin_loaded():
	osc_startup()
	osc_udp_client("127.0.0.1", 8009, "sender")
	osc_udp_server("127.0.0.1", 8008, "receiver")
	osc_method("/recurse/intervals", handlerfunction)

def plugin_unloaded():
	osc_terminate()

class GetclipdrumCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		msg = oscbuildparse.OSCMessage("/recurse/getintervalsdrum", None, [])
		osc_send(msg, "sender")

		targettime = time.time() + 1
		while time.time() < targettime and a.value == "":
			osc_process()

		for pos in self.view.sel():
			self.view.insert(edit, pos.begin(), a.value)

		a.value = "";

class GetclipcompactCommand(sublime_plugin.TextCommand):
	def run(self, edit):
		msg = oscbuildparse.OSCMessage("/recurse/getintervalscompact", None, [])
		osc_send(msg, "sender")

		targettime = time.time() + 1
		while time.time() < targettime and a.value == "":
			osc_process()

		for pos in self.view.sel():
			self.view.insert(edit, pos.begin(), a.value)

		a.value = "";
