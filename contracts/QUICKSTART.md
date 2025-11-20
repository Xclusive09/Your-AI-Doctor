# 🚀 Quick Start: Deploy HealthPassport to BlockDAG

Follow these steps to deploy your smart contract and integrate it with your app.

## 📝 Prerequisites

- [ ] BlockDAG wallet with test tokens
- [ ] Access to BlockDAG IDE
- [ ] Your wallet private key (keep secure!)

## 🎯 Step-by-Step Guide

### Step 1: Compile the Contract in BlockDAG IDE

1. Open [BlockDAG IDE](https://ide.blockdag.network)
2. Create a new project
3. Upload these contract files:
   - `HealthPassport.sol` (main contract)
   - `AccessControl.sol` (dependency)
   - `IHealthPassport.sol` (interface)
   - `ICredentialVerifier.sol` (interface)
4. Select `HealthPassport.sol`
5. Click **Compile**
6. Verify successful compilation ✅
7. **Save the output:**
   - Copy the **ABI** (JSON format)
   - Copy the **Bytecode** (hex string starting with 0x)

### Step 2: Deploy Using the Standalone Script

1. Copy the entire `standalone-deploy.js` file
2. Paste it into BlockDAG IDE as a new file
3. **Update configuration** (lines 25-31):
   ```javascript
   const YOUR_PRIVATE_KEY = '0xYOUR_ACTUAL_PRIVATE_KEY_HERE';
   const RPC_URL = 'https://rpc.testnet.blockdag.network';
   ```

4. **Paste your ABI** (line 45):
   ```javascript
   const CONTRACT_ABI = [
     // PASTE THE ABI YOU COPIED IN STEP 1
   ];
   ```

5. **Paste your Bytecode** (line 69):
   ```javascript
   const CONTRACT_BYTECODE = '0xYOUR_COMPILED_BYTECODE';
   ```

6. **Run the script** in BlockDAG IDE

7. **Wait for deployment** (30-60 seconds)

8. **Save the output:**
   - ✅ Contract Address: `0x...`
   - ✅ Transaction Hash: `0x...`
   - ✅ Deployment Info JSON

### Step 3: Save the ABI to Your Project

1. Create/update `contracts/HealthPassport.json`:
   ```json
   {
     "contractName": "HealthPassport",
     "abi": [
       // PASTE YOUR ABI HERE
     ],
     "networks": {
       "blockdag_testnet": {
         "address": "0xYOUR_CONTRACT_ADDRESS_FROM_STEP_2"
       }
     }
   }
   ```

2. Save the file

### Step 4: Update Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update with your deployment info:
   ```env
   NEXT_PUBLIC_RPC_URL=https://rpc.testnet.blockdag.network
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS_FROM_STEP_2
   NEXT_PUBLIC_EXPLORER_URL=https://explorer.testnet.blockdag.network
   ```

3. Save the file

### Step 5: Install Web3.js

```bash
npm install web3
# or
pnpm add web3
```

### Step 6: Update the Web3 Client

1. Open `lib/web3-client.ts`
2. If you want to import the ABI from the JSON file:
   ```typescript
   import HealthPassportABI from '@/contracts/HealthPassport.json';
   
   const CONTRACT_ABI = HealthPassportABI.abi;
   ```

### Step 7: Test Your Integration

1. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

2. Open http://localhost:3000

3. Test the contract functions:
   - Check contract name/symbol
   - Get balance of addresses
   - Mint credentials (requires MINTER_ROLE)

## 🧪 Testing Commands

After deployment, you can test using the Web3 client:

```typescript
import { 
  getContractName, 
  getContractSymbol,
  getBalanceOf,
  getTotalSupply 
} from '@/lib/web3-client';

// Test read functions (no gas required)
const name = await getContractName(); // "Health Passport"
const symbol = await getContractSymbol(); // "HEALTH"
const balance = await getBalanceOf('0xYourAddress');
const supply = await getTotalSupply();
```

## ✅ Verification Checklist

After deployment:

- [ ] Contract deployed successfully
- [ ] Contract address saved
- [ ] ABI saved to project
- [ ] Environment variables updated
- [ ] Web3.js installed
- [ ] Web3 client configured
- [ ] Development server running
- [ ] Contract functions tested
- [ ] Transaction visible on BlockDAG Explorer

## 🔍 Verify on BlockDAG Explorer

Visit: `https://explorer.testnet.blockdag.network/address/YOUR_CONTRACT_ADDRESS`

You should see:
- Contract creation transaction
- Contract bytecode
- Transaction history

## 📚 Next Steps

1. **Grant Roles**: Give MINTER_ROLE to authorized addresses
2. **Mint Credentials**: Start minting health credentials
3. **Integrate UI**: Connect your frontend to the contract
4. **Test Thoroughly**: Test all contract functions
5. **Monitor**: Watch transactions on the explorer

## 🆘 Troubleshooting

### Deployment Fails

**Problem**: "insufficient funds"
- **Solution**: Fund your wallet with BDAG test tokens

**Problem**: "nonce too low"
- **Solution**: Wait a moment and try again

**Problem**: "gas estimation failed"
- **Solution**: Increase GAS_LIMIT in the script

### Can't Read Contract

**Problem**: Functions return errors
- **Solution**: Verify contract address is correct
- **Solution**: Check RPC URL is accessible
- **Solution**: Ensure ABI matches deployed contract

### Transactions Fail

**Problem**: "missing role"
- **Solution**: Ensure caller has appropriate role (MINTER_ROLE, etc.)

**Problem**: "gas too low"
- **Solution**: Increase gas limit in transaction

## 📞 Need Help?

- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed info
- Review contract [README.md](./README.md)
- Check BlockDAG documentation

---

**Important**: Always test on testnet before mainnet deployment! 🚨
