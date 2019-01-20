'use strict';
require('../../setup');

import ProxyAdmin from '../../../src/proxy/ProxyAdmin';
import ProxyAdminProject from '../../../src/project/ProxyAdminProject';
import shouldManageProxies from './ProxyProject.behaviour';
import shouldManageDependencies from './DependenciesProject.behaviour';
import shouldManageImplementations from './Implementations.behaviour';
import Contracts from '../../../src/artifacts/Contracts';
import { noop } from 'lodash';

const ImplV1 = Contracts.getFromLocal('DummyImplementation');
const ImplV2 = Contracts.getFromLocal('DummyImplementationV2');

contract('ProxyAdminProject', function([_, proxyAdminOwner, another]) {
  const name = 'MyProxyAdminProject'
  const txParams = { from: proxyAdminOwner };

  beforeEach('initializing', async function() {
    this.proxyAdminOwner = proxyAdminOwner;
    this.proxyAdmin = await ProxyAdmin.deploy(txParams);
    this.adminAddress = this.proxyAdmin.address;
    this.project = new ProxyAdminProject(name, this.proxyAdmin, { from: proxyAdminOwner })
  });

  describe('class methods', function() {
    describe('#fetchOrDeploy', function() {
      it('returns ProxyAdminProject instance', async function() {
        const project = await ProxyAdminProject.fetchOrDeploy(name, txParams, this.adminAddress);
        project.should.be.instanceof(ProxyAdminProject)
      });
    });
  });

  describe('without setImplementation', function () {
    shouldManageProxies({
      supportsNames: false,
      otherAdmin: another,
      setImplementations: noop
    })
  });

  describe('with setImplementation', function () {
    shouldManageProxies({
      supportsNames: true,
      otherAdmin: another,
      setImplementations: async function () {
        await this.project.setImplementation(ImplV1, "DummyImplementation")
        await this.project.setImplementation(ImplV2, "DummyImplementationV2")
      }
    })

    it('unsets an implementation', async function () {
      await this.project.setImplementation(ImplV1, 'DummyImplementation')
      this.project.unsetImplementation('DummyImplementation')
      this.project.implementations.should.not.have.key('DummyImplementation')
    })
  })

  shouldManageDependencies();
  shouldManageImplementations();
});