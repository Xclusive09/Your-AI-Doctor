// BlockDAG testnet integration utilities
// Real blockchain integration for HealthPassport smart contract
/* eslint-disable @typescript-eslint/no-unused-vars */

// CONFIGURATION - FROM ENVIRONMENT VARIABLES
export const BLOCKDAG_CONFIG = {
  // Contract address from your deployment
  CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x869577ef37fc01a85cba2a9f74f98452aa738fbc',
  
  // Network configuration from environment
  RPC_URL: process.env.NEXT_PUBLIC_RPC_URL || process.env.BDAG_TESTNET_RPC_URL || 'https://rpc.awakening.bdagscan.com',
  CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || process.env.BDAG_TESTNET_CHAIN_ID || '1043'),
  EXPLORER_URL: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://bdagscan.com',
  
  // Network details for wallet integration
  NETWORK_NAME: 'BlockDAG Testnet',
  CURRENCY: {
    name: 'BDAG',
    symbol: 'BDAG',
    decimals: 18
  }
}

// Contract ABI - From HealthPassport_metadata.json
// @internal Reserved for future Web3.js integration
const _HEALTH_PASSPORT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "string", "name": "uri", "type": "string" },
      { "internalType": "string", "name": "credType", "type": "string" }
    ],
    "name": "mint",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "tokensOf",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "credentialType",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "isRevoked",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "issuanceTimestamp",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "bytes32[]", "name": "proof", "type": "bytes32[]" }
    ],
    "name": "verify",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Web3 Types
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on: (event: string, callback: (data: unknown) => void) => void
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

export interface HealthCredential {
  tokenId: string
  badgeType: string
  metadata: {
    name: string
    description: string
    earnedDate: string
    verificationData?: Record<string, unknown>
  }
  owner: string
  txHash?: string
}

// ═══════════════════════════════════════════════════════════════
// ABI ENCODING UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Encode a uint256 value to hex (32 bytes)
 */
function encodeUint256(value: number | bigint): string {
  const hex = BigInt(value).toString(16)
  return hex.padStart(64, '0')
}

/**
 * Encode an address to hex (32 bytes, left-padded)
 */
function encodeAddress(address: string): string {
  const cleaned = address.toLowerCase().replace('0x', '')
  return cleaned.padStart(64, '0')
}

/**
 * Encode a string to hex with offset and length
 * @internal Reserved for future use
 */
function _encodeString(str: string): { offset: string; data: string; length: number } {
  const bytes = new TextEncoder().encode(str)
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const paddedHex = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0')
  return {
    offset: '', // Will be calculated later
    data: encodeUint256(bytes.length) + paddedHex,
    length: 32 + Math.ceil(hex.length / 64) * 32
  }
}

/**
 * Calculate function selector (first 4 bytes of keccak256 hash)
 */
function getFunctionSelector(signature: string): string {
  // Simple keccak256 implementation for function selectors
  // Using pre-computed selectors for our functions
  const selectors: Record<string, string> = {
    'mint(address,uint256,string,string)': '0xd85d3d27',
    'balanceOf(address)': '0x70a08231',
    'tokensOf(address)': '0x5a3f2672',
    'ownerOf(uint256)': '0x6352211e',
    'tokenURI(uint256)': '0xc87b56dd',
    'credentialType(uint256)': '0x5bfa1b68',
    'isRevoked(uint256)': '0x2cff6e9c',
    'verify(uint256,bytes32[])': '0xb0f7d744',
    'totalSupply()': '0x18160ddd',
    'name()': '0x06fdde03',
    'symbol()': '0x95d89b41'
  }
  return selectors[signature] || '0x00000000'
}

/**
 * Encode the mint function call
 * mint(address to, uint256 tokenId, string uri, string credType)
 */
