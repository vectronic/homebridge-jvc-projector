# homebridge-jvc-projector
> A [Homebridge](https://github.com/nfarina/homebridge) plugin providing standby control for JVC projectors over IP

This plugin is a simple wrapper around an existing [Python JVC integration project](https://github.com/bezmi/jvc_projector).

# Installation
1. Install homebridge using: `npm install -g homebridge`
1. Install this plugin: `npm install -g homebridge-jvc-projector`
1. Update your configuration file. See a sample `config.json` snippet below.
1. Ensure `python` is installed and on the path
2. Install the python project: `pip install jvc_projector_remote`

# Configuration
Example `config.json` entry:

```
"platforms": [
    {
        "platform": "JVCProjector",
        "projector_ip": "192.168.10.10",
        "python_path": "/usr/local/python"
    }
]
```
Where:

* `projector_ip` is the IP of a JVC projector supporting control over Ethernet based IP.
* `python_path` is the path to python for invoking JVC IP API. Default is `/usr/bin/python`.

# Help etc.

If you have a query or problem, raise an issue in GitHub, or better yet submit a PR!

