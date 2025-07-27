import React, { useEffect, useState, useMemo } from 'react'
import { ethers } from "ethers"
import BingNFTABI from '../abi/BingNFT.json'
import MetaABI from '../abi/MetaTransaction.json'
import BingTokenABI from '../abi/Bingtoken.json'
import MetaBingNFTABI from '../abi/MetaBingNFT.json'

export const useEthers = (privatekeys, user) => {
    const [loading, setLoading] = useState(true)
    const [pkprovider, setPkprovider] = useState([])

    // DeployAllModule#BingNFT - 0x05AF089171046b10654Cd34BB17cc2A5218fF35b
    // DeployAllModule#Bingtoken - 0xfd73ada76B2cf70E9f34bE058059C472F2BE76eD
    // DeployAllModule#MetaBingNFT - 0xa26F06a45A3b629eeCA1f52Ce8d0B01A70B2A583
    // DeployAllModule#MetaTransaction - 0x34C5B5592B140336CFE4B42eaa9172427B321261
    const BINGNFT = '0x5F821c885d8f173662F7eF520082c28F03fa3B5F'
    const BINGTOKEN = '0xd7D82505395F7FEAcC3d8F2dC81231d0A12d1423'
    const METANFT = '0x26F24AED2181f818EbC217a26AB184EFf9B66331' // Deployed MetaBingNFT address
    const METATXN = '0x470Ad96db4d64D7208FbCB19390715CB849f332B'

    // ✅ Memoize provider creation to avoid recreating on every render
    const provider = useMemo(() => {
        // if (!privatekeys || privatekeys.length === 0) return null
        return new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/e7468d2d517b4aa28ba51a6e589558e2")
    }, [user])

    // ✅ Memoize paymaster wallet creation
    const paymaster = useMemo(() => {
        if (!provider) return null
        return new ethers.Wallet("1bb48ef643ede40a87a2b32be5d9c11a0192490d94105dc6f81c0ae102dda212", provider)
    }, [provider])

    // ✅ Memoize signer based on user data
    const signer = useMemo(() => {
        if (!provider) return null
        
        try {
            // Use current user's wallet as signer if available
            if (user && user.data && user.data.privateKey) {
                return new ethers.Wallet(user.data.privateKey, provider)
            }
            // Fallback to first wallet if no user data
            else if (pkprovider && pkprovider.length > 0) {
                return pkprovider[0].wallet
            }
        } catch (error) {
            console.log('Error creating signer:', error)
            // Fallback to first wallet if user wallet creation fails
            if (pkprovider && pkprovider.length > 0) {
                return pkprovider[0].wallet
            }
        }
        return null
    }, [ user, pkprovider])

    // ✅ Memoize contract instances to avoid recreating on every render
    const contracts = useMemo(() => {
        if (!provider) {
            return {
                contractNFT: null,
                contractMeta: null,
                contractCoin: null,
                contractMetaNft: null
            }
        }

        try {
            const contractNft = new ethers.Contract(BINGNFT, BingNFTABI.abi, provider)
            const contractcoin = new ethers.Contract(BINGTOKEN, BingTokenABI.abi, provider)
            const contractmeta = new ethers.Contract(METATXN, MetaABI.abi, provider)
            const contractmetaNft = new ethers.Contract(METANFT, MetaBingNFTABI.abi, provider)
            
            return {
                contractNFT: contractNft,
                contractMeta: contractmeta,
                contractCoin: contractcoin,
                contractMetaNft: contractmetaNft
            }
        } catch (error) {
            console.log('Error creating contracts:', error)
            return {
                contractNFT: null,
                contractMeta: null,
                contractCoin: null,
                contractMetaNft: null
            }
        }
    }, [provider])

    // ✅ Handle async wallet creation with useEffect
    // useEffect(() => {
    //     const initializeWallets = async () => {
    //         if (!provider || !privatekeys || privatekeys.length === 0) {
    //             setPkprovider([])
    //             setLoading(false)
    //             return
    //         }

    //         setLoading(true)
    //         try {
    //             const promiseWallet = privatekeys.map(async (pk) => {
    //                 const wallet = new ethers.Wallet(pk, provider)
    //                 const balance = provider.getBalance(wallet.address)
    //                 const balanceEth = ethers.formatEther(balance)
    //                 return {
    //                     wallet,
    //                     balance: balanceEth,
    //                     address: wallet.address
    //                 }
    //             })
                
    //             const wallets = await Promise.all(promiseWallet)
    //             setPkprovider(wallets)
    //             console.log('Wallets initialized:', wallets)
    //         } catch (error) {
    //             console.log('Error creating wallets:', error)
    //             setPkprovider([])
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     initializeWallets()
    // }, [provider, privatekeys])

    // Set loading to false after first render if initializeWallets is not used
    useEffect(() => {
        setLoading(false);
    }, []);

    console.log("useEthers hook rendered")
    
    return {
        loading,
        paymaster,
        pkprovider,
        provider,
        signer,
        ...contracts
    }
}