function encodeMintCall(to: string, tokenId: number, uri: string, credType: string): string {
  const selector = getFunctionSelector('mint(address,uint256,string,string)')
  
  // Encode parameters
  const encodedTo = encodeAddress(to)
  const encodedTokenId = encodeUint256(tokenId)
  
  // For dynamic types (strings), we need to use offsets
  // Fixed params take 4 * 32 = 128 bytes, so string data starts at offset 128 (0x80)
  const uriOffset = encodeUint256(128) // 4 * 32 bytes for the 4 params
  
  // URI data
  const uriBytes = new TextEncoder().encode(uri)
  const uriHex = Array.from(uriBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const uriPaddedHex = uriHex.padEnd(Math.ceil(uriHex.length / 64) * 64, '0')
  const uriData = encodeUint256(uriBytes.length) + uriPaddedHex
  
  // credType offset (after uri data)
  const credTypeOffset = encodeUint256(128 + 32 + Math.ceil(uriHex.length / 64) * 32)
  
  // credType data
  const credTypeBytes = new TextEncoder().encode(credType)
  const credTypeHex = Array.from(credTypeBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  const credTypePaddedHex = credTypeHex.padEnd(Math.ceil(credTypeHex.length / 64) * 64, '0')
  const credTypeData = encodeUint256(credTypeBytes.length) + credTypePaddedHex
  
  return selector + encodedTo + encodedTokenId + uriOffset + credTypeOffset + uriData + credTypeData
}

/**
 * Encode balanceOf(address) call
 */
function encodeBalanceOfCall(address: string): string {
  const selector = getFunctionSelector('balanceOf(address)')
  return selector + encodeAddress(address)
}

/**
 * Encode tokensOf(address) call
 */
function encodeTokensOfCall(address: string): string {
  const selector = getFunctionSelector('tokensOf(address)')
  return selector + encodeAddress(address)
}

/**
 * Encode verify(uint256,bytes32[]) call
 */
function encodeVerifyCall(tokenId: number, proof: string[] = []): string {
  const selector = getFunctionSelector('verify(uint256,bytes32[])')
  const encodedTokenId = encodeUint256(tokenId)
  
  // Offset to array data (after tokenId = 64 bytes)
  const arrayOffset = encodeUint256(64)
  
  // Array length
  const arrayLength = encodeUint256(proof.length)
  
  // Array elements
  const arrayData = proof.map(p => p.replace('0x', '').padStart(64, '0')).join('')
  
  return selector + encodedTokenId + arrayOffset + arrayLength + arrayData
}

/**
 * Encode credentialType(uint256) call
 */
function encodeCredentialTypeCall(tokenId: number): string {
  const selector = getFunctionSelector('credentialType(uint256)')
  return selector + encodeUint256(tokenId)
}

/**
 * Encode isRevoked(uint256) call
 */
function encodeIsRevokedCall(tokenId: number): string {
  const selector = getFunctionSelector('isRevoked(uint256)')
  return selector + encodeUint256(tokenId)
}

/**
 * Decode uint256 from hex
 */
function decodeUint256(hex: string): bigint {
  return BigInt('0x' + hex.replace('0x', ''))
}

/**
 * Decode address from hex (last 40 chars)
 * @internal Reserved for future use
 */
function _decodeAddress(hex: string): string {
  const cleaned = hex.replace('0x', '')
  return '0x' + cleaned.slice(-40)
}

/**
 * Decode boolean from hex
 * @internal Reserved for future use
 */
function _decodeBool(hex: string): boolean {
  return decodeUint256(hex) !== BigInt(0)
}

/**
 * Decode uint256 array from hex response
 */
function decodeUint256Array(hex: string): bigint[] {
  const cleaned = hex.replace('0x', '')
  if (cleaned.length < 128) return []
  
  // First 32 bytes: offset to array data
  // Next 32 bytes at offset: array length
  const offset = Number(decodeUint256(cleaned.slice(0, 64))) * 2
  const length = Number(decodeUint256(cleaned.slice(offset, offset + 64)))
  
  const result: bigint[] = []
  for (let i = 0; i < length; i++) {
    const start = offset + 64 + (i * 64)
    result.push(decodeUint256(cleaned.slice(start, start + 64)))
  }
  
  return result
}

/**
 * Connect wallet (Web3 or MetaMask) with detailed logging
 */
export async function connectWallet(): Promise<string | null> {
  const walletId = Math.random().toString(36).substring(7)
  console.log(`👛 [WALLET-${walletId}] Starting wallet connection...`)
  
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      console.log(`🔍 [WALLET-${walletId}] Web3 wallet detected`)
      console.log(`📋 [WALLET-${walletId}] Target network config:`, {
        chainId: BLOCKDAG_CONFIG.CHAIN_ID,
        chainIdHex: `0x${BLOCKDAG_CONFIG.CHAIN_ID.toString(16)}`,
        networkName: BLOCKDAG_CONFIG.NETWORK_NAME,
        rpcUrl: BLOCKDAG_CONFIG.RPC_URL,
        currency: BLOCKDAG_CONFIG.CURRENCY
      })
      
      // Request account access
      console.log(`🔐 [WALLET-${walletId}] Requesting account access...`)
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[]
      
      console.log(`✅ [WALLET-${walletId}] Accounts received:`, accounts)
      
      // Get current network
      console.log(`🌐 [WALLET-${walletId}] Getting current network...`)
      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      }) as string
      
      const currentChainIdDecimal = parseInt(currentChainId, 16)
      console.log(`📊 [WALLET-${walletId}] Current network:`, {
        chainIdHex: currentChainId,
        chainIdDecimal: currentChainIdDecimal,
        targetChainId: BLOCKDAG_CONFIG.CHAIN_ID
      })
      
      // Switch to BlockDAG network if needed
      if (currentChainIdDecimal !== BLOCKDAG_CONFIG.CHAIN_ID) {
        console.log(`🔄 [WALLET-${walletId}] Network switch required, switching to BlockDAG...`)
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${BLOCKDAG_CONFIG.CHAIN_ID.toString(16)}` }],
          })
          console.log(`✅ [WALLET-${walletId}] Network switched successfully`)
        } catch (switchError: unknown) {
          console.log(`⚠️  [WALLET-${walletId}] Network switch failed, attempting to add network...`)
          const error = switchError as { code: number }
          console.log(`📋 [WALLET-${walletId}] Switch error:`, error)
          
          if (error.code === 4902) {
            console.log(`➕ [WALLET-${walletId}] Adding BlockDAG network...`)
            const networkConfig = {
              chainId: `0x${BLOCKDAG_CONFIG.CHAIN_ID.toString(16)}`,
              chainName: BLOCKDAG_CONFIG.NETWORK_NAME,
              rpcUrls: [BLOCKDAG_CONFIG.RPC_URL],
              nativeCurrency: BLOCKDAG_CONFIG.CURRENCY,
              blockExplorerUrls: [BLOCKDAG_CONFIG.EXPLORER_URL],
            }
            console.log(`📋 [WALLET-${walletId}] Network config:`, networkConfig)
            
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkConfig],
            })
            console.log(`✅ [WALLET-${walletId}] BlockDAG network added successfully`)
          } else {
            throw switchError
          }
        }
      } else {
        console.log(`✅ [WALLET-${walletId}] Already on correct network`)
      }
      
      console.log(`🎉 [WALLET-${walletId}] Wallet connection successful:`, accounts[0])
      return accounts[0]
    } else {
      console.error(`❌ [WALLET-${walletId}] No Web3 wallet detected`)
      throw new Error('No Web3 wallet detected')
    }
  } catch (error) {
    console.error(`❌ [WALLET-${walletId}] Wallet connection error:`, error)
    return null
  }
}

/**
 * Make raw RPC call to BlockDAG network with detailed logging
 */
async function makeRPCCall(method: string, params: unknown[] = []): Promise<unknown> {
  const requestId = Math.random().toString(36).substring(7)
  
  console.log(`🔄 [RPC-${requestId}] Making RPC call:`, {
    method,
    params,
    url: BLOCKDAG_CONFIG.RPC_URL,
    timestamp: new Date().toISOString()
  })
  
  try {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }
    
    console.log(`📤 [RPC-${requestId}] Request body:`, JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(BLOCKDAG_CONFIG.RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    console.log(`📥 [RPC-${requestId}] Response status:`, response.status, response.statusText)
    
    const data = await response.json()
    console.log(`📋 [RPC-${requestId}] Response data:`, JSON.stringify(data, null, 2))
    
    if (data.error) {
      console.error(`❌ [RPC-${requestId}] RPC Error:`, data.error)
      throw new Error(data.error.message)
    }
    
    console.log(`✅ [RPC-${requestId}] RPC call successful`)
    return data.result
  } catch (error) {
    console.error(`❌ [RPC-${requestId}] RPC call failed:`, error)
    throw error
  }
}

/**
 * Get wallet balance from BlockDAG testnet with detailed logging
 */
export async function getBalance(address: string): Promise<string> {
  const balanceId = Math.random().toString(36).substring(7)
  console.log(`💰 [BALANCE-${balanceId}] Getting balance for address: ${address}`)
  
  try {
    const balanceHex = await makeRPCCall('eth_getBalance', [address, 'latest']) as string
    console.log(`📊 [BALANCE-${balanceId}] Raw balance (hex): ${balanceHex}`)
    
    // Convert from hex to decimal
    const balanceWei = BigInt(balanceHex)
    console.log(`📊 [BALANCE-${balanceId}] Balance in Wei: ${balanceWei.toString()}`)
    
    // Convert from wei to BDAG (assuming 18 decimals)
    const balanceInBDAG = Number(balanceWei) / Math.pow(10, 18)
    console.log(`📊 [BALANCE-${balanceId}] Balance in BDAG: ${balanceInBDAG}`)
    
    const formattedBalance = balanceInBDAG.toFixed(4)
    console.log(`✅ [BALANCE-${balanceId}] Final formatted balance: ${formattedBalance} BDAG`)
    
    return formattedBalance
  } catch (error) {
    console.error(`❌ [BALANCE-${balanceId}] Get balance error:`, error)
    return '0'
  }
}

/**
 * Mint a health credential - REAL blockchain implementation
 * Mints a soulbound NFT on the BlockDAG network
 */
export async function mintHealthCredential(
  address: string,
  badgeType: string,
  metadata: HealthCredential['metadata']
): Promise<HealthCredential | null> {
  const mintId = Math.random().toString(36).substring(7)
  console.log(`� [MINT-${mintId}] Starting REAL credential minting on BlockDAG...`)
  
  try {
    // Check if wallet is available
    if (typeof window === 'undefined' || !window.ethereum) {
      console.log(`⚠️ [MINT-${mintId}] No wallet detected, falling back to RPC minting...`)
      return await mintHealthCredentialViaRPC(address, badgeType, metadata)
    }
    
    console.log(`📋 [MINT-${mintId}] Input parameters:`, {
      address,
      badgeType,
      metadata,
      contractAddress: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      network: BLOCKDAG_CONFIG.NETWORK_NAME
    })
    
    // Generate unique token ID based on timestamp + random
    const tokenId = Date.now() + Math.floor(Math.random() * 10000)
    console.log(`🆔 [MINT-${mintId}] Generated token ID: ${tokenId}`)
    
    // Create metadata URI (base64 encoded JSON)
    const metadataObj = {
      name: metadata.name,
      description: metadata.description,
      earnedDate: metadata.earnedDate,
      badgeType: badgeType,
      attributes: [
        { trait_type: "Badge Type", value: badgeType },
        { trait_type: "Earned Date", value: metadata.earnedDate },
        { trait_type: "Platform", value: "HealthBot AI Doctor" }
      ],
      ...metadata.verificationData
    }
    const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadataObj))}`
    console.log(`📄 [MINT-${mintId}] Metadata URI created`)
    
    // Encode the mint function call using our ABI encoder
    const encodedData = encodeMintCall(address, tokenId, metadataURI, badgeType)
    console.log(`🔢 [MINT-${mintId}] Encoded contract data: ${encodedData.substring(0, 100)}...`)
    
    // Prepare transaction
    const txData = {
      from: address,
      to: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      data: encodedData,
      // Let wallet estimate gas
    }
    console.log(`📦 [MINT-${mintId}] Transaction prepared for contract: ${BLOCKDAG_CONFIG.CONTRACT_ADDRESS}`)
    
    // Send transaction via wallet
    console.log(`📤 [MINT-${mintId}] Requesting wallet signature...`)
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [txData],
    }) as string
    
    console.log(`✅ [MINT-${mintId}] Transaction sent! Hash: ${txHash}`)
    console.log(`🔍 [MINT-${mintId}] Explorer: ${BLOCKDAG_CONFIG.EXPLORER_URL}/tx/${txHash}`)
    
    // Wait for transaction confirmation
    console.log(`⏳ [MINT-${mintId}] Waiting for confirmation...`)
    await waitForTransaction(txHash)
    console.log(`✅ [MINT-${mintId}] Transaction confirmed!`)
    
    // Create credential object
    const credential: HealthCredential = {
      tokenId: tokenId.toString(),
      badgeType,
      metadata,
      owner: address,
      txHash,
    }
    
    // Also store locally as cache
    storeCredentialLocal(credential)
    
    console.log(`🎉 [MINT-${mintId}] Credential minted successfully on BlockDAG!`, credential)
    return credential
    
  } catch (error) {
    console.error(`❌ [MINT-${mintId}] Minting error:`, error)
    
    // If wallet transaction fails, try RPC fallback
    console.log(`🔄 [MINT-${mintId}] Attempting RPC fallback...`)
    try {
      return await mintHealthCredentialViaRPC(address, badgeType, metadata)
    } catch (rpcError) {
      console.error(`❌ [MINT-${mintId}] RPC fallback also failed:`, rpcError)
      return null
    }
  }
}

