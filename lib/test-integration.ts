// Test functions for BlockDAG integration
// Run these to verify the contract deployment and integration

import { 
  connectWallet, 
  getBalance, 
  mintHealthCredential,
  BLOCKDAG_CONFIG 
} from './blockdag'

/**
 * Test the complete integration workflow with detailed logging
 */
export async function testIntegration() {
  const testId = Math.random().toString(36).substring(7)
  console.log(`🧪 [INTEGRATION-${testId}] Starting BlockDAG Integration Tests...`)
  console.log(`   Timestamp: ${new Date().toISOString()}`)
  console.log(`   Test Session ID: ${testId}`)
  
  // Test 1: Check configuration
  console.log(`\n1️⃣ [INTEGRATION-${testId}] Configuration Check:`)
  console.log(`   Contract Address: ${BLOCKDAG_CONFIG.CONTRACT_ADDRESS}`)
  console.log(`   RPC URL: ${BLOCKDAG_CONFIG.RPC_URL}`)
  console.log(`   Chain ID: ${BLOCKDAG_CONFIG.CHAIN_ID}`)
  console.log(`   Configuration Status: ${BLOCKDAG_CONFIG.CONTRACT_ADDRESS ? '✅ Valid' : '❌ Missing Contract'}`)
  
  // Test 2: Connect wallet
  console.log(`\n2️⃣ [INTEGRATION-${testId}] Connecting Wallet...`)
  const walletStart = performance.now()
  
  try {
    const address = await connectWallet()
    const walletTime = performance.now() - walletStart
    
    if (!address) {
      console.error(`❌ [INTEGRATION-${testId}] Wallet connection failed - no address returned`)
      return false
    }
    console.log(`✅ [INTEGRATION-${testId}] Wallet connected successfully:`)
    console.log(`   Address: ${address}`)
    console.log(`   Connection Time: ${walletTime.toFixed(2)}ms`)
    
    // Test 3: Get balance
    console.log(`\n3️⃣ [INTEGRATION-${testId}] Getting Balance...`)
    const balanceStart = performance.now()
    const balance = await getBalance(address)
    const balanceTime = performance.now() - balanceStart
    console.log(`✅ [INTEGRATION-${testId}] Balance retrieved:`)
    console.log(`   Balance: ${balance} BDAG`)
    console.log(`   Query Time: ${balanceTime.toFixed(2)}ms`)
    
    // Test 4: Mint test credential
    console.log(`\n4️⃣ [INTEGRATION-${testId}] Minting Test Credential...`)
    const mintStart = performance.now()
    const testCredential = await mintHealthCredential(
      address,
      'test-badge',
      {
        name: 'Test Badge',
        description: 'Integration test credential',
        earnedDate: new Date().toISOString()
      }
    )
    const mintTime = performance.now() - mintStart
    
    if (testCredential) {
      console.log(`✅ [INTEGRATION-${testId}] Credential minted successfully!`)
      console.log(`   Token ID: ${testCredential.tokenId || 'N/A'}`)
      console.log(`   Transaction: ${testCredential.txHash || 'N/A'}`)
      console.log(`   Mint Time: ${mintTime.toFixed(2)}ms`)
    } else {
      console.error(`❌ [INTEGRATION-${testId}] Credential minting failed - no result returned`)
      return false
    }
    
    const totalTime = performance.now() - walletStart
    console.log(`\n🎉 [INTEGRATION-${testId}] All tests passed! Integration is working.`)
    console.log(`   Total Test Duration: ${totalTime.toFixed(2)}ms`)
    console.log(`   Tests Completed: 4/4`)
    console.log(`   Success Rate: 100%`)
    return true
    
  } catch (error) {
    console.error(`❌ [INTEGRATION-${testId}] Integration test failed:`)
    console.error(`   Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`)
    console.error(`   Error Message: ${error instanceof Error ? error.message : String(error)}`)
    console.error(`   Full Error:`, error)
    return false
  }
}

/**
 * Test network connectivity with detailed logging
 */
