from jvc_projector import JVCProjector
import sys

if len(sys.argv) != 3 and len(sys.argv) != 4:
    print('Usage: python ./set_power_state.py <projector_ip> <ON|OFF> [projector_password]')
else:

    projectorIp = sys.argv[1]
    powerState = sys.argv[2]

    if len(sys.argv) == 4:
        projectorPassword = sys.argv[3]
        projector = JVCProjector(projectorIp, projectorPassword)
    else:
        projector = JVCProjector(projectorIp)

    if powerState == "ON":
        projector.power_on()
    else:
        projector.power_off()
