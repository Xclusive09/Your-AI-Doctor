# 🚀 Start Here: Deploy Your Smart Contract

Welcome! This guide will get your HealthPassport smart contract deployed on BlockDAG in **5 simple steps**.

## ⚡ Quick Deploy (5 Minutes)

### Step 1: Compile in BlockDAG IDE
1. Go to https://ide.blockdag.network
2. Upload the single contract file:
   - `HealthPassportComplete.sol`
3. Click **"Compile"**
4. ✅ Copy the **ABI** (JSON array)
5. ✅ Copy the **Bytecode** (hex string starting with 0x)

### Step 2: Run Deployment Script
1. Open `standalone-deploy.js` in this folder
2. Copy the ENTIRE file
3. Paste it into a new file in BlockDAG IDE
4. Update 3 things:
   ```javascript
   // Line 25: Your wallet private key
   const YOUR_PRIVATE_KEY = '0xYOUR_KEY_HERE';
   
   // Line 45: Paste your ABI from Step 1
   const CONTRACT_ABI = [ /* PASTE HERE */ ];
   
   // Line 69: Paste your Bytecode from Step 1
   const CONTRACT_BYTECODE = '0x...'; // PASTE HERE
   ```
5. Click **"Run"**

### Step 3: Save Contract Address
You'll see output like this:
```
╔════════════════════════════════════════════════════════╗
║              🎉 DEPLOYMENT SUCCESSFUL! 🎉              ║
╚════════════════════════════════════════════════════════╝

📍 CONTRACT ADDRESS:
   ➜ 0x1234567890abcdef...
```

✅ **Copy and save this address!**

### Step 4: Save ABI to Project
1. In your project, open/create: `contracts/HealthPassport.json`
2. Paste this structure:
   ```json
   {
     "contractName": "HealthPassport",
     "abi": [
       /* PASTE YOUR ABI HERE */
     ],
     "networks": {
       "blockdag_testnet": {
         "address": "0xYOUR_CONTRACT_ADDRESS_FROM_STEP_3"
       }
     }
   }
   ```

### Step 5: Configure Your App
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS_FROM_STEP_3
   NEXT_PUBLIC_RPC_URL=https://rpc.testnet.blockdag.network
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

3. Install Web3:
   ```bash
   npm install web3
   ```

4. Start your app:
   ```bash
   npm run dev
   ```

## ✅ You're Done!

Your contract is now deployed and your app is configured to use it!

## 🧪 Test It

Try these in your code:

```typescript
import { 
  getContractName, 
  getCredentialsByOwner 
} from '@/lib/web3-client';

// Verify it works
const name = await getContractName();
console.log(name); // "Health Passport"

// Get user's credentials
const credentials = await getCredentialsByOwner(userAddress);
console.log(credentials); // Array of token IDs
```

## 📚 Need More Help?

- **Quick reference**: [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
- **Step-by-step guide**: [QUICKSTART.md](./QUICKSTART.md)
- **Full documentation**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Contract details**: [README.md](./README.md)

## 🎯 What You Have Now

- ✅ Smart contract deployed on BlockDAG
- ✅ Contract address saved
- ✅ ABI integrated in your project
- ✅ Web3 client configured
- ✅ Ready to mint health credentials!

## 🔍 Verify on Explorer

Visit: `https://explorer.testnet.blockdag.network/address/YOUR_CONTRACT_ADDRESS`

You should see:
- ✅ Contract creation transaction
- ✅ Contract bytecode
- ✅ Your deployment

## 📦 What's in This Folder?

```
contracts/
├── START_HERE.md              ← You are here!
├── standalone-deploy.js       ← Main deployment script
├── QUICKSTART.md              ← Detailed quick start
├── DEPLOYMENT_GUIDE.md        ← Complete documentation
├── INTEGRATION_SUMMARY.md     ← Integration examples
└── HealthPassportComplete.sol ← Single complete contract file
```

## 💡 Pro Tips

1. **Test on testnet first** - Always!
2. **Save your private key securely** - Never commit it
3. **Backup the ABI** - Save it in multiple places
4. **Use environment variables** - Keep secrets out of code
5. **Check the explorer** - Verify transactions

## 🆘 Common Issues

**"insufficient funds"**
→ Fund your wallet with BDAG test tokens

**"Cannot find module 'web3'"**
→ Run `npm install web3`

**"Contract not configured"**
→ Check your .env.local has the contract address

## 🎊 Next Steps

Now that your contract is deployed:

1. **Mint credentials** - Use the Web3 client functions
2. **Verify credentials** - Test the verification functions
3. **Grant roles** - Give MINTER_ROLE to authorized addresses
4. **Monitor transactions** - Watch on BlockDAG Explorer
5. **Build features** - Integrate into your UI

---

**Questions?** Check the documentation files or create an issue!

**Ready to deploy?** Open `standalone-deploy.js` and follow Step 2 above! 🚀
