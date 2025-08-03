import { ethers } from 'ethers'
import { useMemo } from 'react'
import EntryPointABI from '../abi/EntryPoint.json'
import SmartAccountABI from '../abi/SmartAccount.json'
import TokenABI from '../abi/Bingtoken.json'
import NftABI from '../abi/BingNFT.json'
import PaymasterABI from '../abi/PayMaster.json'

// Cache for providers to avoid creating multiple instances
const providerCache = new Map()

// Rate limiting utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const useNewEthers = (userPvtKey, smartAccCA) => {
    return useMemo(() => {
        if(!userPvtKey || !smartAccCA) return null
        
        const EntryPointCA = process.env.REACT_APP_ENTRYPOINT_CA
        const TokenCA = process.env.REACT_APP_BING_TKN_CA
        const NftCA = process.env.REACT_APP_NFT_CA
        const PaymasterCA = process.env.REACT_APP_PaymasterCA

        // Use cached provider or create new one
        let provider
        const cacheKey = process.env.REACT_APP_SEPOLIA_URL
        if (providerCache.has(cacheKey)) {
            provider = providerCache.get(cacheKey)
        } else {
            try {
                provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_URL)
                providerCache.set(cacheKey, provider)
            } catch (error) {
                console.error('Failed to create provider:', error)
                return null
            }
        }

        try {
            const signer = new ethers.Wallet(userPvtKey, provider)
            const EntryPointContract = new ethers.Contract(EntryPointCA, EntryPointABI.abi, provider)
            const SmartAccountContract = new ethers.Contract(smartAccCA, SmartAccountABI.abi, provider)
            const TokenContract = new ethers.Contract(TokenCA, TokenABI.abi, provider)
            const NftContract = new ethers.Contract(NftCA, NftABI.abi, provider)
            const PaymasterContract = new ethers.Contract(PaymasterCA, PaymasterABI.abi, provider)

            return {
                provider,
                signer,
                EntryPointContract,
                SmartAccountContract,
                TokenContract,
                NftContract,
                PaymasterContract
            }
        } catch (error) {
            console.error('Failed to create contracts:', error)
            return null
        }
    }, [userPvtKey, smartAccCA])
}

export default useNewEthers