export async function testNetwork() {
  const networkId = Math.random().toString(36).substring(7)
  console.log(`🌐 [NETWORK-${networkId}] Testing network connectivity...`)
  console.log(`   RPC URL: ${BLOCKDAG_CONFIG.RPC_URL}`)
  console.log(`   Expected Chain ID: ${BLOCKDAG_CONFIG.CHAIN_ID}`)
  
  const requestStart = performance.now()
  
  try {
    const requestBody = {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_chainId',
      params: [],
    }
    
    console.log(`📤 [NETWORK-${networkId}] Sending RPC request:`, requestBody)
    
    const response = await fetch(BLOCKDAG_CONFIG.RPC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    
    const responseTime = performance.now() - requestStart
    console.log(`📥 [NETWORK-${networkId}] Response received (${responseTime.toFixed(2)}ms)`)
    console.log(`   Status: ${response.status} ${response.statusText}`)
    
    if (!response.ok) {
      console.error(`❌ [NETWORK-${networkId}] HTTP Error: ${response.status} ${response.statusText}`)
      return false
    }
    
    const data = await response.json()
    console.log(`🔍 [NETWORK-${networkId}] Response data:`, data)
    
    if (data.result) {
      const chainId = parseInt(data.result, 16)
      console.log(`✅ [NETWORK-${networkId}] Network responsive:`)
      console.log(`   Chain ID: ${chainId} (hex: ${data.result})`)
      console.log(`   Response Time: ${responseTime.toFixed(2)}ms`)
      
      if (chainId !== BLOCKDAG_CONFIG.CHAIN_ID) {
        console.warn(`⚠️  [NETWORK-${networkId}] Chain ID mismatch!`)
        console.warn(`   Expected: ${BLOCKDAG_CONFIG.CHAIN_ID}`)
        console.warn(`   Received: ${chainId}`)
        console.warn(`   This may cause transaction failures`)
      } else {
        console.log(`✅ [NETWORK-${networkId}] Chain ID matches expected value`)
      }
      
      return true
    } else {
      console.error(`❌ [NETWORK-${networkId}] RPC Error:`)
      console.error(`   Error Code: ${data.error?.code || 'Unknown'}`)
      console.error(`   Error Message: ${data.error?.message || 'No message'}`)
      console.error(`   Full Error:`, data.error)
      return false
    }
  } catch (error) {
    const errorTime = performance.now() - requestStart
    console.error(`❌ [NETWORK-${networkId}] Network connection failed (${errorTime.toFixed(2)}ms):`)
    console.error(`   Error Type: ${error instanceof Error ? error.constructor.name : 'Unknown'}`)
    console.error(`   Error Message: ${error instanceof Error ? error.message : String(error)}`)
    console.error(`   Full Error:`, error)
    return false
  }
}

/**
 * Display integration checklist with status validation
 */
export function showIntegrationChecklist() {
  const checklistId = Math.random().toString(36).substring(7)
  console.log(`🔧 [CHECKLIST-${checklistId}] BlockDAG Integration Checklist`)
  console.log(`   Generated: ${new Date().toISOString()}`)
  console.log(`   Checklist ID: ${checklistId}`)
  
  // Validate current configuration status
  const contractConfigured = BLOCKDAG_CONFIG.CONTRACT_ADDRESS && BLOCKDAG_CONFIG.CONTRACT_ADDRESS !== 'your-contract-address-here'
  const rpcConfigured = BLOCKDAG_CONFIG.RPC_URL && BLOCKDAG_CONFIG.RPC_URL.startsWith('http')
  const chainIdConfigured = BLOCKDAG_CONFIG.CHAIN_ID && BLOCKDAG_CONFIG.CHAIN_ID > 0
  const walletAvailable = typeof window !== 'undefined' && window.ethereum
  
  console.log(`\n📋 [CHECKLIST-${checklistId}] Pre-flight Requirements:`)
  console.log(``)
  console.log(`1. ${contractConfigured ? '✅' : '❌'} Contract deployed on BlockDAG testnet`)
  console.log(`2. ${contractConfigured ? '✅' : '❌'} Contract address updated in BLOCKDAG_CONFIG`)
  console.log(`3. ${rpcConfigured && chainIdConfigured ? '✅' : '❌'} Correct RPC URL and Chain ID`)
  console.log(`4. ${walletAvailable ? '✅' : '❌'} MetaMask or compatible wallet installed`)
  console.log(`5. ⏳ Test BDAG tokens in wallet (check manually)`)
  console.log(`6. ⏳ BlockDAG network added to wallet (check manually)`)
  
  console.log(`\n⚙️  [CHECKLIST-${checklistId}] Current Configuration:`)
  console.log(`   Contract: ${BLOCKDAG_CONFIG.CONTRACT_ADDRESS} ${contractConfigured ? '✅' : '❌'}`)
  console.log(`   RPC: ${BLOCKDAG_CONFIG.RPC_URL} ${rpcConfigured ? '✅' : '❌'}`)
  console.log(`   Chain ID: ${BLOCKDAG_CONFIG.CHAIN_ID} ${chainIdConfigured ? '✅' : '❌'}`)
  console.log(`   Wallet: ${walletAvailable ? 'Available' : 'Not Available'} ${walletAvailable ? '✅' : '❌'}`)
  
  const readyScore = [contractConfigured, rpcConfigured, chainIdConfigured, walletAvailable].filter(Boolean).length
  const readyPercent = (readyScore / 4) * 100
  
  console.log(`\n📊 [CHECKLIST-${checklistId}] Readiness Status:`)
  console.log(`   Ready: ${readyScore}/4 items (${readyPercent}%)`)
  console.log(`   Status: ${readyPercent === 100 ? '🚀 Ready to test!' : readyPercent >= 75 ? '⚠️  Nearly ready' : '🔧 Needs configuration'}`)
  
  if (readyPercent < 100) {
    console.log(`\n🛠️  [CHECKLIST-${checklistId}] Next Steps:`)
    if (!contractConfigured) {
      console.log(`   1. Update CONTRACT_ADDRESS with your deployed contract`)
    }
    if (!rpcConfigured) {
      console.log(`   2. Update RPC_URL if different`)
    }
    if (!chainIdConfigured) {
      console.log(`   3. Update CHAIN_ID if different`)
    }
    if (!walletAvailable) {
      console.log(`   4. Install MetaMask or compatible wallet`)
    }
  }
  
  console.log(`\n🧪 [CHECKLIST-${checklistId}] Testing Commands:`)
  console.log(`   • testNetwork() - Verify network connectivity`)
  console.log(`   • testIntegration() - Run complete workflow test`)
  console.log(`   • Visit /test page for interactive testing`)
  console.log(``)
}
