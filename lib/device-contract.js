'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// deviceNet specifc classes
const Device = require('./device.js');
const DeviceList = require('./device-list.js');

/**
 * A custom context provides easy access to list of all devices
 */
class DeviceContext extends Context {

    constructor() {
        super();
        // All devices are held in a list of devices
        this.deviceList = new DeviceList(this);
    }

}

/**
 * Define device smart contract by extending Fabric Contract class
 *
 */
class DeviceContract extends Contract {

    constructor() {
        // Unique name when multiple contracts per chaincode file
        super('org.devicenet.devicecontract');
    }

    /**
     * Define a custom context for device
    */
    createContext() {
        return new DeviceContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this case
        // It could be where data migration is performed, if necessary
        console.log('Contract instantiated');
    }



    /**
     * Issue device onto the blockchain
     *
     * @param {Context} ctx the transaction context
     * @param {String} deviceBlockchainAddress device's blockchain address
     * @param {String} ownerBlockchainAddress owner's blockchain address
     * @param {String} attributesHash unique hash of the device
     * @param {String} firstBlockNumber block number of device's first state creation
     * @param {String} lastBlockNumber block number of last device state change
     * @param {Object} identityFlag flag of several device statuses
    */
    async issue(ctx, deviceBlockchainAddress, ownerBlockchainAddress, attributesHash,
        firstBlockNumber, lastBlockNumber, identityFlag) {

        // create an instance of the device
        let device = Device.createInstance(deviceBlockchainAddress, ownerBlockchainAddress, attributesHash,
            firstBlockNumber, lastBlockNumber, identityFlag);

        // Add the device to the list of all similar devices in the ledger world state
        await ctx.deviceList.addDevice(device);

        // Must return a serialized device to caller of smart contract
        return device;
    }



}

module.exports = DeviceContract;
