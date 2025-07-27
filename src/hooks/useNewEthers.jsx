import { ethers } from 'ethers'
import EntryPointABI from '../abi/EntryPoint.json'
import SmartAccountABI from '../abi/SmartAccount.json'
import TokenABI from '../abi/Bingtoken.json'
import NftABI from '../abi/BingNFT.json'

const useNewEthers = (userPvtKey, smartAccCA) => {
    
    const EntryPointCA = process.env.REACT_APP_ENTRYPOINT_CA
    const TokenCA = process.env.REACT_APP_BING_TKN_CA
    const NftCA = process.env.REACT_APP_NFT_CA

    const provider = new ethers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_URL)
    const signer = new ethers.Wallet(userPvtKey, provider)
    const EntryPointContract = new ethers.Contract(EntryPointCA, EntryPointABI.abi, provider)
    const SmartAccountContract = new ethers.Contract(smartAccCA, SmartAccountABI.abi, provider)
    const TokenContract = new ethers.Contract(TokenCA, TokenABI.abi, provider)
    const NftContract = new ethers.Contract(NftCA, NftABI.abi, provider)

    return ({
        provider,
        signer,
        EntryPointContract,
        SmartAccountContract,
        TokenContract,
        NftContract
    })
}

export default useNewEthers
