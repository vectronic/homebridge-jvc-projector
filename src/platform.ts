import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';

import { JvcProjectorAccessory } from './platformAccessory.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

export class JvcProjectorPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;

  public readonly accessories: Map<string, PlatformAccessory> = new Map();

  constructor(
    public readonly log: Logging,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    this.api.on('didFinishLaunching', () => {
      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.set(accessory.UUID, accessory);
  }

  discoverDevices() {
    const projectorIp = this.config.projector_ip;
    if (!projectorIp) {
      this.log.error('No projector_ip configured');
      return;
    }

    const uuid = this.api.hap.uuid.generate(projectorIp);
    const existingAccessory = this.accessories.get(uuid);

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
      new JvcProjectorAccessory(this, existingAccessory);
    } else {
      this.log.info('Adding new accessory:', this.config.name || 'JVC Projector');
      const accessory = new this.api.platformAccessory(this.config.name || 'JVC Projector', uuid);
      accessory.context.config = {
        projector_ip: this.config.projector_ip,
        projector_password: this.config.projector_password,
        python_path: this.config.python_path,
        poll_interval: this.config.poll_interval,
        connection_delay_interval: this.config.connection_delay_interval,
      };
      new JvcProjectorAccessory(this, accessory);
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }

    // Remove stale cached accessories
    for (const [cachedUuid, cachedAccessory] of this.accessories) {
      if (cachedUuid !== uuid) {
        this.log.info('Removing stale accessory from cache:', cachedAccessory.displayName);
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [cachedAccessory]);
      }
    }
  }
}