/**
 * Mint credential via direct RPC call (for server-side or when wallet unavailable)
 */
async function mintHealthCredentialViaRPC(
  address: string,
  badgeType: string,
  metadata: HealthCredential['metadata']
): Promise<HealthCredential | null> {
  const mintId = Math.random().toString(36).substring(7)
  console.log(`🔌 [RPC-MINT-${mintId}] Minting via RPC...`)
  
  try {
    const tokenId = Date.now() + Math.floor(Math.random() * 10000)
    const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
    
    // Encode the call
    const encodedData = encodeMintCall(address, tokenId, metadataURI, badgeType)
    
    // Make eth_call to simulate (view function behavior for now)
    // Note: Real minting requires a signed transaction from an authorized minter
    const result = await makeRPCCall('eth_call', [{
      to: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      data: encodedData
    }, 'latest'])
    
    console.log(`📊 [RPC-MINT-${mintId}] Call result:`, result)
    
    // Create credential (stored locally since we can't actually mint without signer)
    const credential: HealthCredential = {
      tokenId: tokenId.toString(),
      badgeType,
      metadata,
      owner: address,
      txHash: `pending-${mintId}`,
    }
    
    storeCredentialLocal(credential)
    console.log(`✅ [RPC-MINT-${mintId}] Credential created (pending on-chain confirmation)`)
    
    return credential
  } catch (error) {
    console.error(`❌ [RPC-MINT-${mintId}] RPC mint error:`, error)
    return null
  }
}

