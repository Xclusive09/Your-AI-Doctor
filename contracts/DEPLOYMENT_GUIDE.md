# BlockDAG Smart Contract Deployment Guide

This guide explains how to compile, deploy, and integrate the HealthPassport smart contract using BlockDAG IDE and Web3.js.

## 📋 Prerequisites

1. **BlockDAG Wallet**
   - Create a wallet compatible with BlockDAG network
   - Fund it with test BDAG tokens
   - Save your private key securely

2. **BlockDAG IDE Access**
   - Visit [BlockDAG IDE](https://ide.blockdag.network) (or your BlockDAG development environment)
   - Ensure you have access to the compilation and deployment features

3. **Node.js and Web3.js** (if running locally)
   - Node.js 18+ installed
   - Web3.js library

## 🚀 Deployment Methods

### Method 1: Using BlockDAG IDE (Recommended)

This is the simplest method where you use BlockDAG IDE's built-in tools.

#### Step 1: Prepare the Contract

1. Open BlockDAG IDE
2. Create a new project or workspace
3. Copy the following contract files to the IDE:
   - `HealthPassport.sol` (main contract)
   - `AccessControl.sol` (base contract)
   - `IHealthPassport.sol` (interface)
   - `ICredentialVerifier.sol` (interface)

#### Step 2: Compile the Contract

1. Select `HealthPassport.sol` in the IDE
2. Click "Compile" or use the compile button
3. Ensure compilation is successful (check for any errors)
4. The IDE will generate:
   - **ABI** (Application Binary Interface) - JSON format
   - **Bytecode** - Hex string starting with `0x`

#### Step 3: Deploy Using the Deployment Script

1. Copy the `blockdag-deploy.js` script to the IDE
2. Update the configuration section:
   ```javascript
   const CONFIG = {
     rpcUrl: 'https://rpc.testnet.blockdag.network', // Your BlockDAG RPC
     privateKey: '0xYOUR_PRIVATE_KEY_HERE',           // Your wallet private key
     gasLimit: 5000000,
     gasPrice: '20000000000',
     chainId: 11155111,                              // BlockDAG chain ID
     networkName: 'BlockDAG Testnet'
   };
   ```

3. Paste the compiled **ABI** and **Bytecode** into the script:
   ```javascript
   const contractABI = [
     // PASTE YOUR ABI HERE
   ];
   
   const contractBytecode = '0x...'; // PASTE YOUR BYTECODE HERE
   ```

4. Run the script in the IDE

#### Step 4: Save the Deployment Information

After successful deployment, you'll see:

```
╔════════════════════════════════════════════╗
║          🎉 DEPLOYMENT SUCCESSFUL! 🎉      ║
╚════════════════════════════════════════════╝

📍 Contract Address:
    0x1234567890abcdef...

🔗 Transaction Hash:
    0xabcdef1234567890...
```

**Save these details:**
1. Contract Address - You'll need this for frontend integration
2. Transaction Hash - For verification on BlockDAG Explorer
3. ABI JSON - For interacting with the contract

### Method 2: Using Local Web3.js Script

If you prefer to deploy from your local machine:

#### Step 1: Install Dependencies

```bash
cd contracts
npm init -y
npm install web3
```

#### Step 2: Compile the Contract

Use Hardhat or Foundry to compile:

**Using Hardhat:**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat compile
```

**Using Foundry:**
```bash
forge build
```

#### Step 3: Update and Run the Deploy Script

1. Open `deploy.js`
2. Update the configuration
3. Paste the compiled bytecode and ABI
4. Run the script:
   ```bash
   node deploy.js
   ```

## 📦 Integrating the ABI into Your Codebase

After successful deployment, follow these steps to integrate the contract with your frontend:

### Step 1: Save the ABI

Create or update `contracts/HealthPassport.json` with the full ABI:

```json
{
  "contractName": "HealthPassport",
  "abi": [
    {
      "type": "constructor",
      "inputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "mintSoulbound",
      "inputs": [
        {
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "name": "recipient",
          "type": "address"
        },
        {
          "name": "metadata",
          "type": "string"
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable"
    }
    // ... rest of your ABI
  ],
  "networks": {
    "blockdag_testnet": {
      "address": "0xYOUR_DEPLOYED_CONTRACT_ADDRESS",
      "transactionHash": "0xYOUR_DEPLOYMENT_TX_HASH"
    }
  }
}
```

### Step 2: Create a Contract Configuration File

Create `lib/contract-config.ts`:

```typescript
import HealthPassportABI from '@/contracts/HealthPassport.json';

export const CONTRACT_CONFIG = {
  address: '0xYOUR_DEPLOYED_CONTRACT_ADDRESS', // From deployment
  abi: HealthPassportABI.abi,
  network: {
    name: 'BlockDAG Testnet',
    rpcUrl: 'https://rpc.testnet.blockdag.network',
    chainId: 11155111, // Update with actual BlockDAG chain ID
    blockExplorer: 'https://explorer.testnet.blockdag.network'
  }
};
```

### Step 3: Create a Web3 Client

Create `lib/web3-client.ts`:

```typescript
import Web3 from 'web3';
import { CONTRACT_CONFIG } from './contract-config';

// Initialize Web3
export const web3 = new Web3(new Web3.providers.HttpProvider(
  CONTRACT_CONFIG.network.rpcUrl
));

// Create contract instance
export const healthPassportContract = new web3.eth.Contract(
  CONTRACT_CONFIG.abi as any,
  CONTRACT_CONFIG.address
);

// Helper function to mint a credential
export async function mintCredential(
  account: string,
  tokenId: number,
  recipient: string,
  metadata: string
) {
  try {
    const tx = await healthPassportContract.methods
      .mintSoulbound(tokenId, recipient, metadata)
      .send({ from: account });
    
    return {
      success: true,
      transactionHash: tx.transactionHash,
      contractAddress: CONTRACT_CONFIG.address
    };
  } catch (error) {
    console.error('Minting failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Helper function to get credentials by owner
export async function getCredentialsByOwner(ownerAddress: string) {
  try {
    const tokenIds = await healthPassportContract.methods
      .getCredentialsByOwner(ownerAddress)
      .call();
    
    return tokenIds;
  } catch (error) {
    console.error('Failed to fetch credentials:', error);
    return [];
  }
}

// Helper function to verify credential
export async function verifyCredential(
  tokenId: number,
  proof: string[]
) {
  try {
    const isValid = await healthPassportContract.methods
      .verifyCredential(tokenId, proof)
      .call();
    
    return isValid;
  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}
```

### Step 4: Update Dependencies

Add Web3.js to your package.json:

```bash
npm install web3
# or
pnpm add web3
```

### Step 5: Use in Your Components

Example usage in a React component:

```typescript
'use client';

import { useState } from 'react';
import { mintCredential, getCredentialsByOwner } from '@/lib/web3-client';

export default function CredentialsPage() {
  const [loading, setLoading] = useState(false);
  
  const handleMintCredential = async () => {
    setLoading(true);
    try {
      const result = await mintCredential(
        userAddress,
        tokenId,
        recipientAddress,
        metadataURI
      );
      
      if (result.success) {
        console.log('Credential minted!', result.transactionHash);
      }
    } catch (error) {
      console.error('Minting error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleMintCredential} disabled={loading}>
      {loading ? 'Minting...' : 'Mint Credential'}
    </button>
  );
}
```

## 🔍 Verification Steps

After deployment, verify your contract:

1. **Check on BlockDAG Explorer**
   - Navigate to: `https://explorer.testnet.blockdag.network/address/YOUR_CONTRACT_ADDRESS`
   - Verify the contract code is deployed
   - Check the deployment transaction

2. **Test Contract Functions**
   - Try calling read functions (view functions) first
   - Test write functions with a small amount
   - Verify events are emitted correctly

3. **Verify Access Control**
   - Check that you (deployer) have ADMIN_ROLE
   - Test role-based permissions
   - Verify MINTER_ROLE works correctly

## 🛡️ Security Checklist

Before deploying to mainnet:

- [ ] Audit all contract code
- [ ] Test on testnet extensively
- [ ] Verify all access controls work
- [ ] Test with multiple accounts
- [ ] Check gas optimization
- [ ] Verify contract is not upgradeable (as designed)
- [ ] Back up your private key securely
- [ ] Document all contract addresses
- [ ] Test emergency functions (if any)
- [ ] Verify soulbound token logic (non-transferability)

## 📚 Additional Resources

- [BlockDAG Documentation](https://docs.blockdag.network)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [BlockDAG Explorer](https://explorer.blockdag.network)

## 🆘 Troubleshooting

### Compilation Errors

**Problem**: Contract won't compile
- Check Solidity version compatibility (^0.8.20)
- Ensure all imports are correct
- Verify no syntax errors

### Deployment Fails

**Problem**: Transaction fails or reverts
- Check wallet has sufficient BDAG tokens
- Verify gas settings are adequate
- Check network connection
- Ensure RPC URL is correct

### ABI Issues

**Problem**: Frontend can't interact with contract
- Verify ABI is complete and correct
- Check contract address is correct
- Ensure network configuration matches
- Verify Web3 connection is established

### Access Control Issues

**Problem**: Can't call protected functions
- Verify account has the required role
- Check if roles are granted correctly
- Test with the deployer account first

## 💡 Best Practices

1. **Always test on testnet first**
2. **Keep private keys secure** - Never commit to git
3. **Use environment variables** for sensitive data
4. **Document all deployments** with addresses and transaction hashes
5. **Verify contracts** on block explorers when possible
6. **Monitor gas prices** before deploying
7. **Back up ABI files** in multiple locations
8. **Use version control** for contract code

## 📞 Support

If you encounter issues:
1. Check BlockDAG documentation
2. Review contract compilation output
3. Test with a minimal example
4. Check network status
5. Verify wallet configuration

---

**Remember**: Smart contracts are immutable once deployed. Test thoroughly before mainnet deployment!
