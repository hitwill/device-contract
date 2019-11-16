'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// deviceNet specifc classes
const Device = require('./device.js');
const DeviceList = require('./device-list.js');

// uuid generator
const uuidv1 = require('uuid/v1');


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
    }


    /**
     * Issue device onto the blockchain
     *
     * @param {Context} ctx the transaction context
     * @param {String} ownerBlockchainAddress owner's blockchain address
     * @param {String} attributesHash unique hash of the device
     * @param {String} identityFlag flag of several device statuses (stringified Object)
    */
    async issue(ctx, attributesHash, identityFlag, ownerBlockchainAddress) {
        let firstBlockNumber = ctx.stub.getTxID();
        let lastBlockNumber = firstBlockNumber; // in this case, they are the same
        let deviceBlockchainAddress = uuidv1(); //unique address set up when issued


        // create an instance of the device
        let device = Device.createInstance(deviceBlockchainAddress, ownerBlockchainAddress, attributesHash,
            firstBlockNumber, lastBlockNumber, JSON.parse(identityFlag));

        // Add the device to the list of all similar devices in the ledger world state
        await ctx.deviceList.addDevice(device);

        // Must return a serialized device to caller of smart contract
        return device;
    }


    /**
   * set Active status of device
   *
   * @param {Context} ctx the transaction context
   * @param {String} attributesHash unique hash of the device
   * @param {String} status true or false
  */
    async setActiveStatus(ctx, attributesHash, status) {
        let lastBlockNumber = ctx.stub.getTxID();
        if (status !== 'true' && status !== 'false') {
            throw new Error('Status must either be true or false');
        }
        status = status === 'true' ? true : false;// convert from truthy to explicit

        // fetch an instance of the device
        let device = await ctx.deviceList.getDevice(attributesHash);

        if (device === null) {
            throw new Error('This device is not registered on the blockchain');
        }

        //update property
        device.setLastBlockNumber(lastBlockNumber);
        device.setActive(status);

        // Update the device
        await ctx.deviceList.updateDevice(device);

        // Must return a serialized device to caller of smart contract
        return device;
    }

    /**
   * set Stolen status of device
   *
   * @param {Context} ctx the transaction context
   * @param {String} attributesHash unique hash of the device
   * @param {String} status true or false
   * @param {String} callerBlockchainAddress address of device making request
  */
    async setStolenStatus(ctx, attributesHash, status, callerBlockchainAddress) {
        let lastBlockNumber = ctx.stub.getTxID();
        if (status !== 'true' && status !== 'false') {
            throw new Error('Status must either be true or false');
        }
        status = status === 'true' ? true : false;// convert from truthy to explicit

        // fetch an instance of the device
        let device = await ctx.deviceList.getDevice(attributesHash);

        if (device === null) {
            throw new Error('This device is not registered on the blockchain');
        }

        // assert it's the owner making the request.
        if (device.isOwner(callerBlockchainAddress) === false) {
            throw new Error('The caller is not allowed to make this change');
        }

        //update property
        device.setLastBlockNumber(lastBlockNumber);
        device.setStolen(status);

        // Update the device
        await ctx.deviceList.updateDevice(device);

        // Must return a serialized device to caller of smart contract
        return device;
    }

    /**
   * set Stolen status of device
   *
   * @param {Context} ctx the transaction context
   * @param {String} attributesHash unique hash of the device
   * @param {String} callerBlockchainAddress address of device making request
   * @param {String} newOwnerBlockchainAddress blockchain address of new owner
  */
    async changeOwner(ctx, attributesHash, callerBlockchainAddress, newOwnerBlockchainAddress) {
        let lastBlockNumber = ctx.stub.getTxID();
        if (newOwnerBlockchainAddress === '' || typeof newOwnerBlockchainAddress === 'undefined') {
            throw new Error('New owner needed');
        }

        // fetch an instance of the device
        let device = await ctx.deviceList.getDevice(attributesHash);

        if (device === null) {
            throw new Error('This device is not registered on the blockchain');
        }

        // assert it's the owner making the request.
        if (device.isOwner(callerBlockchainAddress) === false) {
            throw new Error('The caller is not allowed to make this change');
        }

        //update property
        device.setLastBlockNumber(lastBlockNumber);
        device.setOwnerBlockchainAddress(newOwnerBlockchainAddress);

        // Update the device
        await ctx.deviceList.updateDevice(device);

        // Must return a serialized device to caller of smart contract
        return device;
    }

}

module.exports = DeviceContract;
