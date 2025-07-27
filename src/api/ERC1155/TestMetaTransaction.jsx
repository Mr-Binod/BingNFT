import { ethers } from "ethers";

// ✅ Test function for contractMeta.mint
export const testMetaTransaction = async (signer, contractMeta) => {
    try {
        console.log('=== Testing MetaTransaction.mint ===');
        
        // Check if signer exists
        if (!signer) {
            throw new Error('Signer is null');
        }
        console.log('✅ Signer address:', await signer.getAddress());
        
        // Check if contract exists
        if (!contractMeta) {
            throw new Error('ContractMeta is null');
        }
        console.log('✅ Contract address:', contractMeta.address);
        
        // Create test message
        const testMessage = "Test message for meta-transaction";
        console.log('✅ Test message:', testMessage);
        
        // Create signature
        const signature = await signer.signMessage(testMessage);
        console.log('✅ Signature created:', signature);
        console.log('✅ Signature length:', signature.length);
        
        // Get signer address
        const signerAddress = await signer.getAddress();
        console.log('✅ Signer address for mint:', signerAddress);
        
        // Test parameters
        const testParams = {
            accounts: signerAddress,
            tokens: 100, // 100 tokens
            messages: testMessage,
            signature: signature
        };
        
        console.log('✅ Calling mint with params:', testParams);
        
        // Call mint function
        const tx = await contractMeta.mint(
            testParams.accounts,
            testParams.tokens,
            testParams.messages,
            testParams.signature
        );
        
        console.log('✅ Transaction sent:', tx.hash);
        
        // Wait for transaction
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed:', receipt);
        
        return {
            success: true,
            txHash: tx.hash,
            receipt: receipt
        };
        
    } catch (error) {
        console.error('❌ Error in testMetaTransaction:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// ✅ Check contract state
export const checkContractState = async (contractMeta) => {
    try {
        console.log('=== Checking Contract State ===');
        
        if (!contractMeta) {
            console.log('❌ ContractMeta is null');
            return false;
        }
        
        console.log('✅ Contract address:', contractMeta.address);
        console.log('✅ Contract interface:', contractMeta.interface);
        
        // Check if mint function exists
        const mintFunction = contractMeta.interface.getFunction('mint');
        console.log('✅ Mint function found:', mintFunction);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error checking contract state:', error);
        return false;
    }
};

// ✅ Check signer state
export const checkSignerState = async (signer) => {
    try {
        console.log('=== Checking Signer State ===');
        
        if (!signer) {
            console.log('❌ Signer is null');
            return false;
        }
        
        const address = await signer.getAddress();
        console.log('✅ Signer address:', address);
        
        // Check if signer can sign
        const testMessage = "Test";
        const signature = await signer.signMessage(testMessage);
        console.log('✅ Signer can sign messages:', signature.length > 0);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error checking signer state:', error);
        return false;
    }
}; 