# Web3.js Integration Summary

This document summarizes the Web3.js integration for deploying and interacting with the HealthPassport smart contract on BlockDAG.

## 📦 What Was Added

### 1. Deployment Scripts

Three deployment scripts were created to give you flexibility:

#### `standalone-deploy.js` ⭐ **RECOMMENDED**
- **Purpose**: Main deployment script for BlockDAG IDE
- **Usage**: Copy/paste entire script into BlockDAG IDE
- **Features**:
  - Self-contained, no external dependencies
  - Clear step-by-step console output
  - Detailed error messages and troubleshooting tips
  - Validates all inputs before deployment
  - Outputs deployment info in JSON format

#### `blockdag-deploy.js`
- **Purpose**: Alternative deployment script with enhanced logging
- **Features**:
  - More detailed deployment process
  - Network information display
  - Gas estimation with warnings
  - Deployment statistics

#### `deploy.js`
- **Purpose**: Traditional deployment script for local Node.js environment
- **Features**:
  - Simplified version for automated deployments
  - Can be integrated into CI/CD pipelines
  - Exports deployment function for programmatic use

### 2. Frontend Integration

#### `lib/web3-client.ts` 
Complete Web3 client for interacting with the deployed contract:

**Read Functions** (No gas required):
- `getContractName()` - Get contract name
- `getContractSymbol()` - Get contract symbol
- `getBalanceOf(address)` - Get credential count
- `getOwnerOf(tokenId)` - Get token owner
- `getTokenURI(tokenId)` - Get token metadata
- `getCredentialsByOwner(address)` - Get all credentials for an address
- `getTotalSupply()` - Get total minted credentials
- `verifyCredential(tokenId, proof)` - Verify credential with ZK proof

**Write Functions** (Require gas):
- `mintSoulbound(from, tokenId, recipient, metadata)` - Mint new credential

**Utility Functions**:
- `getNetworkConfig()` - Get network configuration
- `getContractAddress()` - Get deployed contract address
- `getTransactionUrl(txHash)` - Get block explorer link
- `getAddressUrl(address)` - Get address explorer link
- `isWeb3Configured()` - Check if contract is configured

### 3. Documentation

#### `QUICKSTART.md`
- Step-by-step deployment guide
- Checklist format for easy tracking
- Troubleshooting section
- Verification steps

#### `DEPLOYMENT_GUIDE.md`
- Comprehensive deployment documentation
- Multiple deployment methods
- Frontend integration examples
- Security checklist
- Best practices

### 4. Configuration Files

#### `contracts/package.json`
- Dependencies for local deployment
- Scripts for running deployment
- Metadata for the contract package

#### Updated `.env.example`
- BlockDAG RPC URL configuration
- Chain ID setting
- Contract address placeholder
- Explorer URL configuration

## 🚀 Quick Start

### Deploy the Contract

1. **Compile in BlockDAG IDE**:
   ```
   1. Upload HealthPassport.sol and dependencies
   2. Click "Compile"
   3. Copy ABI and Bytecode
   ```

2. **Deploy with standalone script**:
   ```
   1. Copy standalone-deploy.js
   2. Paste into BlockDAG IDE
   3. Update YOUR_PRIVATE_KEY (line 25)
   4. Paste ABI (line 45)
   5. Paste Bytecode (line 69)
   6. Run the script
   ```

3. **Save deployment info**:
   ```
   Contract Address: 0x...
   Transaction Hash: 0x...
   ABI: [...]
   ```

### Integrate with Frontend

1. **Install Web3.js**:
   ```bash
   npm install web3
   ```

2. **Save the ABI**:
   Create `contracts/HealthPassport.json` with your ABI

3. **Update environment**:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
   NEXT_PUBLIC_RPC_URL=https://rpc.testnet.blockdag.network
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

4. **Use in your code**:
   ```typescript
   import { getCredentialsByOwner, mintSoulbound } from '@/lib/web3-client';
   
   // Get user's credentials
   const credentials = await getCredentialsByOwner(userAddress);
   
   // Mint a new credential
   const result = await mintSoulbound(
     fromAddress,
     tokenId,
     recipientAddress,
     metadataURI
   );
   ```

## 📁 File Structure

```
Your-AI-Doctor/
├── contracts/
│   ├── HealthPassport.sol           # Main contract
│   ├── AccessControl.sol            # Access control base
│   ├── IHealthPassport.sol          # Interface
│   ├── ICredentialVerifier.sol      # Verifier interface
│   ├── standalone-deploy.js         # ⭐ Main deployment script
│   ├── blockdag-deploy.js           # Alternative deployment
│   ├── deploy.js                    # Local deployment
│   ├── package.json                 # Contract dependencies
│   ├── QUICKSTART.md                # Quick start guide
│   ├── DEPLOYMENT_GUIDE.md          # Full deployment docs
│   └── README.md                    # Contract documentation
├── lib/
│   └── web3-client.ts               # Web3 integration
├── .env.example                     # Environment template
└── package.json                     # Project dependencies (includes web3)
```

