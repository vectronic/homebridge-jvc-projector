from jvc_projector import JVCProjector
import sys

if len(sys.argv) != 2:
    print('Usage: python ./get_power_state.py <projector_ip>')
else:

    projectorIp = sys.argv[1]

    projector = JVCProjector(projectorIp)

    if projector.is_on():
        print('ON')
    else:
        print('OFF')

