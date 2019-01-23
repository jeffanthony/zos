import Logger from '../utils/Logger';
import { sendTransaction, deploy } from '../utils/Transactions';
import Contracts from '../artifacts/Contracts';
import { Contract } from 'web3-eth-contract';

const log = new Logger('ImplementationDirectory');

// TS-TODO: review which members could be private
export default class ImplementationDirectory {

  public directoryContract: Contract;
  public txParams: any;

  public static async deploy(txParams: any = {}): Promise<ImplementationDirectory> {
    const contractClass = this.getContractClass();
    log.info(`Deploying new ${contractClass.contractName}...`);
    const directory = await deploy(contractClass, [], txParams);
    log.info(`Deployed ${contractClass.contractName} at ${directory._address}`);
    return new this(directory, txParams);
  }

  public static async fetch(address: string, txParams: any = {}): Promise<ImplementationDirectory> {
    const klazz = this.getContractClass();
    const directory = <Contract>await klazz.at(address);
    return new this(directory, txParams);
  }

  public static getContractClass(): Contract {
    return Contracts.getFromLib('ImplementationDirectory');
  }

  constructor(directory: Contract, txParams: any = {}) {
    this.directoryContract = directory;
    this.txParams = txParams;
  }

  get contract(): Contract {
    return this.directoryContract;
  }

  get address(): string {
    return this.directoryContract._address;
  }

  public async owner(): Promise<string> {
    return this.directoryContract.methods.owner().call({ ...this.txParams });
  }

  public async getImplementation(contractName: string): Promise<string | never> {
    if (!contractName) throw Error('Contract name is required to retrieve an implementation');
    return await this.directoryContract.methods.getImplementation(contractName).call({ ...this.txParams });
  }

  public async setImplementation(contractName: string, implementationAddress: string): Promise<any> {
    log.info(`Setting ${contractName} implementation ${implementationAddress}...`);
    await sendTransaction(this.directoryContract.methods.setImplementation, [contractName, implementationAddress], { ...this.txParams });
    log.info(`Implementation set: ${implementationAddress}`);
  }

  public async unsetImplementation(contractName: string): Promise<any> {
    log.info(`Unsetting ${contractName} implementation...`);
    await sendTransaction(this.directoryContract.methods.unsetImplementation, [contractName], { ...this.txParams });
    log.info(`${contractName} implementation unset`);
  }

  public async freeze(): Promise<any> {
    log.info('Freezing implementation directory...');
    await sendTransaction(this.directoryContract.methods.freeze, [], { ...this.txParams });
    log.info('Frozen');
  }

  public async isFrozen(): Promise<boolean> {
    return await this.directoryContract.methods.frozen().call();
  }
}
