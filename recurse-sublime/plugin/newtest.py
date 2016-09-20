from osc4py3.as_eventloop import *
from osc4py3 import oscbuildparse
import time

def handlerfunction(args):
    print("Received intervals:", "".join(args))

# Start the system.
osc_startup()

# Make client channels to send packets.
osc_udp_client("127.0.0.1", 8009, "sender")
# Make server channels to receive packets.
osc_udp_server("127.0.0.1", 8008, "receiver")

# Associate Python functions with message address patterns, using default
# argument scheme OSCARG_DATAUNPACK.
osc_method("/recurse/intervals", handlerfunction)
# Build a message with autodetection of data types, and send it.
msg = oscbuildparse.OSCMessage("/recurse/getintervals", None, [])
osc_send(msg, "sender")

print("Doing OSC processing for 1 second")
targettime = time.time() + 1
while time.time() < targettime:
	osc_process()

print("Finished OSC loop")

# Properly close the system.
osc_terminate()