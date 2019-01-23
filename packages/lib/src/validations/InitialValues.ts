import isEmpty from 'lodash.isempty';
import Contracts from '../artifacts/Contracts';
import { Node } from '../utils/ContractAST';
import { Contract } from 'web3-eth-contract';

export function hasInitialValuesInDeclarations(contractClass: Contract): boolean {
  return detectInitialValues(contractClass);
}

function detectInitialValues(contractClass: Contract): boolean {
  const nodes = contractClass.ast.nodes.filter((n) => n.name === contractClass.contractName);
  for (const node of nodes) {
    if (hasInitialValues(node)) return true;
    for (const baseContract of node.baseContracts || []) {
      const parentContract: Contract = Contracts.getFromLocal(baseContract.baseName.name);
      return detectInitialValues(parentContract);
    }
  }
  return false;
}

function hasInitialValues(node: Node): boolean {
  const initializedVariables = node.nodes
    .filter((nodeItem) => !nodeItem.constant && nodeItem.nodeType === 'VariableDeclaration')
    .filter((nodeItem) => nodeItem.value != null);

  return !isEmpty(initializedVariables);
}
