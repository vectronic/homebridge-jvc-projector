# homebridge-jvc-projector

> A [Homebridge](https://homebridge.io) plugin providing power control for JVC projectors over IP

## Prerequisites

1. Python 3.8 or higher
1. Install the package `JVC Projector Remote`:

```console
$ python3 -m pip install jvc-projector-remote
```

## Installation

1. Install this plugin using the Homebridge Config UI X or via commandline `npm install -g homebridge-jvc-projector`
1. Setup the plugin's configuration

> **NOTE** If you have both Python 2 and Python 3 installed, make sure you set the correct path to Python 3 in the config of this plugin.

## Configuration

| Property                  | Description                                                              | Default         |
| ------------------------- | ------------------------------------------------------------------------ | --------------- |
| name                      | the name for the accessory instance                                      |                 |
| projector_ip              | IP address of a JVC projector with support for Ethernet/IP based control |                 |
| projector_password        | optional network password for the JVC projector                          |                 |
| python_path               | the path to python binary (v3!)                                          | /usr/bin/python |
| poll_interval             | polling interval in seconds for the power state                          | 3               |
| connection_delay_interval | delay in seconds between consecutive connections to the projector        | 1               |

Example `config.json` entry:

```json
"accessories": [
    {
        "accessory": "JvcProjectorPower",
        "name": "projector",
        "projector_ip": "192.168.10.10",
        "projector_password": "xxx",
        "python_path": "/usr/local/python",
        "poll_interval": 3,
        "connection_delay_interval": 1
    }
]
```

## Help

> **NOTE**: As projector power on and power off sequences usually take about a minute, if you are toggling the power switch during this time you will find that the switch state flips back to the previous state. Have patience and allow the projector time to do what it needs...

If you have a query or problem, raise an issue in GitHub, or better yet submit a PR!
