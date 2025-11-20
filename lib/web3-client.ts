/**
 * Web3 Client for HealthPassport Contract Integration
 * 
 * This file provides functions to interact with the deployed HealthPassport
 * smart contract on BlockDAG network using Web3.js
 */

import Web3 from 'web3';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION - Update after deployment
// ═══════════════════════════════════════════════════════════════

// Contract address from deployment (update this after deploying)
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

// BlockDAG Network configuration
const NETWORK_CONFIG = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.blockdag.network',
  chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111'),
  networkName: 'BlockDAG Testnet',
  explorerUrl: 'https://explorer.testnet.blockdag.network'
};

// Contract ABI - Import from your generated ABI file
// After deployment, replace this with: import HealthPassportABI from '@/contracts/HealthPassport.json';
const CONTRACT_ABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "name",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "symbol",
    "inputs": [],
    "outputs": [{ "name": "", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mintSoulbound",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
      { "name": "recipient", "type": "address", "internalType": "address" },
      { "name": "metadata", "type": "string", "internalType": "string" }
    ],
    "outputs": [{ "name": "success", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "ownerOf",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "owner", "type": "address", "internalType": "address" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenURI",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "uri", "type": "string", "internalType": "string" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "balance", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getCredentialsByOwner",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "tokenIds", "type": "uint256[]", "internalType": "uint256[]" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "verifyCredential",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "internalType": "uint256" },
      { "name": "proof", "type": "bytes32[]", "internalType": "bytes32[]" }
    ],
    "outputs": [{ "name": "isValid", "type": "bool", "internalType": "bool" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "event",
    "name": "CredentialMinted",
    "inputs": [
      { "name": "tokenId", "type": "uint256", "indexed": true },
      { "name": "owner", "type": "address", "indexed": true },
      { "name": "credentialType", "type": "string", "indexed": false },
      { "name": "timestamp", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      { "name": "from", "type": "address", "indexed": true },
      { "name": "to", "type": "address", "indexed": true },
      { "name": "tokenId", "type": "uint256", "indexed": true }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════
// WEB3 INITIALIZATION
// ═══════════════════════════════════════════════════════════════

let web3Instance: Web3 | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let contractInstance: any = null;

/**
 * Initialize Web3 instance
 */
export function getWeb3(): Web3 {
  if (!web3Instance) {
    web3Instance = new Web3(new Web3.providers.HttpProvider(NETWORK_CONFIG.rpcUrl));
  }
  return web3Instance;
}

/**
 * Get contract instance
 */
export function getContract() {
  if (!contractInstance) {
    const web3 = getWeb3();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contractInstance = new web3.eth.Contract(CONTRACT_ABI as any, CONTRACT_ADDRESS);
  }
  return contractInstance;
}

// ═══════════════════════════════════════════════════════════════
// READ FUNCTIONS (View/Pure - No gas required)
// ═══════════════════════════════════════════════════════════════

/**
 * Get contract name
 */
export async function getContractName(): Promise<string> {
  try {
    const contract = getContract();
    return await contract.methods.name().call();
  } catch (error) {
    console.error('Error getting contract name:', error);
    throw error;
  }
}

/**
 * Get contract symbol
 */
export async function getContractSymbol(): Promise<string> {
  try {
    const contract = getContract();
    return await contract.methods.symbol().call();
  } catch (error) {
    console.error('Error getting contract symbol:', error);
    throw error;
  }
}

/**
 * Get the balance (number of credentials) for an address
 */
export async function getBalanceOf(address: string): Promise<number> {
  try {
    const contract = getContract();
    const balance = await contract.methods.balanceOf(address).call();
    return parseInt(balance.toString());
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
}

/**
 * Get the owner of a specific credential token
 */
export async function getOwnerOf(tokenId: number): Promise<string> {
  try {
    const contract = getContract();
    return await contract.methods.ownerOf(tokenId).call();
  } catch (error) {
    console.error('Error getting owner:', error);
    throw error;
  }
}

/**
 * Get the metadata URI for a credential
 */
export async function getTokenURI(tokenId: number): Promise<string> {
  try {
    const contract = getContract();
    return await contract.methods.tokenURI(tokenId).call();
  } catch (error) {
    console.error('Error getting token URI:', error);
    throw error;
  }
}

/**
 * Get all credential token IDs owned by an address
 */
export async function getCredentialsByOwner(ownerAddress: string): Promise<number[]> {
  try {
    const contract = getContract();
    const tokenIds = await contract.methods.getCredentialsByOwner(ownerAddress).call();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tokenIds.map((id: any) => parseInt(id.toString()));
  } catch (error) {
    console.error('Error getting credentials:', error);
    return [];
  }
}

/**
 * Get total supply of credentials
 */
export async function getTotalSupply(): Promise<number> {
  try {
    const contract = getContract();
    const supply = await contract.methods.totalSupply().call();
    return parseInt(supply.toString());
  } catch (error) {
    console.error('Error getting total supply:', error);
    return 0;
  }
}

/**
 * Verify a credential with proof
 */
export async function verifyCredential(tokenId: number, proof: string[]): Promise<boolean> {
  try {
    const contract = getContract();
    return await contract.methods.verifyCredential(tokenId, proof).call();
  } catch (error) {
    console.error('Error verifying credential:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// WRITE FUNCTIONS (Require gas and wallet signature)
// ═══════════════════════════════════════════════════════════════

/**
 * Mint a new soulbound credential
 * 
 * @param fromAddress - The address initiating the transaction (must have MINTER_ROLE)
 * @param tokenId - Unique identifier for the credential
 * @param recipient - Address to receive the credential
 * @param metadata - IPFS URI or metadata string for the credential
 * @returns Transaction receipt
 */
export async function mintSoulbound(
  fromAddress: string,
  tokenId: number,
  recipient: string,
  metadata: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const contract = getContract();
    
    // Estimate gas
    const gasEstimate = await contract.methods
      .mintSoulbound(tokenId, recipient, metadata)
      .estimateGas({ from: fromAddress });

    // Send transaction
    const receipt = await contract.methods
      .mintSoulbound(tokenId, recipient, metadata)
      .send({
        from: fromAddress,
        gas: gasEstimate.toString()
      });

    return {
      success: true,
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to mint credential';
    console.error('Error minting credential:', error);
    return {
      success: false,
      error: errorMessage
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get network configuration
 */
export function getNetworkConfig() {
  return NETWORK_CONFIG;
}

/**
 * Get contract address
 */
export function getContractAddress(): string {
  return CONTRACT_ADDRESS;
}

/**
 * Get explorer URL for a transaction
 */
export function getTransactionUrl(txHash: string): string {
  return `${NETWORK_CONFIG.explorerUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressUrl(address: string): string {
  return `${NETWORK_CONFIG.explorerUrl}/address/${address}`;
}

/**
 * Get explorer URL for the contract
 */
export function getContractExplorerUrl(): string {
  return getAddressUrl(CONTRACT_ADDRESS);
}

/**
 * Check if Web3 is properly configured
 */
export function isWeb3Configured(): boolean {
  return CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000';
}

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface CredentialInfo {
  tokenId: number;
  owner: string;
  metadata: string;
  isValid: boolean;
}

export interface MintResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface NetworkInfo {
  rpcUrl: string;
  chainId: number;
  networkName: string;
  explorerUrl: string;
}
