import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { JvcProjectorPlatform } from './platform.js';

import { Mutex } from 'async-mutex';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { setTimeout as sleep } from 'timers/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class JvcProjectorAccessory {
  private readonly switchService: Service;

  private readonly projectorIp: string;
  private readonly projectorPassword: string;
  private readonly pythonPath: string;
  private readonly pollInterval: number;
  private readonly connectionDelayInterval: number;

  private readonly setPowerScript: string;
  private readonly getPowerScript: string;

  private readonly pythonMutex = new Mutex();

  private power = false;

  constructor(
    private readonly platform: JvcProjectorPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    const config = accessory.context.config || platform.config;

    this.projectorIp = config.projector_ip;
    this.projectorPassword = config.projector_password || '';
    this.pythonPath = config.python_path || '/usr/bin/python';
    this.pollInterval = config.poll_interval || 3;
    this.connectionDelayInterval = config.connection_delay_interval || 1;

    this.setPowerScript = path.join(__dirname, 'set_power_state.py');
    this.getPowerScript = path.join(__dirname, 'get_power_state.py');

    this.platform.log.info(`projectorIp: ${this.projectorIp}`);
    if (this.projectorPassword) {
      this.platform.log.info('projectorPassword is configured');
    }
    this.platform.log.info(`pythonPath: ${this.pythonPath}`);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Vectronic')
      .setCharacteristic(this.platform.Characteristic.Model, 'JVC Projector')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, this.projectorIp);

    this.switchService = this.accessory.getService(this.platform.Service.Switch)
      || this.accessory.addService(this.platform.Service.Switch);

    this.switchService.setCharacteristic(this.platform.Characteristic.Name, accessory.displayName);

    this.switchService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.getOn.bind(this))
      .onSet(this.setOn.bind(this));

    this.startStatePolling();
  }

  async getOn(): Promise<CharacteristicValue> {
    this.platform.log.info('Returning projector power: ' + (this.power ? 'ON' : 'OFF'));
    return this.power;
  }

  async setOn(value: CharacteristicValue) {
    const newPower = value as boolean;
    this.platform.log.info('Setting projector power: ' + (newPower ? 'ON' : 'OFF'));

    await this.pythonMutex.acquire();
    try {
      await new Promise<string>((resolve, reject) => {
        exec(
          `${this.pythonPath} ${this.setPowerScript} ${this.projectorIp} ${newPower ? 'ON' : 'OFF'} ${this.projectorPassword}`.trim(),
          {},
          (error, stdout) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(stdout);
          },
        );
      });
      this.power = newPower;
      this.platform.log.info('Projector power set to: ' + (this.power ? 'ON' : 'OFF'));
    } catch (err) {
      this.platform.log.error(`set_power_state exec error: ${err}`);
      throw err;
    } finally {
      try {
        await sleep(this.connectionDelayInterval * 1000);
      } catch (err) {
        this.platform.log.warn(`set_power_state delay error: ${err}`);
      }
      this.pythonMutex.release();
    }
  }

  startStatePolling() {
    const timeout = setTimeout(async () => {
      await this.pythonMutex.acquire();
      try {
        const powerStr = await new Promise<string>((resolve, reject) => {
          exec(
            `${this.pythonPath} ${this.getPowerScript} ${this.projectorIp} ${this.projectorPassword}`.trim(),
            {},
            (error, stdout) => {
              if (error) {
                reject(error);
                return;
              }
              resolve(stdout);
            },
          );
        });
        const actualPower = powerStr.toString().startsWith('ON');

        if (actualPower !== this.power) {
          this.power = actualPower;
          this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(this.power);
          this.platform.log.info('Projector power state updated to: ' + (this.power ? 'ON' : 'OFF'));
        }
      } catch (err) {
        this.platform.log.error(`stateTimeout error: ${err}`);
      } finally {
        try {
          await sleep(this.connectionDelayInterval * 1000);
        } catch (err) {
          this.platform.log.warn(`state timeout delay error: ${err}`);
        }
        this.pythonMutex.release();
      }

      this.startStatePolling();
    }, this.pollInterval * 1000);

    timeout.unref();
  }
}
