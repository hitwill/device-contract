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

    /**
     * Buy device
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer device issuer
     * @param {Integer} deviceNumber device number for this issuer
     * @param {String} currentOwner current owner of device
     * @param {String} newOwner new owner of device
     * @param {Integer} price price paid for this device
     * @param {String} purchaseDateTime time device was purchased (i.e. traded)
    */
    async buy(ctx, issuer, deviceNumber, currentOwner, newOwner, price, purchaseDateTime) {

        // Retrieve the current device using key fields provided
        let deviceKey = Device.makeKey([issuer, deviceNumber]);
        let device = await ctx.deviceList.getDevice(deviceKey);

        // Validate current owner
        if (device.getOwner() !== currentOwner) {
            throw new Error('Device ' + issuer + deviceNumber + ' is not owned by ' + currentOwner);
        }

        // First buy moves state from ISSUED to TRADING
        if (device.isIssued()) {
            device.setTrading();
        }

        // Check device is not already REDEEMED
        if (device.isTrading()) {
            device.setOwner(newOwner);
        } else {
            throw new Error('Device ' + issuer + deviceNumber + ' is not trading. Current state = ' + device.getCurrentState());
        }

        // Update the device
        await ctx.deviceList.updateDevice(device);
        return device;
    }

    /**
     * Redeem device
     *
     * @param {Context} ctx the transaction context
     * @param {String} issuer device issuer
     * @param {Integer} deviceNumber device number for this issuer
     * @param {String} redeemingOwner redeeming owner of device
     * @param {String} redeemDateTime time device was redeemed
    */
    async redeem(ctx, issuer, deviceNumber, redeemingOwner, redeemDateTime) {

        let deviceKey = Device.makeKey([issuer, deviceNumber]);

        let device = await ctx.deviceList.getdevice(deviceKey);

        // Check device is not REDEEMED
        if (device.isRedeemed()) {
            throw new Error('device ' + issuer + deviceNumber + ' already redeemed');
        }

        // Verify that the redeemer owns the device before redeeming it
        if (device.getOwner() === redeemingOwner) {
            device.setOwner(device.getIssuer());
            device.setRedeemed();
        } else {
            throw new Error('Redeeming owner does not own device' + issuer + deviceNumber);
        }

        await ctx.deviceList.updatedevice(device);
        return device;
    }

}

module.exports = DeviceContract;
