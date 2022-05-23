# homebridge-jvc-projector
> A [Homebridge](https://github.com/nfarina/homebridge) plugin providing power control for JVC projectors over IP

This plugin is a simple wrapper around an existing [Python JVC integration project](https://github.com/bezmi/jvc_projector).

# Installation
1. Install homebridge using: `npm install -g homebridge`
1. Install this plugin: `npm install -g homebridge-jvc-projector`
1. Update your configuration file. See a sample `config.json` snippet below.
1. Ensure `python` is installed and on the path
2. Install the python project: `pip install -e git+https://github.com/bezmi/jvc_projector.git#egg=jvc-projector-remote`

# Configuration
Example `config.json` entry:

```
"accessories": [
    {
        "accessory": "JvcProjectorPower",
        "name": "projector",
        "projector_ip": "192.168.10.10",
        "python_path": "/usr/local/python",
        "poll_interval": 3,
        "connection_delay_interval": 1
    }
]
```
Where:

* `name` is the name for the accessory instance.
* `projector_ip` is the IP of a JVC projector supporting control over Ethernet based IP.
* `python_path` is the path to python for invoking JVC IP API. Default is `/usr/bin/python`.
* `poll_interval` is the polling interval in seconds for the power state. Default is `3`.
* `connection_delay_interval` is the delay in seconds between consecutive connections to the projector. Default is `1`.

# Help etc.

**NOTE**: As projector power on and power off sequences usually take about a minute, if you are toggling the power switch
during this time you will find that the switch state flips back to the previous state. Have patience and allow the projector
time to do what it needs...

If you have a query or problem, raise an issue in GitHub, or better yet submit a PR!

