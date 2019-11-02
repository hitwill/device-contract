'use strict';

// Utility class for collections of ledger states --  a state list
const StateList = require('./../ledger-api/statelist.js');

const Device = require('./device.js');

class DeviceList extends StateList {

    constructor(ctx) {
        super(ctx, 'org.devicenet.devicelist');
        this.use(Device);
    }

    async addDevice(device) {
        return this.addState(device);
    }

    async getDevice(deviceKey) {
        return this.getState(deviceKey);
    }

    async updateDevice(device) {
        return this.updateState(device);
    }
}


module.exports = DeviceList;