
const YOUR_PRIVATE_KEY = '0x0000000000000000000000000000000000000000000000000000000000000000';

const RPC_URL = 'https://rpc.testnet.blockdag.network';

const GAS_LIMIT = 5000000;
const GAS_PRICE = '20000000000'; // 20 Gwei


const CONTRACT_ABI = [
  // ⚠️  PASTE YOUR ABI HERE
  // Example structure - replace with your actual ABI:
  // {
  //   "type": "constructor",
  //   "inputs": [],
  //   "stateMutability": "nonpayable"
  // },
  // {
  //   "type": "function",
  //   "name": "mintSoulbound",
  //   "inputs": [...],
  //   "outputs": [...],
  //   "stateMutability": "nonpayable"
  // }
  // ... rest of ABI
];

// ═══════════════════════════════════════════════════════════════
// STEP 3: PASTE YOUR CONTRACT BYTECODE (from BlockDAG IDE compilation)
// ═══════════════════════════════════════════════════════════════

const CONTRACT_BYTECODE = '0x';
// ⚠️  PASTE YOUR BYTECODE HERE
// Should be a long hex string starting with 0x

// ═══════════════════════════════════════════════════════════════
// DEPLOYMENT SCRIPT - DO NOT MODIFY BELOW THIS LINE
// ═══════════════════════════════════════════════════════════════

const Web3 = require('web3');