## 🔧 Configuration Reference

### Environment Variables

```env
# BlockDAG RPC endpoint
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.blockdag.network

# BlockDAG Chain ID
NEXT_PUBLIC_CHAIN_ID=11155111

# Deployed contract address (update after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# BlockDAG Explorer URL
NEXT_PUBLIC_EXPLORER_URL=https://explorer.testnet.blockdag.network
```

### Deployment Script Configuration

```javascript
const CONFIG = {
  privateKey: '0xYOUR_PRIVATE_KEY',
  rpcUrl: 'https://rpc.testnet.blockdag.network',
  gasLimit: 5000000,
  gasPrice: '20000000000', // 20 Gwei
  chainId: 11155111
};
```

## 🎯 Common Use Cases

### 1. Mint a Health Credential

```typescript
import { mintSoulbound } from '@/lib/web3-client';

async function mintHealthCredential(userAddress: string) {
  const tokenId = Date.now(); // Use unique ID
  const metadata = JSON.stringify({
    type: 'Verified Walker',
    achievedAt: new Date().toISOString(),
    criteria: '90 days with ≥10,000 steps'
  });
  
  const result = await mintSoulbound(
    userAddress,
    tokenId,
    userAddress,
    metadata
  );
  
  if (result.success) {
    console.log('Minted!', result.transactionHash);
  }
}
```

### 2. Check User's Credentials

```typescript
import { getCredentialsByOwner, getTokenURI } from '@/lib/web3-client';

async function getUserCredentials(userAddress: string) {
  const tokenIds = await getCredentialsByOwner(userAddress);
  
  const credentials = await Promise.all(
    tokenIds.map(async (tokenId) => {
      const metadata = await getTokenURI(tokenId);
      return {
        tokenId,
        metadata: JSON.parse(metadata)
      };
    })
  );
  
  return credentials;
}
```

### 3. Verify Contract is Deployed

```typescript
import { isWeb3Configured, getContractName } from '@/lib/web3-client';

async function checkContractStatus() {
  if (!isWeb3Configured()) {
    console.error('Contract not configured!');
    return false;
  }
  
  const name = await getContractName();
  console.log('Connected to:', name); // "Health Passport"
  return true;
}
```

## 🔐 Security Considerations

### Private Key Management

❌ **Never do this**:
```javascript
const privateKey = '0xabcd1234...'; // Hardcoded in source
```

✅ **Always do this**:
```javascript
const privateKey = process.env.PRIVATE_KEY; // From environment
```

### Environment Variables

- Use `.env.local` for local development (not committed to git)
- Use secure environment variable management in production
- Never commit private keys or sensitive data

### Contract Interaction

- Always estimate gas before transactions
- Validate addresses before sending transactions
- Handle transaction failures gracefully
- Check user has sufficient balance

## 📊 Testing Checklist

Before going live:

- [ ] Contract compiles without errors
- [ ] Deployment script runs successfully
- [ ] Contract address saved correctly
- [ ] ABI saved to project
- [ ] Environment variables configured
- [ ] Web3 client imports successfully
- [ ] Read functions work (getContractName, etc.)
- [ ] Write functions work (mintSoulbound with MINTER_ROLE)
- [ ] Transaction shows in BlockDAG Explorer
- [ ] Frontend can interact with contract
- [ ] Error handling works correctly

## 🆘 Troubleshooting

### Deployment Issues

**Problem**: "Cannot find module 'web3'"
- **Solution**: Run `npm install web3`

**Problem**: "insufficient funds"
- **Solution**: Fund wallet with BDAG test tokens

**Problem**: "nonce too low"
- **Solution**: Wait 30 seconds and try again

### Frontend Integration Issues

**Problem**: "Contract not configured"
- **Solution**: Check NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local

**Problem**: "Transaction fails"
- **Solution**: Ensure caller has required role (MINTER_ROLE)

**Problem**: "Cannot read contract"
- **Solution**: Verify RPC URL is accessible and contract is deployed

## 📚 Additional Resources

- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [BlockDAG Documentation](https://docs.blockdag.network/)
- [QUICKSTART.md](./QUICKSTART.md) - Step-by-step guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Comprehensive guide
- [README.md](./README.md) - Contract documentation

## 🎉 Success!

If you've followed this guide, you should now have:
- ✅ Deployed contract on BlockDAG
- ✅ ABI saved to project
- ✅ Web3 client configured
- ✅ Frontend integrated
- ✅ Ready to mint credentials!

---

**Need help?** Check the documentation or create an issue on GitHub.
