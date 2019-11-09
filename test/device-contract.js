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



let contract = new DeviceContract();
let ctx = contract.createContext();
//TODO: how to create complete stub?
ctx.stub = sinon.createStubInstance(ChaincodeStub);
ctx.clientIdentity = sinon.createStubInstance(ClientIdentity);
ctx.logging = {
    getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
    setLevel: sinon.stub(),
};

//It is safer to test using the VS CODE IDE. The stub created here doesn't seem to have all methods
contract.issue(ctx, 'hash', 'true', '{"isActive":true,"isStolen":false}');
contract.setActiveStatus(ctx, 'hash', 'true');



