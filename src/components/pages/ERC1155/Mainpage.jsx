import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { use, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createWallet, getWallet, getWallets } from '../../../api/ERC1155/Wallet';
import { getUser, getUsers, Patchbalance } from '../../../api/ERC1155/Model';
import { useEthers } from '../../../hooks/useEthers';
import { useDispatch, useSelector } from "react-redux"
import { uploadIPFS, GetBTKcoin, userBalance, userNft, getAllListedNftids, BuyNft } from '../../../api/ERC1155/Contract';
import Mypage from './Mypage';
import axios from 'axios';

const Mainpage = () => {
    const [userkeys, setUserkeys] = useState([])
    const [users, setUsers] = useState(null);
    const [userbalance, setUserbalance] = useState(0);
    const [nfts, setNfts] = useState([]);
    const [sellData, setSellData] = useState([]);
    const islogin = useSelector((state) => state.LoginReducer.State)
    const userId = useSelector((state) => state.LoginReducer.userId)  // ✅ Get from Redux
    const user = useSelector((state) => state.LoginReducer.user)      // ✅ Get from Redux
    const [load, setLoad] = useState(false)

    // const { pkprovider, provider, paymaster, signer, contractMeta, contractNFT, contractCoin, contractMetaNft } = useEthers(userkeys, user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const queryClient = useQueryClient();
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["data"],
        queryFn: async () => {
            const wallets = await getUsers();
            // const usernft = await userNft(signer.getAddress(), contractNFT )
            setUsers(wallets)
            const privateKeys = wallets.map((el) => el.privateKey);
            setUserkeys(privateKeys);
            return ({ wallets })
        },
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        enabled: true,
        retry: 2
    })
    // ✅ Separate query for user data
    const { data: userData, isLoading: userLoading } = useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            if (userId) {
                const Userinfo = await getUser(userId)
                console.log(Userinfo)
                dispatch({ type: 'setUser', payload: Userinfo })
                return Userinfo
            }
            return null
        },
        enabled: !!userId, // Only run when userId exists
        retry: 2
    })
    const ethersArgs = useMemo(() => {
        if (!userkeys.length || !user) return [null, null];
        return [userkeys, user];
    }, [userkeys, user]);
    
    const {
        pkprovider,
        provider,
        paymaster,
        signer,
        contractMeta,
        contractNFT,
        contractCoin,
        contractMetaNft } = useEthers(...ethersArgs);


    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    useMemo(() => {
        if (!contractNFT) return;
        const fetchSellData = async () => {
            try {
                const data = await getAllListedNftids(contractNFT);
                // Wait for all sellLists to resolve
                await delay(1000)
                console.log(data, 'data')
                if (!data) return;
                const result = await Promise.all(data.map(async (el, i) => {
                    await delay(1000)
                    const sellLists = await contractMetaNft.getall(el.address, el.nftId);
                    // console.log(sellLists, 'kk11')
                    await delay(1000)
                    const imgUri = await contractNFT?.uri(el.nftId)
                    const { data } = await axios.get(`http://gateway.pinata.cloud/ipfs/${imgUri}`)
                    // console.log(data, 'uri')
                    if (!sellLists || !data) return undefined;
                    return ({
                        address: sellLists[0],
                        nftid: el.nftId,
                        nftToken: sellLists[1],
                        price: sellLists[2],
                        uridata: data
                    })
                }));
                const uniqueSellData = [];
                const seen = new Set();
                for (const el of result) {
                    const key = `${el.address.toLowerCase()}-${el.nftid.toString()}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        uniqueSellData.push(el);
                    }
                }
                setSellData(uniqueSellData); // flatten if you want a single array
                console.log(uniqueSellData, 'uniqueSellData');
            } catch (error) {
                // alert('fetchsell' + error)
                console.log(error)
            }
        }
        fetchSellData();
    }, [contractNFT]);


    const createNftMutn = useMutation({
        mutationFn: async (e) => {
            e.preventDefault();
            if (!signer) return alert('signer not available');
            const formdata = new FormData();
            console.log('test uploadipfs data', e.target.file.files[0])
            const File = e.target.file.files[0];
            formdata.append("file", File)
            console.log('test uploadipfs data', formdata, signer)
            const data = await uploadIPFS(formdata, paymaster, contractMetaNft, contractNFT, signer)
        },
        onSuccess: () => {
            // refetch()
            queryClient.invalidateQueries(['users'])
        }
    })
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    const loginHandler = (e) => {
        e.preventDefault();
        const { userid } = e.target;
        const isUser = users && users.find((el) => el.user === userid.value);
        if (!userid.value || !isUser || userid.value.trim() === "") return alert('아이디를 입력해주세요');
        dispatch({ type: 'setUserId', payload: userid.value })  // ✅ Set in Redux
        dispatch({ type: 'login' })
        userid.value = "";
    }
    const signUp = (e) => {
        e.preventDefault();
        const { signupid } = e.target;
        const isUser = users && users.find((el) => el.user === signupid.value);
        if (isUser) return alert('이미 사용된 아이디입니다');
        dispatch({ type: 'setUserId', payload: signupid.value })  // ✅ Set in Redux
        // createwalletMutn.mutate(signupid.value, userbalance)
        signupid.value = "";
    }
    const LogoutHandler = () => {
        // navigate('/')
        dispatch({ type: 'logout' })  // This will clear userId and user too
        console.log('zz')
    }

    const getBTKcoin = async () => {
        const txMessage = {
            sender: user.account,
            data: 150
        }
        const sign = await signer.signMessage(JSON.stringify(txMessage));
        const data = await GetBTKcoin(signer, paymaster, contractMeta, contractCoin);
        const newdata = Number(data)
        const result = await Patchbalance(user.data.id, newdata)
        setUserbalance(newdata)
        navigate('/main')
    }

    const imgpath = (img) => {
        const httpUrl = img.replace("ipfs://", "http://gateway.pinata.cloud/ipfs/");
        console.log(httpUrl, 'url11')
        return httpUrl
    }

    const BuyNfthandler = async (sender, nftid, price) => {
        const paymasterNft = contractNFT.connect(paymaster);
        const paymasterCoin = contractMeta.connect(paymaster);
        // const reCharge = await paymaster.sendTransaction({
        //     to: contractNFT.address,
        //     value: ethers.parseEther("0.0015")
        // })
        // await reCharge.wait()
        console.log(signer.address, nftid, price)
        await paymasterNft.BuyNFT(sender, signer.address, nftid, price);
        const msg = 'hello'
        const signature = signer.signMessage(msg)
        const boughtNft = await contractNFT.balanceOf(signer.address, nftid)
        await paymasterCoin.Send(signer.address, sender, price, msg, signature)
        console.log('SS', msg, signature)
        navigate('/main')
    }

    const CancelsellHandler = async (sender, nftid) => {
        const paymasterContract = contractMetaNft.connect(paymaster);
        await paymasterContract.cancelSale(sender, nftid);
        navigate('/main')
    }

    useEffect(() => {
        // ✅ Fetch user data when userId changes
        if (userId && !user) {
            (async () => {
                try {
                    const Userinfo = await getUser(userId)
                    await delay(1000);
                    dispatch({ type: 'setUser', payload: Userinfo })
                } catch (error) {
                    console.error('Error fetching user data:', error)
                }
            })()
        }
    }, [userId, user])

    useEffect(() => {
        // if(loading) return;
        // console.log(users, 'users data')
        // console.log(userId, 'userId data')
        // console.log(user, 'user data')
        // console.log(data, 'query data')
        // console.log(userkeys, 'userkeys data')
        // console.log(islogin, 'islogin data')
        // console.log(signer, 'signer data')
        // console.log(nfts, 'nfts data',)
        // console.log(pkprovider, provider, paymaster, contractNFT, contractMeta, 'providers data')
    }, [contractMetaNft])

    useEffect(() => {
        if (!contractNFT || !user || !signer) return;
        (async () => {
            const result = await userBalance(signer, contractCoin)
            const newResult = Number(result);
            setUserbalance(newResult);
            console.log(newResult, userbalance, signer, "signer", nfts)
        })()
        dispatch({ type: "Contracts", payload: { signer, paymaster, contractMeta, contractNFT, contractCoin, contractMetaNft } })
    }, [contractMetaNft])


    if (isLoading) return <>...loading</>
    if (!islogin) return <>로그인해주세요</>
    if (!nfts) return <>loading nfts</>
    return (
        <div>
            mainpage
            <Link to="/mypage">mypage</Link> <br />

            {/* {!islogin ? <div> <form onSubmit={(e) => loginHandler(e)}>
                <input type="text" name='userid' />
                <button>Login</button>
            </form> <br />
                <form onSubmit={(e) => signUp(e)}>
                    <input type="text" name='signupid' />
                    <button>signup</button>
                </form></div>
                : <button onClick={LogoutHandler}>Logout</button>} */}
            {/* Display Users */}
            {islogin && <Link to="/"><button onClick={LogoutHandler}>Logout</button></Link>}
            <div>
                <h3>User 정보</h3>
                {user ? <ul>
                    <li>계정 : {signer?.address} </li>
                    <li>공개키 : {user.data.publicKey}</li>
                    <li>잔액 : {userbalance} BTK</li>
                </ul> : ""}
                <h3>Get Bing Token</h3>
                <button onClick={getBTKcoin} >Getcoin</button>
                <h3>uploadNFT</h3>
                <form onSubmit={(e) => createNftMutn.mutate(e)}>
                    <input type="file" name='file' />
                    <button>submit</button>
                </form>
                <h3>NFTs:</h3>
                {sellData?.map((el, i) =>
                (Number(el.nftToken) !== 0 ? <div key={i}>
                    <img src={imgpath(el.uridata.image)} width="200px" />
                    <div><span>Total available Nft : 100</span></div>
                    <div><span>id : {el.nftid}</span> <span>sell amt : {el.nftToken}</span></div>
                    <div><span>name : {el.uridata.name}</span></div>
                    <div>price : {el.price}</div>
                    {el.address !== signer.address ?
                        <button onClick={() => {
                            BuyNfthandler(el.address, el.nftid, el.price)
                        }}>Buy Nft</button> : <button onClick={() => {
                            CancelsellHandler(signer.address, el.nftid)
                        }}>Cancel sell</button>}
                </div> : null)
                )}
                {/* <img src="http://gateway.pinata.cloud/ipfs/QmeuPaDUPkWsYfSMb2yUztWNhFUTTvPaqns3H9UW4fcGGY" /> */}
                <h3>Users:</h3>
                {users && users.length > 0 ? (
                    <ul>1
                        {users.map((user, index) => (
                            <li key={index}>
                                User: {user.user} | Account: {user.account} | Balance: {user.balance}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No users found</p>
                )}
            </div>
        </div>
    )
}

export default Mainpage
