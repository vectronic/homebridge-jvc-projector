from jvc_projector import JVCProjector
import sys

if len(sys.argv) != 3:
    print('Usage: python ./set_power_state.py <projector_ip> [ON|OFF]')
else:

    projectorIp = sys.argv[1]
    powerState = sys.argv[2]

    projector = JVCProjector(projectorIp)

    if powerState == "ON":
        projector.power_on()
    else:
        projector.power_off()

