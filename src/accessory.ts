import {
    AccessoryConfig,
    AccessoryPlugin,
    API,
    CharacteristicEventTypes,
    CharacteristicGetCallback,
    CharacteristicSetCallback,
    CharacteristicValue,
    HAP,
    Logging,
    Service
} from 'homebridge';

import path from 'path';
import { exec } from 'child_process';

let hap: HAP;


class JvcProjectorStandby implements AccessoryPlugin {

    private readonly log: Logging;
    private readonly name: string;
    private readonly pythonPath: string;
    private readonly projectorIp: string;
    private readonly standbyScript: string;

    private switchOn = false;
    private readonly switchService: Service;
    private readonly informationService: Service;

    constructor(log: Logging, config: AccessoryConfig) {
        this.log = log;
        this.name = config.name;

        this.projectorIp = config.projector_ip;
        this.pythonPath = config.python_path || '/usr/bin/python';
        this.standbyScript = path.join(__dirname, 'standby.py');

        this.log(`projectorIp: ${this.projectorIp}`);
        this.log(`pythonPath: ${this.pythonPath}`);
        this.log(`standbyScript: ${this.standbyScript}`);

        this.switchService = new hap.Service.Switch(this.name);
        this.switchService.getCharacteristic(hap.Characteristic.On)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                log.info('Current state of the switch was returned: ' + (this.switchOn? 'ON': 'OFF'));
                callback(undefined, this.switchOn);
            })
            .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {

                this.switchOn = value as boolean;

                log.info('Setting switch state to: ' + (this.switchOn? 'ON': 'OFF'));

                exec(`${this.pythonPath} ${this.standbyScript} ${this.projectorIp} ${
                    this.switchOn? 'ON': 'OFF'}`, (error, stdout, stderr) => {
                    log.debug(`standby stdout: ${stdout}`);
                    log.debug(`standby stderr: ${stderr}`);

                    if (error) {
                        log.error(`standby exec error: ${error}`);
                        callback(error);
                        return;
                    }

                    log.info('Switch state set to: ' + (this.switchOn? 'ON': 'OFF'));
                    callback();
                });
            });

        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'Vectronic');

        log.info('Switch finished initializing!');
    }

    identify(): void {
        this.log('Identify!');
    }

    getServices(): Service[] {
        return [
            this.informationService,
            this.switchService
        ];
    }
}

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
    hap = api.hap;
    api.registerAccessory('JvcProjectorStandby', JvcProjectorStandby);
};
