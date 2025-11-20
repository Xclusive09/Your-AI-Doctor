/**
 * ========================================
 * BlockDAG IDE - Smart Contract Deployment
 * ========================================
 * 
 * INSTRUCTIONS FOR USE IN BLOCKDAG IDE:
 * 
 * 1. Open BlockDAG IDE at https://ide.blockdag.network
 * 2. Create a new project
 * 3. Add HealthPassport.sol to the IDE
 * 4. Compile the contract in the IDE
 * 5. Copy this script to a new file (deploy.js)
 * 6. Update the configuration below
 * 7. Run this script in the IDE
 * 8. Download the ABI JSON from the compile output
 * 9. Save the contract address shown in the console
 * 
 * The script will:
 * - Connect to BlockDAG network using Web3.js
 * - Deploy the HealthPassport contract
 * - Display the contract address and transaction details
 * 
 * ========================================
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  // BlockDAG Network RPC endpoint
  rpcUrl: 'https://rpc.testnet.blockdag.network',
  
  // Your wallet private key (NEVER share this!)
  // Get from MetaMask or your wallet
  privateKey: '0xYOUR_PRIVATE_KEY_HERE',
  
  // Gas settings
  gasLimit: 5000000,
  gasPrice: '20000000000', // 20 Gwei
  
  // Network details
  chainId: 11155111, // Update with BlockDAG's chain ID
  networkName: 'BlockDAG Testnet'
};

// ==================== MAIN DEPLOYMENT FUNCTION ====================
async function main() {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   HealthPassport Contract Deployment       ║');
  console.log('║   BlockDAG Network                         ║');
  console.log('╚════════════════════════════════════════════╝\n');

  // Step 1: Initialize Web3
  console.log('🔗 Step 1: Connecting to BlockDAG...');
  const Web3 = require('web3');
  const web3 = new Web3(new Web3.providers.HttpProvider(CONFIG.rpcUrl));
  
  // Step 2: Setup account
  console.log('🔑 Step 2: Setting up wallet...');
  const account = web3.eth.accounts.privateKeyToAccount(CONFIG.privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;
  
  console.log('   Wallet Address:', account.address);
  
  // Step 3: Check balance
  console.log('💰 Step 3: Checking balance...');
  const balanceWei = await web3.eth.getBalance(account.address);
  const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
  console.log('   Balance:', balanceEth, 'BDAG');
  
  if (balanceWei === '0') {
    console.error('❌ Error: Insufficient balance!');
    console.log('   Please fund your wallet with BDAG tokens first.');
    return;
  }
  
  // Step 4: Get network info
  console.log('🌐 Step 4: Network information...');
  const networkId = await web3.eth.net.getId();
  const blockNumber = await web3.eth.getBlockNumber();
  console.log('   Network ID:', networkId);
  console.log('   Current Block:', blockNumber);
  
  // Step 5: Load compiled contract
  console.log('\n📦 Step 5: Loading compiled contract...');
  console.log('   ⚠️  Make sure you have compiled HealthPassport.sol in the IDE first!');
  
  // NOTE: In BlockDAG IDE, you will get the ABI and bytecode from the compile output
  // Replace these with the actual values from your compilation
  const contractABI = [
    // PASTE YOUR CONTRACT ABI HERE FROM BLOCKDAG IDE COMPILE OUTPUT
    // Example format:
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    }
    // ... rest of ABI
  ];
  
  const contractBytecode = '0x'; // PASTE YOUR CONTRACT BYTECODE HERE FROM BLOCKDAG IDE
  
  if (contractBytecode === '0x') {
    console.error('❌ Error: Contract bytecode not set!');
    console.log('   Please paste the compiled bytecode from BlockDAG IDE.');
    return;
  }
  
  // Step 6: Create contract instance
  console.log('🏗️  Step 6: Creating contract instance...');
  const contract = new web3.eth.Contract(contractABI);
  
  // Step 7: Prepare deployment
  console.log('📝 Step 7: Preparing deployment transaction...');
  const deployTx = contract.deploy({
    data: contractBytecode,
    arguments: [] // No constructor arguments for HealthPassport
  });
  
  // Step 8: Estimate gas
  console.log('⛽ Step 8: Estimating gas...');
  try {
    const estimatedGas = await deployTx.estimateGas({ from: account.address });
    console.log('   Estimated Gas:', estimatedGas);
  } catch (error) {
    console.warn('   Warning: Could not estimate gas, using default:', CONFIG.gasLimit);
  }
  
  // Step 9: Deploy contract
  console.log('\n🚀 Step 9: Deploying contract...');
  console.log('   This may take a few moments...\n');
  
  try {
    const deployedContract = await deployTx.send({
      from: account.address,
      gas: CONFIG.gasLimit,
      gasPrice: CONFIG.gasPrice
    });
    
    // Success!
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║          🎉 DEPLOYMENT SUCCESSFUL! 🎉      ║');
    console.log('╚════════════════════════════════════════════╝\n');
    
    console.log('📍 Contract Address:');
    console.log('   ', deployedContract.options.address);
    console.log('');
    console.log('🔗 Transaction Hash:');
    console.log('   ', deployedContract.transactionHash);
    console.log('');
    console.log('👤 Deployer:');
    console.log('   ', account.address);
    console.log('');
    console.log('⏰ Timestamp:');
    console.log('   ', new Date().toISOString());
    
    // Create deployment info for saving
    const deploymentInfo = {
      network: CONFIG.networkName,
      chainId: networkId,
      contractName: 'HealthPassport',
      contractAddress: deployedContract.options.address,
      transactionHash: deployedContract.transactionHash,
      deployer: account.address,
      deployedAt: new Date().toISOString(),
      blockNumber: blockNumber,
      abi: contractABI
    };
    
    console.log('\n📄 Deployment Details (copy this):');
    console.log('════════════════════════════════════════════');
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log('════════════════════════════════════════════\n');
    
    console.log('✅ NEXT STEPS:');
    console.log('1. Copy the contract address above');
    console.log('2. Download the ABI JSON from BlockDAG IDE compile output');
    console.log('3. Save the ABI to: contracts/HealthPassport.json');
    console.log('4. Update your frontend with the contract address');
    console.log('5. Test the contract on BlockDAG Explorer');
    
    return deploymentInfo;
    
  } catch (error) {
    console.error('\n❌ Deployment failed!');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    throw error;
  }
}

// Run the deployment
main()
  .then(() => {
    console.log('\n✅ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script execution failed!');
    console.error(error);
    process.exit(1);
  });
