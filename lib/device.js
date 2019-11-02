'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');


/**
 * Device class extends State class
 * Class will be used by application and smart contract to define a device
 */
class Device extends State {

    constructor(obj) {
        /*we pass an array of attributes that make the device unique
         * The attributes hash is sufficient for now
        */
        super(Device.getClass(), [obj.attributesHash]);
        Object.assign(this, obj);
    }


    /**
     * Basic getters and setters
    */

    /** Properties every device has */
    getPropertyList() {
        let identityFlag = {
            isActive: null,
            isStolen: null
        };

        let properties = {
            deviceBlockchainAddress: null,
            ownerBlockchainAddress: null,
            attributesHash: null,
            firstBlockNumber: null,
            lastBlockNumber: null,
            identityFlag: identityFlag
        };
        return properties;
    }


    /** Device blockchain address */
    getDeviceBlockchainAddress() {
        return this.deviceBlockchainAddress;
    }

    setDeviceBlockchainAddress(address) {
        this.deviceBlockchainAddress = address;
    }

    /** Owner blockchain address */
    getOwnerBlockchainAddress() {
        return this.ownerBlockchainAddress;
    }

    setOwnerBlockchainAddress(address) {
        this.ownerBlockchainAddress = address;
    }

    /** Attributes hash */
    getAttributesHash() {
        return this.attributesHash;
    }

    setAttributesHash(hash) {
        this.attributesHash = hash;
    }

    /** First blocknumber */
    getFirstBlockNumber() {
        return this.firstBlockNumber;
    }

    setFirstBlockNumber(blockNumber) {
        this.firstBlockNumber = blockNumber;
    }

    /** Last blocknumber */
    getLastBlockNumber() {
        return this.lastBlockNumber;
    }

    setLastBlockNumber(blockNumber) {
        this.lastBlockNumber = blockNumber;
    }

    /** Start Identity flag
     *  needs to be compressed into a byte so getters and setters are more intricate */
    /** Active status */
    isActive() {
        return this.identityFlag.isActive;
    }

    setActive(status) {
        this.identityFlag.isActive = status;
    }

    /** Stolen status */
    isStolen() {
        return this.identityFlag.isStolen;
    }

    setStolen(status) {
        this.identityFlag.isStolen = status;
    }
    /** End Identity flag */
    /** End getters and setters */



    static fromBuffer(buffer) {
        return Device.deserialize(buffer);
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to device
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Device);
    }

    /**
     * Factory method to create a device object
     */
    static createInstance(deviceBlockchainAddress, ownerBlockchainAddress, attributesHash,
        firstBlockNumber, lastBlockNumber, identityFlag) {
        return new Device({
            deviceBlockchainAddress, ownerBlockchainAddress, attributesHash,
            firstBlockNumber, lastBlockNumber, identityFlag
        });
    }

    static getClass() {
        return 'org.devicenet.devicecontract';
    }
}

module.exports = Device;