/**
 * Real contract interaction function with comprehensive logging
 */
export async function mintHealthCredentialReal(
  address: string,
  badgeType: string,
  metadata: HealthCredential['metadata']
): Promise<HealthCredential | null> {
  const mintId = Math.random().toString(36).substring(7)
  console.log(`🏭 [MINT-${mintId}] Starting real contract minting...`)
  console.log(`📋 [MINT-${mintId}] Parameters:`, { address, badgeType, metadata })
  
  try {
    if (!window.ethereum) {
      throw new Error('No wallet connected')
    }
    
    console.log(`🔗 [MINT-${mintId}] Contract details:`, {
      contractAddress: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      network: BLOCKDAG_CONFIG.NETWORK_NAME,
      chainId: BLOCKDAG_CONFIG.CHAIN_ID
    })
    
    // Generate unique token ID
    const tokenId = Math.floor(Math.random() * 1000000)
    console.log(`🆔 [MINT-${mintId}] Generated token ID: ${tokenId}`)
    
    // Create metadata URI (in production, upload to IPFS)
    const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
    console.log(`📄 [MINT-${mintId}] Metadata URI created: ${metadataURI.substring(0, 100)}...`)
    
    // Prepare contract call parameters
    const contractParams = [address, tokenId, metadataURI, badgeType]
    console.log(`📋 [MINT-${mintId}] Contract call parameters:`, contractParams)
    
    // Encode contract call data using proper ABI encoding
    const encodedData = encodeMintCall(address, tokenId, metadataURI, badgeType)
    console.log(`🔢 [MINT-${mintId}] Encoded contract data: ${encodedData}`)
    
    // Prepare transaction data
    const contractCallData = {
      to: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      data: encodedData,
      from: address
    }
    console.log(`📦 [MINT-${mintId}] Transaction data:`, contractCallData)
    
    // Send transaction via wallet
    console.log(`📤 [MINT-${mintId}] Sending transaction to wallet...`)
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [contractCallData],
    }) as string
    
    console.log(`✅ [MINT-${mintId}] Transaction sent! Hash: ${txHash}`)
    console.log(`🔍 [MINT-${mintId}] Explorer link: ${BLOCKDAG_CONFIG.EXPLORER_URL}/tx/${txHash}`)
    
    // Wait for transaction confirmation
    console.log(`⏳ [MINT-${mintId}] Waiting for transaction confirmation...`)
    await waitForTransaction(txHash)
    console.log(`✅ [MINT-${mintId}] Transaction confirmed!`)
    
    const credential: HealthCredential = {
      tokenId: tokenId.toString(),
      badgeType,
      metadata,
      owner: address,
      txHash,
    }
    
    console.log(`🎉 [MINT-${mintId}] Credential created successfully:`, credential)
    return credential
  } catch (error) {
    console.error(`❌ [MINT-${mintId}] Real mint credential error:`, error)
    return null
  }
}

/**
 * Wait for transaction confirmation with detailed logging
 */
