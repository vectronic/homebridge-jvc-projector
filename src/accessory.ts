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
import { Mutex } from 'async-mutex';
import path from 'path';
import sleep from 'await-sleep';
import { exec } from 'child_process';

let hap: HAP;


class JvcProjectorPower implements AccessoryPlugin {

    private readonly log: Logging;
    private readonly name: string;
    private readonly pythonPath: string;
    private readonly projectorIp: string;
    private readonly projectorPassword: string;
    private readonly setPowerScript: string;
    private readonly getPowerScript: string;
    private readonly pollInterval: number;
    private readonly connectionDelayInterval: number;

    private readonly switchService: Service;
    private readonly informationService: Service;

    private readonly pythonMutex = new Mutex();

    private power = false;

    constructor(log: Logging, config: AccessoryConfig) {
        this.log = log;
        this.name = config.name;

        this.projectorIp = config.projector_ip;
        this.projectorPassword = config.projector_password;
        this.pythonPath = config.python_path || '/usr/bin/python';
        this.pollInterval = config.poll_interval || 3;
        this.connectionDelayInterval = config.connection_delay_interval || 1;

        this.setPowerScript = path.join(__dirname, 'set_power_state.py');
        this.getPowerScript = path.join(__dirname, 'get_power_state.py');

        this.log(`projectorIp: ${this.projectorIp}`);
        if (this.projectorPassword) {
            this.log('projectorPassword is configured');
        }
        this.log(`pythonPath: ${this.pythonPath}`);
        this.log(`setPowerScript: ${this.setPowerScript}`);
        this.log(`getPowerScript: ${this.getPowerScript}`);

        this.switchService = new hap.Service.Switch(this.name);
        this.switchService.getCharacteristic(hap.Characteristic.On)
            .on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
                log.info('Returning projector power: ' + (this.power? 'ON': 'OFF'));
                callback(undefined, this.power);
            })
            .on(CharacteristicEventTypes.SET, async (value: CharacteristicValue, callback: CharacteristicSetCallback) => {

                const newPower = value as boolean;

                log.info('Setting projector power: ' + (newPower ? 'ON': 'OFF'));

                await this.pythonMutex.acquire();
                try {
                    await new Promise((resolve, reject) => {
                        exec(`${this.pythonPath} ${this.setPowerScript} ${this.projectorIp} ${newPower ? 'ON': 'OFF'} ${this.projectorPassword ? this.projectorPassword : ''}`, {},
                            (error, stdout) => {
                                if (error) {
                                    reject(error);
                                    return;
                                }
                                resolve(stdout);
                            });
                    });
                } catch (err) {
                    log.error(`set_power_state exec error: ${err}`);
                    callback(err);
                    return;
                } finally {
                    try {
                        await sleep(this.connectionDelayInterval * 1000);
                    } catch (err) {
                        log.warn(`set_power_state delay error: ${err}`);
                    }
                    this.pythonMutex.release();
                }

                this.power = newPower;

                log.info('Projector power set to: ' + (this.power ? 'ON': 'OFF'));
                callback();
            });

        this.informationService = new hap.Service.AccessoryInformation()
            .setCharacteristic(hap.Characteristic.Manufacturer, 'Vectronic');

        this.startStateTimeout();

        log.info('Projector finished initializing!');
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

    startStateTimeout(): void {

        const stateTimeout = setTimeout(async () => {
            await this.pythonMutex.acquire();
            
            let powerStr;
            try {
                powerStr = await new Promise((resolve, reject) => {
                    exec(`${this.pythonPath} ${this.getPowerScript} ${this.projectorIp} ${this.projectorPassword ? this.projectorPassword : ''}`, {},
                        (error, stdout) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve(stdout);
                        });
                });
                const actualPower = powerStr.toString().startsWith('ON');
                
                if (actualPower !== this.power) {
                    this.power = actualPower;

                    this.switchService.getCharacteristic(hap.Characteristic.On).updateValue(this.power);

                    this.log.info('Projector power state updated to: ' + (this.power ? 'ON': 'OFF'));
                }
            } catch (err) {
                this.log.error(`stateTimeout error: ${err}`);
            } finally {
                try {
                    await sleep(this.connectionDelayInterval * 1000);
                } catch (err) {
                    this.log.warn(`state timeout delay error: ${err}`);
                }
                this.pythonMutex.release();
            }

            this.startStateTimeout();
        }, this.pollInterval * 1000);

        stateTimeout.unref();
    }
}

/*
 * Initializer function called when the plugin is loaded.
 */
export = (api: API) => {
    hap = api.hap;
    api.registerAccessory('JvcProjectorPower', JvcProjectorPower);
};
