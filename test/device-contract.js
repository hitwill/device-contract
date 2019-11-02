/*
 * Work in Progress not ready for testing!!!!!!
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { DeviceContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('DeviceContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new DeviceContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"device 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"device 1002 value"}'));
    });

    describe('#deviceExists', () => {

        it('should return true for a device', async () => {
            await contract.deviceExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a device that does not exist', async () => {
            await contract.deviceExists(ctx, '1003').should.eventually.be.false;
        });

    });

});