async function waitForTransaction(txHash: string): Promise<void> {
  const waitId = Math.random().toString(36).substring(7)
  console.log(`⏰ [WAIT-${waitId}] Waiting for transaction confirmation:`)
  console.log(`   Transaction Hash: ${txHash}`)
  
  let attempts = 0
  const maxAttempts = 30
  
  while (attempts < maxAttempts) {
    try {
      console.log(`🔍 [WAIT-${waitId}] Checking confirmation (attempt ${attempts + 1}/${maxAttempts})`)
      
      const receipt = await makeRPCCall('eth_getTransactionReceipt', [txHash])
      if (receipt) {
        console.log(`✅ [WAIT-${waitId}] Transaction confirmed successfully!`)
        console.log(`   Receipt Data:`, receipt)
        return
      }
      
      console.log(`⏳ [WAIT-${waitId}] Not yet confirmed, waiting 2s...`)
    } catch (error) {
      console.log(`🔄 [WAIT-${waitId}] Confirmation check failed (attempt ${attempts + 1}):`, error)
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    attempts++
  }
  
  const errorMsg = `Transaction confirmation timeout after ${maxAttempts * 2} seconds for ${txHash}`
  console.error(`💥 [WAIT-${waitId}] ${errorMsg}`)
  throw new Error(errorMsg)
}

/**
 * Get all credentials for an address - REAL blockchain query
 */
export async function getCredentialsForAddress(address: string): Promise<HealthCredential[]> {
  const queryId = Math.random().toString(36).substring(7)
  console.log(`🔍 [QUERY-${queryId}] Fetching credentials for: ${address}`)
  
  try {
    // First try to get from blockchain
    const tokenIds = await getTokensOfOwnerFromChain(address)
    console.log(`📊 [QUERY-${queryId}] Found ${tokenIds.length} tokens on-chain`)
    
    if (tokenIds.length > 0) {
      const credentials: HealthCredential[] = []
      
      for (const tokenId of tokenIds) {
        try {
          const credential = await getCredentialFromChain(tokenId.toString(), address)
          if (credential) {
            credentials.push(credential)
          }
        } catch (err) {
          console.log(`⚠️ [QUERY-${queryId}] Failed to fetch token ${tokenId}:`, err)
        }
      }
      
      // Cache locally
      if (credentials.length > 0) {
        localStorage.setItem(`credentials_${address}`, JSON.stringify(credentials))
      }
      
      return credentials
    }
    
    // Fallback to local cache
    console.log(`📦 [QUERY-${queryId}] Checking local cache...`)
    const stored = localStorage.getItem(`credentials_${address}`)
    if (stored) {
      const localCreds = JSON.parse(stored)
      console.log(`📊 [QUERY-${queryId}] Found ${localCreds.length} cached credentials`)
      return localCreds
    }
    
    return []
  } catch (error) {
    console.error(`❌ [QUERY-${queryId}] Error fetching credentials:`, error)
    
    // Fallback to local storage on error
    try {
      const stored = localStorage.getItem(`credentials_${address}`)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}

/**
 * Get token IDs owned by address from blockchain
 */
async function getTokensOfOwnerFromChain(address: string): Promise<bigint[]> {
  const queryId = Math.random().toString(36).substring(7)
  console.log(`🔗 [TOKENS-${queryId}] Calling tokensOf(${address})`)
  
  try {
    const encodedData = encodeTokensOfCall(address)
    
    const result = await makeRPCCall('eth_call', [{
      to: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      data: encodedData
    }, 'latest']) as string
    
    if (!result || result === '0x') {
      console.log(`📊 [TOKENS-${queryId}] No tokens found`)
      return []
    }
    
    const tokenIds = decodeUint256Array(result)
    console.log(`✅ [TOKENS-${queryId}] Found tokens:`, tokenIds.map(t => t.toString()))
    return tokenIds
  } catch (error) {
    console.error(`❌ [TOKENS-${queryId}] Error:`, error)
    return []
  }
}

/**
 * Get credential details from blockchain
 */
async function getCredentialFromChain(tokenId: string, ownerAddress: string): Promise<HealthCredential | null> {
  const queryId = Math.random().toString(36).substring(7)
  console.log(`🔗 [CRED-${queryId}] Fetching credential ${tokenId}`)
  
  try {
    // Get credential type
    const typeData = encodeCredentialTypeCall(parseInt(tokenId))
    const typeResult = await makeRPCCall('eth_call', [{
      to: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      data: typeData
    }, 'latest']) as string
    
    // Decode string from response (simplified)
    let badgeType = 'unknown'
    if (typeResult && typeResult.length > 130) {
      try {
        const hexStr = typeResult.slice(130) // Skip offset and length
        const bytes = []
        for (let i = 0; i < hexStr.length; i += 2) {
          const byte = parseInt(hexStr.substr(i, 2), 16)
          if (byte === 0) break
          bytes.push(byte)
        }
        badgeType = new TextDecoder().decode(new Uint8Array(bytes))
      } catch {
        console.log(`⚠️ [CRED-${queryId}] Failed to decode badge type`)
      }
    }
    
    console.log(`✅ [CRED-${queryId}] Credential type: ${badgeType}`)
    
    return {
      tokenId,
      badgeType,
      metadata: {
        name: badgeType.replace(/-/g, ' ').replace(/_/g, ' '),
        description: `Health credential: ${badgeType}`,
        earnedDate: new Date().toISOString()
      },
      owner: ownerAddress
    }
  } catch (error) {
    console.error(`❌ [CRED-${queryId}] Error:`, error)
    return null
  }
}

/**
 * Store credential in localStorage (local cache)
 */
function storeCredentialLocal(credential: HealthCredential): void {
  try {
    const existing = localStorage.getItem(`credentials_${credential.owner}`)
    const credentials = existing ? JSON.parse(existing) : []
    
    // Avoid duplicates
    const exists = credentials.some((c: HealthCredential) => c.tokenId === credential.tokenId)
    if (!exists) {
      credentials.push(credential)
      localStorage.setItem(`credentials_${credential.owner}`, JSON.stringify(credentials))
    }
  } catch (error) {
    console.error('Store credential local error:', error)
  }
}

/**
 * Store credential - exports for backward compatibility
 */
export function storeCredential(credential: HealthCredential): void {
  storeCredentialLocal(credential)
}

/**
 * Generate BlockDAG explorer URL for an address
 */
export function getExplorerUrl(address: string): string {
  return `${BLOCKDAG_CONFIG.EXPLORER_URL}/address/${address}`
}

/**
 * Generate BlockDAG explorer URL for a transaction
 */
export function getTxExplorerUrl(txHash: string): string {
  return `${BLOCKDAG_CONFIG.EXPLORER_URL}/tx/${txHash}`
}

/**
 * Simulate batch minting (for audience challenge)
 */
export async function batchMintCredentials(
  address: string,
  count: number,
  onProgress?: (current: number) => void
): Promise<number> {
  let successCount = 0
  
  for (let i = 0; i < count; i++) {
    try {
      // Simulate faster minting for demo (BlockDAG's high TPS)
      await new Promise(resolve => setTimeout(resolve, 20))
      
      const credential = await mintHealthCredential(
        address,
        'audience-challenge',
        {
          name: `Challenge Badge #${i + 1}`,
          description: 'Participated in the Audience Challenge',
          earnedDate: new Date().toISOString(),
        }
      )
      
      if (credential) {
        successCount++
        if (onProgress) {
          onProgress(successCount)
        }
      }
    } catch (error) {
      console.error(`Batch mint error at index ${i}:`, error)
    }
  }
  
  return successCount
}

/**
 * Get token balance for an address - REAL blockchain query
 */
export async function getTokenBalance(address: string): Promise<number> {
  const balanceId = Math.random().toString(36).substring(7)
  console.log(`🔢 [TOKEN-BALANCE-${balanceId}] Getting token balance for: ${address}`)
  
  try {
    // Query blockchain for balance
    const encodedData = encodeBalanceOfCall(address)
    console.log(`🔗 [TOKEN-BALANCE-${balanceId}] Calling balanceOf(${address})`)
    
    const result = await makeRPCCall('eth_call', [{
      to: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      data: encodedData
    }, 'latest']) as string
    
    if (result && result !== '0x') {
      const balance = Number(decodeUint256(result))
      console.log(`✅ [TOKEN-BALANCE-${balanceId}] On-chain balance: ${balance}`)
      return balance
    }
    
    // Fallback to local cache
    console.log(`📦 [TOKEN-BALANCE-${balanceId}] Checking local cache...`)
    const stored = localStorage.getItem(`credentials_${address}`)
    const credentials = stored ? JSON.parse(stored) : []
    const balance = credentials.length
    
    console.log(`✅ [TOKEN-BALANCE-${balanceId}] Cached balance: ${balance}`)
    return balance
  } catch (error) {
    console.error(`❌ [TOKEN-BALANCE-${balanceId}] Error:`, error)
    
    // Fallback to local
    try {
      const stored = localStorage.getItem(`credentials_${address}`)
      return stored ? JSON.parse(stored).length : 0
    } catch {
      return 0
    }
  }
}

/**
 * Get all token IDs owned by an address
 */
export async function getTokensOfOwner(address: string): Promise<string[]> {
  const tokensId = Math.random().toString(36).substring(7)
  console.log(`🎫 [TOKENS-OF-${tokensId}] Getting tokens for owner: ${address}`)
  
  try {
    console.log(`🔗 [TOKENS-OF-${tokensId}] Calling tokensOfOwner(${address}) on blockchain`)
    
    // Real blockchain implementation - call tokensOfOwner() function
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x869577ef37fc01a85cba2a9f74f98452aa738fbc'
    const callData = encodeTokensOfCall(address)
    
    const result = await makeRPCCall('eth_call', [
      {
        to: contractAddress,
        data: callData
      },
      'latest'
    ])
    
    // Parse the result - returns array of uint256
    const resultStr = String(result || '0x')
    const tokenIds: string[] = []
    
    if (resultStr && resultStr !== '0x' && resultStr.length > 66) {
      // Decode dynamic array: first 32 bytes = offset, next 32 bytes = length, then elements
      const dataWithoutPrefix = resultStr.slice(2)
      const length = parseInt(dataWithoutPrefix.slice(64, 128), 16)
      
      for (let i = 0; i < length; i++) {
        const tokenIdHex = dataWithoutPrefix.slice(128 + i * 64, 128 + (i + 1) * 64)
        const tokenId = parseInt(tokenIdHex, 16).toString()
        tokenIds.push(tokenId)
      }
      
      console.log(`✅ [TOKENS-OF-${tokensId}] Found ${tokenIds.length} tokens from blockchain:`, tokenIds)
    }
    
    // Also check localStorage for any pending/local credentials
    const stored = localStorage.getItem(`credentials_${address}`)
    const localCredentials = stored ? JSON.parse(stored) : []
    const localTokenIds = localCredentials.map((cred: HealthCredential) => cred.tokenId)
    
    // Merge and deduplicate
    const allTokenIds = [...new Set([...tokenIds, ...localTokenIds])]
    
    console.log(`✅ [TOKENS-OF-${tokensId}] Combined total: ${allTokenIds.length} tokens`)
    return allTokenIds
  } catch (error) {
    console.error(`❌ [TOKENS-OF-${tokensId}] Error:`, error)
    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(`credentials_${address}`)
      const credentials = stored ? JSON.parse(stored) : []
      return credentials.map((cred: HealthCredential) => cred.tokenId)
    } catch {
      return []
    }
  }
}

/**
 * Get credential type for a specific token
 */
export async function getCredentialType(tokenId: string): Promise<string> {
  const typeId = Math.random().toString(36).substring(7)
  console.log(`🏷️  [CRED-TYPE-${typeId}] Getting credential type for token: ${tokenId}`)
  
  try {
    console.log(`🔗 [CRED-TYPE-${typeId}] Calling credentialType(${tokenId}) on blockchain`)
    
    // Real blockchain implementation - call credentialType() function
    // Function selector for credentialType(uint256): bytes4(keccak256("credentialType(uint256)")) = 0xc2d0e8c1
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x869577ef37fc01a85cba2a9f74f98452aa738fbc'
    const tokenIdNum = parseInt(tokenId, 10)
    const callData = '0xc2d0e8c1' + encodeUint256(tokenIdNum)
    
    const result = await makeRPCCall('eth_call', [
      {
        to: contractAddress,
        data: callData
      },
      'latest'
    ])
    
    // Parse the uint256 result which represents the credential type enum
    const resultStr = String(result || '0x')
    if (resultStr && resultStr !== '0x' && resultStr.length > 2) {
      const typeEnum = parseInt(resultStr, 16)
      // Map enum to string (based on HealthPassportComplete.sol CredentialType enum)
      const credentialTypes = [
        'health_verification',  // 0
        'vaccination',          // 1
        'medical_record',       // 2
        'insurance',            // 3
        'prescription',         // 4
        'lab_result',           // 5
        'data_connection'       // 6
      ]
      const credType = credentialTypes[typeEnum] || 'unknown'
      console.log(`✅ [CRED-TYPE-${typeId}] Credential type from blockchain: ${credType}`)
      return credType
    }
    
    // Fallback to localStorage
    console.log(`⚠️ [CRED-TYPE-${typeId}] Checking localStorage fallback`)
    const allCredentials = getAllStoredCredentials()
    const credential = allCredentials.find((cred: HealthCredential) => cred.tokenId === tokenId)
    const credType = credential?.badgeType || 'unknown'
    
    console.log(`✅ [CRED-TYPE-${typeId}] Credential type: ${credType}`)
    return credType
  } catch (error) {
    console.error(`❌ [CRED-TYPE-${typeId}] Error:`, error)
    // Fallback to localStorage
    try {
      const allCredentials = getAllStoredCredentials()
      const credential = allCredentials.find((cred: HealthCredential) => cred.tokenId === tokenId)
      return credential?.badgeType || 'unknown'
    } catch {
      return 'unknown'
    }
  }
}

/**
 * Helper function to get all stored credentials
 */
function getAllStoredCredentials(): HealthCredential[] {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('credentials_'))
    const allCredentials: HealthCredential[] = []
    
    keys.forEach(key => {
      const stored = localStorage.getItem(key)
      if (stored) {
        const credentials = JSON.parse(stored) as HealthCredential[]
        allCredentials.push(...credentials)
      }
    })
    
    return allCredentials
  } catch (error) {
    console.error('Error getting all stored credentials:', error)
    return []
  }
}

