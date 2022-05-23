from jvc_projector import JVCProjector
import sys

if len(sys.argv) != 2 and len(sys.argv) != 3:
    print('Usage: python ./get_power_state.py <projector_ip> [projector_password]')
else:

    projectorIp = sys.argv[1]

    if len(sys.argv) == 3:
        projectorPassword = sys.argv[2]
        projector = JVCProjector(projectorIp, projectorPassword)
    else:
        projector = JVCProjector(projectorIp)

    if projector.is_on():
        print('ON')
    else:
        print('OFF')
