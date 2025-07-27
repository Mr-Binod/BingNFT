import { ethers } from "ethers";

// MetaBingNFT ABI (you'll need to generate this from the contract)
const META_BINGNFT_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_bingNFTAddress",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "metadata",
                "type": "string"
            }
        ],
        "name": "NFTMinted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "metadata",
                "type": "string"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "mintNFT",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "internalType": "uint256[]",
                "name": "tokenIds",
                "type": "uint256[]"
            },
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            },
            {
                "internalType": "string[]",
                "name": "metadatas",
                "type": "string[]"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
        ],
        "name": "mintBatchNFT",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// ✅ Create signature for meta-transaction
export const createMetaSignature = async (signer, metadata) => {
    try {
        // Create the message to sign
        const message = metadata;
        
        // Sign the message
        const signature = await signer.signMessage(message);
        
        console.log('Signature created:', signature);
        return signature;
    } catch (error) {
        console.error('Error creating signature:', error);
        throw error;
    }
};

// ✅ Mint NFT using meta-transaction
export const mintNFTWithMeta = async (signer, metaBingNFTContract, userAddress, tokenId, amount, metadata) => {
    try {
        console.log('Minting NFT with meta-transaction...');
        
        // Create signature
        const signature = await createMetaSignature(signer, metadata);
        
        // Call meta-transaction
        const tx = await metaBingNFTContract.mintNFT(
            userAddress,
            tokenId,
            amount,
            metadata,
            signature
        );
        
        await tx.wait();
        console.log('NFT minted successfully via meta-transaction');
        
        return tx;
    } catch (error) {
        console.error('Error minting NFT with meta-transaction:', error);
        throw error;
    }
};

// ✅ Batch mint NFTs using meta-transaction
export const mintBatchNFTWithMeta = async (signer, metaBingNFTContract, userAddress, tokenIds, amounts, metadatas) => {
    try {
        console.log('Batch minting NFTs with meta-transaction...');
        
        // Combine metadata for signature
        const combinedMetadata = metadatas.join('|');
        
        // Create signature
        const signature = await createMetaSignature(signer, combinedMetadata);
        
        // Call batch meta-transaction
        const tx = await metaBingNFTContract.mintBatchNFT(
            userAddress,
            tokenIds,
            amounts,
            metadatas,
            signature
        );
        
        await tx.wait();
        console.log('Batch NFTs minted successfully via meta-transaction');
        
        return tx;
    } catch (error) {
        console.error('Error batch minting NFTs with meta-transaction:', error);
        throw error;
    }
};

// ✅ Create MetaBingNFT contract instance
export const createMetaBingNFTContract = (address, signer) => {
    return new ethers.Contract(address, META_BINGNFT_ABI, signer);
};

// ✅ Get contract info
export const getMetaBingNFTInfo = async (metaBingNFTContract) => {
    try {
        const info = await metaBingNFTContract.getContractInfo();
        return {
            nftContract: info[0],
            contractOwner: info[1]
        };
    } catch (error) {
        console.error('Error getting contract info:', error);
        throw error;
    }
}; 