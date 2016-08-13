"""Testing OSC communication with recurse-connector
"""
import argparse
import random
import time

from pythonosc import osc_message_builder
from pythonosc import udp_client
from pythonosc import dispatcher
from pythonosc import osc_server


def intervals_handler(unused_addr, args):
	print("Received intervals:", "".join(args))

dispatcher = dispatcher.Dispatcher()
dispatcher.map("/recurse/intervals", intervals_handler)

server = osc_server.ThreadingOSCUDPServer(("127.0.0.1", 8008), dispatcher)
client = udp_client.UDPClient("127.0.0.1", 8009)

msg = osc_message_builder.OscMessageBuilder(address="/recurse/getintervals")
msg = msg.build()
print("Sending", msg.dgram)
client.send(msg)

print("Waiting up to 5 secs for reply at {}".format(server.server_address))
server.timeout = 5;
#server.serve_forever()
server.handle_request()
