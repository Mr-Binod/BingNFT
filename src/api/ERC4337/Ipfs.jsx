import axios from "axios"
import { ContractEventPayload, ethers } from "ethers";
import { useSelector } from "react-redux";

const pinata_api_key = "84341dedc5714b228c1f";
const pinata_secret_api_key = "3a0293c0918269143c81ab9c4ef791d4f83b0d7f925ddb8aafd43e4c1e3e819d"



const uploadIPFS = async ({formdata, nftName, nftDesc}) => {
    try {
        const { data } = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formdata, {
            headers: {
                "Content-Type": "multipart/form-data",
                pinata_api_key,
                pinata_secret_api_key
            }
        })
        const ipfsImage = `ipfs://${data.IpfsHash}`;
        const JsonURI = await uploadJsonMetadataIPFS(nftName, nftDesc, ipfsImage)

        return JsonURI
   
        // const transaction = await ContractMetaNFT.setTokenURI(JsonURI, signer.address);
        // await transaction.wait();
        // try {
        //     const ownerTokens = await ContractMetaNFT.getAllTokenBalances(signer.address);
        //     console.log('Owner tokens:', ownerTokens, data);
        //     return ({ image: `http://gateway.pinata.cloud/ipfs/${data.IpfsHash}`, data })
        // } catch (error) {
        //     console.log('Error calling ownerToken:', error.message);
        // }

    } catch (error) {
        alert('Upload failed: ' + error);
    }
}

const uploadJsonMetadataIPFS = async (name, description, image) => {
    const metadata = {
        name,
        description,
        image
    }
    const blob = new Blob([JSON.stringify(metadata)], {
        type: "application/json"
    })
    const formData = new FormData();
    formData.append("file", blob, "metadata.json");
    const { data } = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            pinata_api_key,
            pinata_secret_api_key
        }
    })
    console.log(data.IpfsHash, 'hash')
    return data.IpfsHash
}



const SellNft = async (contractNFT, contractMetaNft, signer, paymaster, nftid, token, price) => {
    if (!paymaster) return;
    const addrs = await contractMetaNft.getAddress()
    // console.log('items', addrs, signer.address, paymaster, nftid, token, price)
    const checknfttokens = await (contractNFT.balanceOf(signer.address, nftid))
    console.log(checknfttokens, 'checknfttokens')
    const reCharge = await paymaster.sendTransaction({
        to: signer.address,
        value: ethers.parseEther("0.0015")
    })
    await reCharge.wait()
    await contractNFT.connect(signer).setApprovalForAll(paymaster.getAddress(), true);
    const metaNftWithPaymaster = contractMetaNft.connect(paymaster);
    const tx = await metaNftWithPaymaster.SellNFT(signer.getAddress(), nftid, token, price);
    await tx.wait();
    const sellData = await contractMetaNft.getall(signer.address, nftid)
    const decodedSellData = []
    decodedSellData.push({
        seller: sellData[0],
        token: sellData[1].toString(),
        price: sellData[2].toString()
    })
    return decodedSellData
}


const userNft = async (userAddress, contractNFT) => {
    if (!contractNFT) return
    try {
        const userNftids = await contractNFT.userTokens(userAddress)
        const ObjectNfts = [];
        for (const id of userNftids) {
            const Nftshare = await contractNFT.getCurrentBalance(userAddress, id);
            const Nfturi = await contractNFT.uri(id);
            const Uridata = await axios.get(`http://gateway.pinata.cloud/ipfs/${Nfturi}`);
            ObjectNfts.push({ tokenId: id, balance: Nftshare, uri: Nfturi, uridata: Uridata.data });
        }
        return ObjectNfts;
    } catch (error) {
        console.log('usernft', error)
    }
}

const getAllListedNftids = async (contractNft) => {
    if (!contractNft) return;
    try {
        const data = await contractNft.getAllListedNFTIds()
        const newData = await Promise.all(data?.map((el) => ({
            address: el[0],
            nftId: el[1]
        })))
        console.log(newData, "selldata")
        return newData

    } catch (error) {
        return error
    }
}


const BuyNft = async (sender, receiver, nftid, price, contractMetaNft,contractNFT, paymaster) => {
    const paymasterContract = contractMetaNft.connect(paymaster)
    // const reCharge = await paymaster.sendTransaction({
    //     to: contractNFT.address,
    //     value: ethers.parseEther("0.0015")
    // })
    // await reCharge.wait()
    await paymasterContract.BuyNFT( receiver, nftid, price)

}

export { BuyNft, uploadIPFS,  userNft, SellNft, getAllListedNftids } 