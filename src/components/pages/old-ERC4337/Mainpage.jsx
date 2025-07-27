import React, { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import useNewEthers from '../../../hooks/useNewEthers'
import { CreateNft, getUserInfo, getUserInfoCreate } from '../../../api/ERC4337/NewApi'
import { sendEntryPoint } from '../../../api/ERC4337/SendUserOps'
import { uploadIPFS } from '../../../api/ERC4337/Ipfs'
import axios from 'axios'
import { Link } from 'react-router-dom'
import loadingGif from '../../../images'
import { ethers } from 'ethers';

/* global BigInt */


const Mainpage = () => {

    const [userInfo, setUserInfo] = useState(null)
    const [userBalance, setUserBalance] = useState(null)
    const [sellnfts, setSellnfts] = useState(null)
    const [count, setCount] = useState(0)
    const [showBtn, setShowBtn] = useState(true)
    const [cancelData, setCancelData] = useState({ userid: '', sender: '', nftid: null, nftUridata: '', nftidToken: null })

    const Contracts = useSelector((state) => state.contractReducer)
    const { userId, loading, islogin } = useSelector((state) => state.LoginReducer)

    const amount = ethers.parseEther("1000", 18);
    const value = ethers.parseEther("0");
    const Eventlog = []

    const queryClient = useQueryClient();
    const dispatch = useDispatch()

    const { data, isLoading } = useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            const data = await getUserInfoCreate(userId)
            const { data: sellnft } = await axios.get('http://localhost:3001/sellnft')
            console.log(sellnft, 'ss')
            const parsedSellnft = sellnft.message.map((el) => {
                const parsed = JSON.parse(el.nftUridata)
                el.nftUridata = parsed
                return el
            })
            console.log(parsedSellnft, data.message)
            setUserInfo(data.message)
            dispatch({ type: 'setUser', payload: data.message })
            dispatch({ type: 'nftDatas', payload: parsedSellnft })
            setSellnfts(parsedSellnft)
            return data
        },
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        enabled: true,
        retry: 3
    })

    const CallHookFn = () => {
        const result = useNewEthers(userInfo.privateKey, userInfo.smartAcc)
        dispatch({ type: 'Contracts', payload: result })
    }
    useEffect(() => {
        if (userInfo) CallHookFn()
    }, [userInfo])

    const createNftMutn = useMutation({
        mutationFn: async (e) => {
            e.preventDefault();
            const { TokenContract, SmartAccountContract, EntryPointContract, NftContract, signer } = Contracts;
            const { smartAcc } = userInfo;
            const formdata = new FormData();
            const { nftname, nftdesc } = e.target;
            const File = e.target.file.files[0];

            const nftName = nftname.value
            const nftDesc = nftdesc.value

            formdata.append("file", File)
            console.log(formdata)

            const IpfsUri = await uploadIPFS({ formdata, nftName, nftDesc })
            dispatch({ type: 'Loading', payload: true })
            const data = await CreateNft(IpfsUri, smartAcc)

            const filter = NftContract.filters.TokenURICreated(); // create a filter
            const events = await NftContract.queryFilter(filter, 0, 'latest'); // from block 0 to latest
            const latestEvent = await NftContract.queryFilter(filter, 'latest', 'latest'); // from block 0 to latest
            console.log(latestEvent, 'Lastest')
            for (const event of events) {
                const { tokenId, sender, uri } = event.args;
                try {
                    let uridata = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri}`);
                    const imgpath = uridata.data.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                    uridata.data.image = imgpath;
                    Eventlog.push({ tokenId, sender, uri, uridata: uridata.data });
                } catch (err) {
                    console.error(`Failed to fetch URI for token ${tokenId.toString()}:`, err.message);
                }
            }
            for (const event of latestEvent) {
                const { tokenId, sender, uri } = event.args;
                console.log(sender, userInfo.smartAcc, 'ss')
                if (sender !== userInfo.smartAcc) return alert('ff');
                const nftidToken = Number(await NftContract.balanceOf(sender, tokenId))
                try {
                    let uridata = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri}`);
                    const imgpath = uridata.data.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
                    uridata.data.image = imgpath;
                    const newtokenId = Number(tokenId)
                    const JsonData = JSON.stringify(uridata.data)
                    const _data = { userid: userId, nftid: newtokenId, nftidToken, nftUridata: JsonData }
                    console.log(_data)
                    const data = await axios.post(`http://localhost:3001/createusernft`, _data)
                    console.log(data)
                    dispatch({ type: 'Loading', payload: false })
                } catch (error) {
                    alert('NFT 추가 오류' + error)
                }
            }
            // console.log('GG', data, Eventlog)
            return Eventlog

            // cant do with erc 4337 check later
            // const mintCallData = await NftContract.interface.encodeFunctionData(
            //     'settokenURI', 
            //     [IpfsUri, smartAcc]
            // )
            // const callData = SmartAccountContract.interface.encodeFunctionData(
            //     'execute',
            //     [process.env.REACT_APP_NFT_CA, value, mintCallData]
            // )
            // const data = await sendEntryPoint(smartAcc, EntryPointContract, callData, signer) 
            setCount(prev => prev + 1)
        },
        onSuccess: () => {
            // refetch()
            queryClient.invalidateQueries({ queryKey: ['user'] }); 
        }
    })

    const GetCoin = async () => {
        // if(!Contracts) return;
        dispatch({ type: 'Loading', payload: true })
        const { TokenContract, SmartAccountContract, EntryPointContract, signer } = Contracts;
        const { smartAcc } = userInfo;

        const mintCallData = TokenContract.interface.encodeFunctionData('mint', [smartAcc, amount])
        const events = await EntryPointContract.on('UserOpCompleted')

        console.log('nonce', events)
        const callData = SmartAccountContract.interface.encodeFunctionData('execute',
            [process.env.REACT_APP_BING_TKN_CA, value, mintCallData]
        )
        const response = await sendEntryPoint(smartAcc, EntryPointContract, callData, signer)

        const balance = await TokenContract.balanceOf(smartAcc)
        const newBalance = ethers.formatEther(balance)
        setUserBalance(newBalance)
        console.log('response mainpage', newBalance, response)

        await new Promise((resolve, reject) => {
            const listener = async (owner, value) => {
                if (owner.toLowerCase() === smartAcc.toLowerCase()) {
                    const balance = await TokenContract.balanceOf(smartAcc);
                    const newBalance = ethers.formatEther(balance);
                    setUserBalance(newBalance);

                    console.log('Minted:', owner, value.toString());
                    console.log('response mainpage', newBalance, response);
                    TokenContract.off('minted', listener); // Clean up the listener
                    resolve();
                }
            };
            setTimeout(() => {
                TokenContract.off('minted', listener);
                reject(new Error("Timeout: 'minted' event not received"));
            }, 100000); // 30 seconds
            TokenContract.on('minted', listener);
        });
        dispatch({ type: 'Loading', payload: false })
        await queryClient.invalidateQueries({ queryKey: ['user'] });

    }

    useEffect(() => {
        if (!Contracts || !userInfo) return;
        (async () => {
            const { TokenContract } = Contracts;
            const { smartAcc } = userInfo;
            const balance = await TokenContract.balanceOf(smartAcc)
            const newbalance = balance.toString()
            const newBalance = Math.floor(Number(ethers.formatEther(balance)))

            setUserBalance(newBalance)
        })()
    }, [Contracts])

    const CancelSell = async ({ userid, sender, nftid, nftUridata, nftidToken }) => {
        const _data = { smartAccAddress: sender, nftid }
        const stringifyData = JSON.stringify(nftUridata)
        const updataData = { userid, nftid, nftUridata : stringifyData, nftidToken }
        console.log(_data)
        const confirmed = window.confirm('판매 취소 하시겠습니까?')
        if (!confirmed) return;
        dispatch({ type: 'Loading', payload: true })
        const { data } = await axios.delete('http://localhost:3001/sellnft', { data: _data })
        const { data: PatchData } = await axios.patch('http://localhost:3001/sellnft', updataData)
        const { data: ContractRes } = await axios.delete('http://localhost:3001/contractsellnft', { data: _data })
        if (ContractRes.state = 200) alert('네트워크에 기로 되었습니다')
        dispatch({ type: 'Loading', payload: false })
        await queryClient.invalidateQueries({ queryKey: ['user'] });
    }

    const BuyNft = async ({ sender, nftid, nftUridata, nftidToken, price }) => {
        const confirmed = window.confirm('구매 하시겠습니까?')
        if (!confirmed) return;
        if (userBalance < Number(price)) return alert('잔액이 부족합니다')
        const { TokenContract, SmartAccountContract, EntryPointContract, signer } = Contracts;
        const { smartAcc } = userInfo;
        dispatch({ type: 'Loading', payload: true })
        const receiver = userInfo.smartAcc;
        const stringifyData = JSON.stringify(nftUridata)
        const data = { userid: userId, sender, nftid, nftUridata: stringifyData, nftidToken, price, receiver }
        const _data = { smartAccAddress: sender, nftid }
        dispatch({ type: 'Loading', payload: true })
        const result = await axios.post('http://localhost:3001/buynft', data)

        console.log(result, 'buynft')
        const { data: Deletedata } = await axios.delete('http://localhost:3001/sellnft', { data: _data })
        const result2 = await axios.post('http://localhost:3001/contractbuynft', data)

        const amount = ethers.parseEther(`${price}`, 18)
        console.log({ sender, nftid, nftUridata, nftidToken, price, amount })

        const mintCallData = TokenContract.interface.encodeFunctionData('transfer(address,uint256)', [sender, amount])
        const events = await EntryPointContract.on('UserOpCompleted')

        console.log('nonce', events)
        const callData = SmartAccountContract.interface.encodeFunctionData('execute',
            [process.env.REACT_APP_BING_TKN_CA, value, mintCallData]
        )
        const response = await sendEntryPoint(smartAcc, EntryPointContract, callData, signer)
        console.log('GGG')
        await new Promise((resolve, reject) => {
            const listener = async (owner, value) => {
                if (owner.toLowerCase() === smartAcc.toLowerCase()) {
                    const balance = await TokenContract.balanceOf(smartAcc);
                    const newBalance = ethers.formatEther(balance);
                    setUserBalance(newBalance);

                    console.log('Minted:', owner, value.toString());
                    console.log('response mainpage', newBalance, response);
                    TokenContract.off('Transfer', listener); // Clean up the listener
                    resolve();
                }
            };
            setTimeout(() => {
                TokenContract.off('Transfer', listener);
                reject(new Error("Timeout: 'Transfer' event not received"));
            }, 100000); // 30 seconds
            TokenContract.on('Transfer', listener);
        });
        alert('NFT 구매 완료 되었습니다')
        dispatch({ type: 'Loading', payload: false })
        await queryClient.invalidateQueries({ queryKey: ['user'] });
    }

    const LogoutHandler = () => {
        // navigate('/')
        dispatch({ type: 'logout' })  // This will clear userId and user too
        console.log('zz')
    }

    return (
        <div>
            <h3>Main Page</h3>
            <Link to='/mypage' >My Page</Link> <br /> <br />
            <Link to="/"><button onClick={LogoutHandler}>Logout</button></Link> <br /><br />
            <div>
                아이디 : {userId} <br />
                public Key : {userInfo?.UserAddress} <br />
                smartAcc Address : {userInfo?.smartAcc} <br />
                user Balance : {userBalance ? userBalance : 0} BTK <br />
                White List : {(userInfo?.checkWhitelist === true) ? 'true' : 'false'}
            </div>

            <h3>Get Coin</h3>
            {loading ? <img src={loadingGif} alt="" width='50px' /> : <button onClick={GetCoin} >Get Coin</button>}
            <h3>uploadNFT</h3>
            <form onSubmit={(e) => createNftMutn.mutate(e)}>
                <input type="text" name='nftname' placeholder='NFT 이름' /> <br />
                <textarea name="nftdesc" placeholder='NFT 내용' id=""></textarea> <br />
                <input type="file" name='file' />
                {loading ? <img src={loadingGif} alt="" width='50px' /> : <button>submit</button>}
            </form>
            <h3>NFT Marketplace</h3>
            {sellnfts?.map((el, i) => {
                return (
                    <div key={i}>
                        <img src={el.nftUridata.image} alt="" width='200px' />
                        <div><span>name : {el.nftUridata.name}</span> <span>token id : {el.nftid}</span> </div>
                        <div><span>Sell Amt : {el.nftidTokenAmt}</span> <span>Price : {el.price}</span> </div>
                        <div>seller : {el.userid}</div>
                        <div className='desc' >desc : {el.nftUridata.description}</div>
                        {loading ? (
                            <img src={loadingGif} width="50px" alt="loading..." />
                        ) :
                            el.userid === userId ? <button onClick={() => {
                                // setCancelData({userid : el.userid, sender : el.smartAccAddress, nftid : el.nftid})
                                CancelSell({
                                    userid: el.userid,
                                    sender: el.smartAccAddress,
                                    nftid: el.nftid,
                                    nftUridata: el.nftUridata,
                                    nftidToken: el.nftidTokenAmt
                                })
                                return
                            }
                            } >Cancel Sell</button> : <button onClick={() => {
                                BuyNft({
                                    sender: el.smartAccAddress,
                                    nftid: el.nftid,
                                    nftUridata: el.nftUridata,
                                    nftidToken: el.nftidTokenAmt,
                                    price: el.price
                                })
                                return
                            }}>Buy Token</button>
                        }
                    </div>)
            }
            )}
        </div>
    )
}

export default Mainpage