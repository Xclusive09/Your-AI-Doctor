// Browser console test functions
// Copy and paste these into your browser console when testing

window.testBlockDAG = {
  // Test network connectivity
  async testNetwork() {
    try {
      const response = await fetch('https://rpc.awakening.bdagscan.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_chainId',
          params: [],
        }),
      })
      
      const data = await response.json()
      if (data.result) {
        const chainId = parseInt(data.result, 16)
        console.log('✅ Network responsive, Chain ID:', chainId)
        return true
      } else {
        console.error('❌ Network error:', data.error)
        return false
      }
    } catch (error) {
      console.error('❌ Network connection failed:', error)
      return false
    }
  },

  // Test wallet connection
  async testWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        console.log('✅ Wallet connected:', accounts[0])
        return accounts[0]
      } catch (error) {
        console.error('❌ Wallet connection failed:', error)
        return null
      }
    } else {
      console.error('❌ No wallet detected')
      return null
    }
  },

  // Test balance retrieval
  async testBalance(address) {
    try {
      const response = await fetch('https://rpc.awakening.bdagscan.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }),
      })
      
      const data = await response.json()
      if (data.result) {
        const balance = parseInt(data.result, 16) / Math.pow(10, 18)
        console.log('✅ Balance:', balance.toFixed(4), 'BDAG')
        return balance
      } else {
        console.error('❌ Balance error:', data.error)
        return 0
      }
    } catch (error) {
      console.error('❌ Balance fetch failed:', error)
      return 0
    }
  },

  // Configuration check
  showConfig() {
    console.log('🔧 Current Configuration:')
    console.log('Contract Address: 0x869577ef37fc01a85cba2a9f74f98452aa738fbc')
    console.log('RPC URL: https://rpc.awakening.bdagscan.com')
    console.log('Chain ID: 1043')
    console.log('Explorer: https://bdagscan.com')
  },

  // Full test suite
  async runAllTests() {
    console.log('🧪 Starting BlockDAG Integration Tests...')
    
    // Test 1: Configuration
    this.showConfig()
    
    // Test 2: Network
    console.log('\n🌐 Testing network...')
    const networkOk = await this.testNetwork()
    if (!networkOk) return false
    
    // Test 3: Wallet
    console.log('\n👛 Testing wallet...')
    const address = await this.testWallet()
    if (!address) return false
    
    // Test 4: Balance
    console.log('\n💰 Testing balance...')
    await this.testBalance(address)
    
    console.log('\n🎉 Basic tests completed!')
    return true
  }
}

// Auto-run when loaded
console.log('🚀 BlockDAG test functions loaded! Use:')
console.log('- testBlockDAG.runAllTests() - Run all tests')
console.log('- testBlockDAG.testNetwork() - Test network connectivity')
console.log('- testBlockDAG.testWallet() - Test wallet connection')
console.log('- testBlockDAG.showConfig() - Show configuration')