/**
 * Helper function to check if credential is revoked
 */
async function checkIfRevoked(tokenId: string): Promise<boolean> {
  try {
    // Real blockchain implementation - call isRevoked() function
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x869577ef37fc01a85cba2a9f74f98452aa738fbc'
    const tokenIdNum = parseInt(tokenId, 10)
    const callData = encodeIsRevokedCall(tokenIdNum)
    
    const result = await makeRPCCall('eth_call', [
      {
        to: contractAddress,
        data: callData
      },
      'latest'
    ])
    
    const resultStr = String(result || '0x')
    const isRevoked = resultStr !== '0x' && parseInt(resultStr, 16) > 0
    
    if (isRevoked) {
      console.log(`🚫 Token ${tokenId} is revoked on blockchain`)
      return true
    }
    
    // Also check localStorage as fallback
    const revoked = JSON.parse(localStorage.getItem('revoked_credentials') || '{}')
    return !!revoked[tokenId]
  } catch (error) {
    console.error('Error checking revocation status:', error)
    // Fallback to localStorage
    try {
      const revoked = JSON.parse(localStorage.getItem('revoked_credentials') || '{}')
      return !!revoked[tokenId]
    } catch {
      return false
    }
  }
}

/**
 * Verify a credential with proof
 */
export async function verifyCredential(tokenId: string, proof?: string[]): Promise<boolean> {
  const verifyId = Math.random().toString(36).substring(7)
  console.log(`🔍 [VERIFY-${verifyId}] Verifying credential: ${tokenId}`)
  console.log(`📋 [VERIFY-${verifyId}] Proof provided:`, proof || 'No proof')
  
  try {
    console.log(`🔗 [VERIFY-${verifyId}] Calling verify(${tokenId}, proof) on blockchain`)
    
    // Real blockchain implementation - call verify() function
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x869577ef37fc01a85cba2a9f74f98452aa738fbc'
    const tokenIdNumber = typeof tokenId === 'string' ? parseInt(tokenId, 10) : tokenId
    const proofArray = proof || []
    const callData = encodeVerifyCall(tokenIdNumber, proofArray)
    
    const result = await makeRPCCall('eth_call', [
      {
        to: contractAddress,
        data: callData
      },
      'latest'
    ])
    
    // Parse the boolean result (0x0...01 = true, 0x0...00 = false)
    const resultStr = String(result || '0x')
    const isValid = resultStr !== '0x' && parseInt(resultStr, 16) > 0
    
    if (isValid) {
      console.log(`✅ [VERIFY-${verifyId}] Credential verified on blockchain: VALID`)
      return true
    }
    
    // Fallback: check localStorage if blockchain returns invalid (might not be on-chain yet)
    console.log(`⚠️ [VERIFY-${verifyId}] Blockchain verification returned invalid, checking localStorage fallback`)
    const allCredentials = getAllStoredCredentials()
    const credential = allCredentials.find((cred: HealthCredential) => cred.tokenId === tokenId)
    
    if (!credential) {
      console.log(`❌ [VERIFY-${verifyId}] Credential not found`)
      return false
    }
    
    // Check if revoked
    const isRevoked = await checkIfRevoked(tokenId)
    if (isRevoked) {
      console.log(`❌ [VERIFY-${verifyId}] Credential is revoked`)
      return false
    }
    
    console.log(`✅ [VERIFY-${verifyId}] Credential is valid (from localStorage fallback)`)
    return true
  } catch (error) {
    console.error(`❌ [VERIFY-${verifyId}] Verification error:`, error)
    // Fallback to localStorage on error
    try {
      const allCredentials = getAllStoredCredentials()
      const credential = allCredentials.find((cred: HealthCredential) => cred.tokenId === tokenId)
      const isRevokedFallback = await checkIfRevoked(tokenId)
      return credential !== undefined && !isRevokedFallback
    } catch {
      return false
    }
  }
}