async function deploy() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║        🏥 HEALTHPASSPORT CONTRACT DEPLOYMENT 🏥        ║');
  console.log('║              BlockDAG Network                          ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('\n');

  // Validation
  if (YOUR_PRIVATE_KEY === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    console.error('❌ ERROR: Please update YOUR_PRIVATE_KEY with your wallet private key!');
    console.log('\n   Edit line 25 of this script.\n');
    return;
  }

  if (CONTRACT_BYTECODE === '0x') {
    console.error('❌ ERROR: Please paste your contract bytecode!');
    console.log('\n   1. Compile HealthPassport.sol in BlockDAG IDE');
    console.log('   2. Copy the bytecode from compilation output');
    console.log('   3. Paste it at line 69 of this script\n');
    return;
  }

  if (!CONTRACT_ABI || CONTRACT_ABI.length === 0) {
    console.error('❌ ERROR: Please paste your contract ABI!');
    console.log('\n   1. Compile HealthPassport.sol in BlockDAG IDE');
    console.log('   2. Copy the ABI JSON from compilation output');
    console.log('   3. Paste it at line 45 of this script\n');
    return;
  }

  try {
    // Initialize Web3
    console.log('🔗 Connecting to BlockDAG...');
    const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
    console.log('   ✅ Connected to:', RPC_URL);

    // Setup wallet
    console.log('\n🔑 Setting up wallet...');
    const account = web3.eth.accounts.privateKeyToAccount(YOUR_PRIVATE_KEY);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    console.log('   ✅ Wallet:', account.address);

    // Check balance
    console.log('\n💰 Checking balance...');
    const balance = await web3.eth.getBalance(account.address);
    const balanceInBDAG = web3.utils.fromWei(balance, 'ether');
    console.log('   ✅ Balance:', balanceInBDAG, 'BDAG');

    if (balance === '0') {
      console.error('\n❌ ERROR: Your wallet has zero balance!');
      console.log('   Please fund your wallet with BDAG tokens first.\n');
      return;
    }

    // Network info
    console.log('\n🌐 Network information...');
    const networkId = await web3.eth.net.getId();
    const blockNumber = await web3.eth.getBlockNumber();
    const gasPrice = await web3.eth.getGasPrice();
    console.log('   Network ID:', networkId);
    console.log('   Block Number:', blockNumber);
    console.log('   Gas Price:', web3.utils.fromWei(gasPrice, 'gwei'), 'Gwei');

    // Create contract
    console.log('\n📦 Preparing contract deployment...');
    const contract = new web3.eth.Contract(CONTRACT_ABI);
    
    const deployTx = contract.deploy({
      data: CONTRACT_BYTECODE,
      arguments: []
    });

    // Estimate gas
    console.log('⛽ Estimating gas...');
    let estimatedGas;
    try {
      estimatedGas = await deployTx.estimateGas({ from: account.address });
      console.log('   Estimated Gas:', estimatedGas);
    } catch (e) {
      console.log('   Using default gas limit:', GAS_LIMIT);
      estimatedGas = GAS_LIMIT;
    }

    // Deploy
    console.log('\n🚀 Deploying contract...');
    console.log('   ⏳ Please wait, this may take a minute...\n');

    const deployedContract = await deployTx.send({
      from: account.address,
      gas: GAS_LIMIT,
      gasPrice: GAS_PRICE
    });

    // Success!
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║              🎉 DEPLOYMENT SUCCESSFUL! 🎉              ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\n');

    console.log('📍 CONTRACT ADDRESS:');
    console.log('   ➜', deployedContract.options.address);
    console.log('');
    
    console.log('🔗 TRANSACTION HASH:');
    console.log('   ➜', deployedContract.transactionHash);
    console.log('');
    
    console.log('👤 DEPLOYED BY:');
    console.log('   ➜', account.address);
    console.log('');
    
    console.log('⏰ TIMESTAMP:');
    console.log('   ➜', new Date().toISOString());
    console.log('\n');

    // Deployment info JSON
    const deploymentInfo = {
      contractName: 'HealthPassport',
      contractAddress: deployedContract.options.address,
      transactionHash: deployedContract.transactionHash,
      deployer: account.address,
      network: 'BlockDAG Testnet',
      networkId: networkId.toString(),
      deployedAt: new Date().toISOString(),
      blockNumber: blockNumber.toString(),
      abi: CONTRACT_ABI
    };

    console.log('════════════════════════════════════════════════════════');
    console.log('📄 DEPLOYMENT INFO (save this):');
    console.log('════════════════════════════════════════════════════════');
    console.log(JSON.stringify(deploymentInfo, null, 2));
    console.log('════════════════════════════════════════════════════════');
    console.log('\n');

    console.log('✅ NEXT STEPS:');
    console.log('');
    console.log('1. 📋 Copy the contract address above');
    console.log('   ➜', deployedContract.options.address);
    console.log('');
    console.log('2. 💾 Save the ABI to your project:');
    console.log('   ➜ Create file: contracts/HealthPassport.json');
    console.log('   ➜ Paste the ABI from compilation output');
    console.log('');
    console.log('3. 🔧 Update your frontend code:');
    console.log('   ➜ Add contract address to your config');
    console.log('   ➜ Import the ABI in your Web3 client');
    console.log('');
    console.log('4. 🔍 Verify on BlockDAG Explorer:');
    console.log('   ➜ https://explorer.testnet.blockdag.network/address/' + deployedContract.options.address);
    console.log('');
    console.log('5. 🧪 Test the contract:');
    console.log('   ➜ Call read functions first (ownerOf, balanceOf, etc.)');
    console.log('   ➜ Then test write functions (mintSoulbound, etc.)');
    console.log('\n');

    console.log('════════════════════════════════════════════════════════');
    console.log('🎊 Congratulations! Your contract is live on BlockDAG! 🎊');
    console.log('════════════════════════════════════════════════════════');
    console.log('\n');

    return deploymentInfo;

  } catch (error) {
    console.error('\n');
    console.error('╔════════════════════════════════════════════════════════╗');
    console.error('║              ❌ DEPLOYMENT FAILED ❌                   ║');
    console.error('╚════════════════════════════════════════════════════════╝');
    console.error('\n');
    console.error('Error Message:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.error('\n💡 TIP: Your wallet needs more BDAG tokens.');
      console.error('   Get testnet tokens from a BlockDAG faucet.\n');
    } else if (error.message.includes('nonce')) {
      console.error('\n💡 TIP: Try waiting a moment and running again.');
      console.error('   There might be a pending transaction.\n');
    } else if (error.message.includes('gas')) {
      console.error('\n💡 TIP: Try increasing the GAS_LIMIT value.');
      console.error('   Edit line 31 of this script.\n');
    }
    
    if (error.stack) {
      console.error('Stack Trace:');
      console.error(error.stack);
    }
    
    console.error('\n');
    throw error;
  }
}

// Run the deployment
deploy()
  .then(() => {
    console.log('✅ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed!\n');
    process.exit(1);
  });
