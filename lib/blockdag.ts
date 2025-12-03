// BlockDAG testnet integration utilities
// Real blockchain integration for HealthPassport smart contract

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
 * Mint a health credential - MOCK implementation with detailed logging
 * This simulates the real contract interaction for testing purposes
 */
export async function mintHealthCredential(
  address: string,
  badgeType: string,
  metadata: HealthCredential['metadata']
): Promise<HealthCredential | null> {
  const mockId = Math.random().toString(36).substring(7)
  console.log(`🎭 [MOCK-${mockId}] Starting MOCK credential minting...`)
  console.log(`📋 [MOCK-${mockId}] This is a simulation - no real blockchain transaction`)
  
  try {
    console.log(`📋 [MOCK-${mockId}] Input parameters:`, {
      address,
      badgeType,
      metadata,
      contractAddress: BLOCKDAG_CONFIG.CONTRACT_ADDRESS,
      network: BLOCKDAG_CONFIG.NETWORK_NAME
    })
    
    // Simulate what a real contract call would look like
    console.log(`🔗 [MOCK-${mockId}] Simulating contract interaction:`)
    console.log(`   Contract: ${BLOCKDAG_CONFIG.CONTRACT_ADDRESS}`)
    console.log(`   Function: mint(${address}, tokenId, uri, "${badgeType}")`)
    console.log(`   Network: ${BLOCKDAG_CONFIG.NETWORK_NAME} (Chain ID: ${BLOCKDAG_CONFIG.CHAIN_ID})`)
    
    // Simulate transaction time
    console.log(`⏳ [MOCK-${mockId}] Simulating transaction processing (2 seconds)...`)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Generate mock token ID (in real implementation, this comes from the contract)
    const tokenId = `${Math.floor(Math.random() * 1000000)}`
    const txHash = '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
    
    console.log(`🆔 [MOCK-${mockId}] Generated mock token ID: ${tokenId}`)
    console.log(`📝 [MOCK-${mockId}] Generated mock transaction hash: ${txHash}`)
    console.log(`🔍 [MOCK-${mockId}] Mock explorer link: ${BLOCKDAG_CONFIG.EXPLORER_URL}/tx/${txHash}`)
    
    const credential: HealthCredential = {
      tokenId,
      badgeType,
      metadata,
      owner: address,
      txHash,
    }
    
    console.log(`💾 [MOCK-${mockId}] Storing credential locally...`)
    // Store locally for demo purposes
    storeCredential(credential)
    
    console.log(`✅ [MOCK-${mockId}] Mock credential created successfully:`, credential)
    console.log(`⚠️  [MOCK-${mockId}] Remember: This was a simulation. To use real contract, call mintHealthCredentialReal()`)
    
    return credential
  } catch (error) {
    console.error(`❌ [MOCK-${mockId}] Mock mint credential error:`, error)
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
    
    // Encode contract call data
    const encodedData = encodeContractCall('mint', contractParams)
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
 * Encode contract function call with detailed logging
 */
function encodeContractCall(functionName: string, params: unknown[]): string {
  const encodeId = Math.random().toString(36).substring(7)
  console.log(`🔢 [ENCODE-${encodeId}] Encoding contract call:`)
  console.log(`   Function: ${functionName}`)
  console.log(`   Parameters:`, params)
  
  // TODO: Implement proper ABI encoding using ethers or web3
  // For now, create a mock encoded call
  const mockEncoded = '0xa9059cbb' + '0'.repeat(128) // Mock function signature + padded params
  console.log(`📝 [ENCODE-${encodeId}] Mock encoded data: ${mockEncoded}`)
  console.log(`⚠️  [ENCODE-${encodeId}] This is placeholder encoding - implement with ethers.js for production`)
  
  return mockEncoded
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
 * Get all credentials for an address
 */
export async function getCredentialsForAddress(address: string): Promise<HealthCredential[]> {
  try {
    // Mock implementation
    // In production, this would query the blockchain
    const mockCredentials: HealthCredential[] = []
    
    // Return mock credentials from localStorage if available
    const stored = localStorage.getItem(`credentials_${address}`)
    if (stored) {
      return JSON.parse(stored)
    }
    
    return mockCredentials
  } catch (error) {
    console.error('Get credentials error:', error)
    return []
  }
}

/**
 * Store credential in localStorage (mock blockchain storage)
 */
export function storeCredential(credential: HealthCredential): void {
  try {
    const existing = localStorage.getItem(`credentials_${credential.owner}`)
    const credentials = existing ? JSON.parse(existing) : []
    credentials.push(credential)
    localStorage.setItem(`credentials_${credential.owner}`, JSON.stringify(credentials))
  } catch (error) {
    console.error('Store credential error:', error)
  }
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
 * Get token balance for an address (number of credentials owned)
 */
export async function getTokenBalance(address: string): Promise<number> {
  const balanceId = Math.random().toString(36).substring(7)
  console.log(`🔢 [TOKEN-BALANCE-${balanceId}] Getting token balance for: ${address}`)
  
  try {
    console.log(`🔗 [TOKEN-BALANCE-${balanceId}] Calling balanceOf(${address})`)
    
    // Mock implementation - get from localStorage
    const stored = localStorage.getItem(`credentials_${address}`)
    const credentials = stored ? JSON.parse(stored) : []
    const balance = credentials.length
    
    console.log(`✅ [TOKEN-BALANCE-${balanceId}] Token balance: ${balance}`)
    return balance
  } catch (error) {
    console.error(`❌ [TOKEN-BALANCE-${balanceId}] Error:`, error)
    return 0
  }
}

/**
 * Get all token IDs owned by an address
 */
export async function getTokensOfOwner(address: string): Promise<string[]> {
  const tokensId = Math.random().toString(36).substring(7)
  console.log(`🎫 [TOKENS-OF-${tokensId}] Getting tokens for owner: ${address}`)
  
  try {
    console.log(`🔗 [TOKENS-OF-${tokensId}] Calling tokensOf(${address})`)
    
    // Mock implementation - extract token IDs from stored credentials
    const stored = localStorage.getItem(`credentials_${address}`)
    const credentials = stored ? JSON.parse(stored) : []
    const tokenIds = credentials.map((cred: HealthCredential) => cred.tokenId)
    
    console.log(`✅ [TOKENS-OF-${tokensId}] Found ${tokenIds.length} tokens:`, tokenIds)
    return tokenIds
  } catch (error) {
    console.error(`❌ [TOKENS-OF-${tokensId}] Error:`, error)
    return []
  }
}

/**
 * Get credential type for a specific token
 */
export async function getCredentialType(tokenId: string): Promise<string> {
  const typeId = Math.random().toString(36).substring(7)
  console.log(`🏷️  [CRED-TYPE-${typeId}] Getting credential type for token: ${tokenId}`)
  
  try {
    console.log(`🔗 [CRED-TYPE-${typeId}] Calling credentialType(${tokenId})`)
    
    // Mock implementation - find in all stored credentials
    const allCredentials = getAllStoredCredentials()
    const credential = allCredentials.find((cred: HealthCredential) => cred.tokenId === tokenId)
    const credType = credential?.badgeType || 'unknown'
    
    console.log(`✅ [CRED-TYPE-${typeId}] Credential type: ${credType}`)
    return credType
  } catch (error) {
    console.error(`❌ [CRED-TYPE-${typeId}] Error:`, error)
    return 'unknown'
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
function checkIfRevoked(tokenId: string): boolean {
  try {
    const revoked = JSON.parse(localStorage.getItem('revoked_credentials') || '{}')
    return !!revoked[tokenId]
  } catch (error) {
    console.error('Error checking revocation status:', error)
    return false
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
    console.log(`🔗 [VERIFY-${verifyId}] Calling verify(${tokenId}, proof)`)
    
    // Mock implementation - check if credential exists and is not revoked
    const allCredentials = getAllStoredCredentials()
    const credential = allCredentials.find((cred: HealthCredential) => cred.tokenId === tokenId)
    
    if (!credential) {
      console.log(`❌ [VERIFY-${verifyId}] Credential not found`)
      return false
    }
    
    // Check if revoked (mock)
    const isRevoked = checkIfRevoked(tokenId)
    if (isRevoked) {
      console.log(`❌ [VERIFY-${verifyId}] Credential is revoked`)
      return false
    }
    
    console.log(`✅ [VERIFY-${verifyId}] Credential is valid`)
    return true
  } catch (error) {
    console.error(`❌ [VERIFY-${verifyId}] Verification error:`, error)
    return false
  }
}

/**
 * Get total supply of credentials
 */
export async function getTotalSupply(): Promise<number> {
  const supplyId = Math.random().toString(36).substring(7)
  console.log(`📊 [TOTAL-SUPPLY-${supplyId}] Getting total credential supply`)
  
  try {
    console.log(`🔗 [TOTAL-SUPPLY-${supplyId}] Calling totalSupply()`)
    
    // Mock implementation - count all stored credentials
    const allCredentials = getAllStoredCredentials()
    const totalSupply = allCredentials.length
    
    console.log(`✅ [TOTAL-SUPPLY-${supplyId}] Total supply: ${totalSupply}`)
    return totalSupply
  } catch (error) {
    console.error(`❌ [TOTAL-SUPPLY-${supplyId}] Error:`, error)
    return 0
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