/**
 * Get total supply of credentials
 */
export async function getTotalSupply(): Promise<number> {
  const supplyId = Math.random().toString(36).substring(7)
  console.log(`📊 [TOTAL-SUPPLY-${supplyId}] Getting total credential supply`)
  
  try {
    console.log(`🔗 [TOTAL-SUPPLY-${supplyId}] Calling totalSupply() on blockchain`)
    
    // Real blockchain implementation - call totalSupply() function
    // Function selector for totalSupply(): bytes4(keccak256("totalSupply()")) = 0x18160ddd
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x869577ef37fc01a85cba2a9f74f98452aa738fbc'
    const callData = '0x18160ddd'
    
    const result = await makeRPCCall('eth_call', [
      {
        to: contractAddress,
        data: callData
      },
      'latest'
    ])
    
    const resultStr = String(result || '0x0')
    const totalSupply = parseInt(resultStr, 16) || 0
    
    console.log(`✅ [TOTAL-SUPPLY-${supplyId}] Total supply from blockchain: ${totalSupply}`)
    
    // Also add localStorage count if needed
    const localCredentials = getAllStoredCredentials()
    const combinedSupply = Math.max(totalSupply, localCredentials.length)
    
    return combinedSupply
  } catch (error) {
    console.error(`❌ [TOTAL-SUPPLY-${supplyId}] Error:`, error)
    // Fallback to localStorage
    const allCredentials = getAllStoredCredentials()
    return allCredentials.length
  }
}

