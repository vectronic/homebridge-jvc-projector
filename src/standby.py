from jvc_projector import JVCProjector
import sys

if len(sys.argv) != 3:
    print('Usage: python ./standby.py <projector_ip> [ON|OFF]')
else:

    projectorIp = sys.argv[1]
    standby = sys.argv[2]

    projector = JVCProjector(projectorIp)

    if standby == "ON":
        projector.power_on()
    else:
        projector.power_off()