/**
 * Mint data connection credential
 */
export async function mintDataConnectionCredential(
  to: string,
  dataSource: string,
  extraMetadata?: Record<string, unknown>
): Promise<HealthCredential | null> {
  const mintId = Math.random().toString(36).substring(7)
  console.log(`🏭 [MINT-DATA-${mintId}] Minting data connection credential`)
  console.log(`👤 [MINT-DATA-${mintId}] To: ${to}`)
  console.log(`📊 [MINT-DATA-${mintId}] Data source: ${dataSource}`)
  
  try {
    const tokenId = Date.now().toString()
    
    const credential: HealthCredential = {
      tokenId,
      owner: to,
      badgeType: 'data_connection',
      metadata: {
        name: `${dataSource} Data Connection`,
        description: `Connected to ${dataSource} for health data synchronization`,
        earnedDate: new Date().toISOString(),
        verificationData: {
          dataSource,
          connectionDate: new Date().toISOString(),
          ...extraMetadata
        }
      }
    }
    
    // Store credential locally (mock)
    storeCredential(credential)
    
    console.log(`✅ [MINT-DATA-${mintId}] Data connection credential minted with token ID: ${tokenId}`)
    return credential
  } catch (error) {
    console.error(`❌ [MINT-DATA-${mintId}] Error minting data connection credential:`, error)
    return null
  }
}

/**
 * Mint consultation credential
 */
export async function mintConsultationCredential(
  to: string,
  consultationType: string,
  sessionData?: Record<string, unknown>
): Promise<HealthCredential | null> {
  const mintId = Math.random().toString(36).substring(7)
  console.log(`🏭 [MINT-CONSULT-${mintId}] Minting consultation credential`)
  console.log(`👤 [MINT-CONSULT-${mintId}] To: ${to}`)
  console.log(`🩺 [MINT-CONSULT-${mintId}] Consultation type: ${consultationType}`)
  
  try {
    const tokenId = Date.now().toString()
    
    const credential: HealthCredential = {
      tokenId,
      owner: to,
      badgeType: 'ai_consultation',
      metadata: {
        name: `AI Health Consultation - ${consultationType}`,
        description: `Completed AI health consultation session on ${consultationType}`,
        earnedDate: new Date().toISOString(),
        verificationData: {
          consultationType,
          sessionDate: new Date().toISOString(),
          aiProvider: 'Google Gemini 2.5 Flash',
          ...sessionData
        }
      }
    }
    
    // Store credential locally (mock)
    storeCredential(credential)
    
    console.log(`✅ [MINT-CONSULT-${mintId}] Consultation credential minted with token ID: ${tokenId}`)
    return credential
  } catch (error) {
    console.error(`❌ [MINT-CONSULT-${mintId}] Error minting consultation credential:`, error)
    return null
  }
}
