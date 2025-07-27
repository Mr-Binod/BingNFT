import { id } from 'ethers'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { styled } from "styled-components"
import { SellNft, userNft } from '../../../api/ERC1155/Contract'


const Wrap = styled.div`
  position: relative;
`

const Divform = styled.div`
  display: flex;
  position: abosolute;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 1000; 
  .Tokenform {
    width: 450px;
    height: 280px;
    position: fixed;
    top: 30%; left: -50%;
    transform: translateX(-50%);
    left: 50%;
    z-index: 1000; /* above other content */
    background: rgba(0,0,0,0.03); 
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    background-color: #e7d988;
    border-radius: 15px;
    padding: 40px;
    box-sizing: border-box;
    font-size: 18px;
  }

  input {
    width: 250px;
    height: 30px;
    background-color:#fdf0e5;
    border: none;
    outline: none;
    border-radius: 5px;
    padding : 0 10px;
  }

  .Divbtn{
    button {
      height: 35px;
      width: 120px;
      margin : 0 10px;
      border-radius: 5px;
      border: none;
    }
    button:hover {
      background-color: #9de7a3
    }
  }
`
const Mypage = () => {

  const [isactive, setIsactive] = useState(false)
  const [userbalance, setUserbalance] = useState(null)
  const [tknid, setTknid] = useState("")
  const [idindx, setIndx] = useState("")
  const [nfts, setNfts] = useState([])

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { signer, contractMeta, contractNFT, paymaster, contractCoin, contractMetaNft } = useSelector(state => state.contractReducer)

  // const [nfts] = useSelector((state) => state.NftsReducer)
  const user = useSelector((state) => state.LoginReducer.user)

  const imgpath = (img) => {
    const httpUrl = img.replace("ipfs://", "http://gateway.pinata.cloud/ipfs/");
    console.log(httpUrl, 'url11')
    return httpUrl
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    console.log(userbalance, 'userbalance')
    console.log(signer)
  }, [])

  useEffect(() => {
    async function fetchNfts() {
      if (!signer || !contractNFT) return;
      await delay(1000)
      const NftDatas = await userNft(signer.address, contractNFT);
      setNfts(NftDatas);
    }
    fetchNfts();
    // No return value!
  }, [contractNFT]);

  useEffect(() => {
    console.log(nfts, 'nfts')
    dispatch({ type: "nftDatas", payload: nfts })
  }, [nfts])

  const sellNft = async (e) => {
    // alert(Number(nfts[i].balance))
    e.preventDefault();
    setIsactive(false)
    const userNftbalance = Number(nfts[idindx].balance)
    const userNftindx = nfts[idindx].tokenId

    if (userNftindx === tknid && userNftbalance > 0) {
      const { NfttknValue: { value: Nftvalue }, tknValue: { value: tknvalue } } = e.target;
      const newNftvalue = Number(Nftvalue)
      const newtknvalue = Number(tknvalue)
      console.log(newNftvalue, 'newNftvalue', typeof (newNftvalue), 'vv', userNftbalance)
      console.log(newtknvalue, 'newtknvalue', typeof (newtknvalue), 'vv', userNftbalance)
      if (newNftvalue > userNftbalance) alert('토큰량이 다시 확인해주세요')
      const newTknid = Number(tknid)
      await SellNft(contractNFT, contractMetaNft, signer, paymaster, newTknid, newNftvalue, newtknvalue)
      // const sellData = await contractMetaNft.getTotalTokensForNFTId(newTknid)
      // console.log(sellData, 'sellData')
      alert("nft 판매 환료됬었습니다")
      navigate('/mypage')
    }
  }

  const getSellList = async () => {
    const SellList = await contractMetaNft.getall(signer.address, Number(tknid))
    const decodedSellData = [];
    decodedSellData.push({
      seller: SellList[0],
      token: SellList[1].toString(),
      price: SellList[2].toString()
    })
    console.log(SellList, 'selllist', decodedSellData)
  }

  useEffect(() => {
    // console.log(isactive, 'ee')
    // console.log(tknid, 'ee')
    // console.log(idindx, 'ee')
  }, [isactive, tknid, idindx])

  useEffect(() => {
    // console.log(contractMeta, contractNFT, contractCoin, contractMetaNft)
  }, [contractMetaNft])

  if (!nfts) return <>loading</>
  return (
    <Wrap>
      mypageaaaaa
      <Link to="/main">mainpage</Link>
      {isactive && <Divform><form action="" className='Tokenform' onSubmit={(e) => sellNft(e)}>
        <div>
          <label htmlFor="">판매할 토큰 량을 입력해주세요</label> <br />
          <input type="number" name='NfttknValue' /> <br />
        </div>
        <div>
          <label htmlFor="">한 개개당 판매 가격</label> <br />
          <input type="number" name='tknValue' /> <br />
        </div>
        <div className='Divbtn'>
          <button type='button' onClick={() => {
            setIsactive(false)
          }} >cancel</button>
          <button>confirm</button>
        </div>
      </form>
      </Divform>}
      <h3>NFTs:</h3>
      {nfts?.map((el, i) =>
      (<div key={i} >
        <img src={imgpath(el.uridata.image)} width="200px" />
        <div>{el.balance}</div>
        <div>{el.tokenId}</div>
        <button onClick={() => {
          setTknid(el.tokenId)
          setIndx(i)
          setIsactive(true)
        }} >Sell NFT</button>
        <button onClick={() => {
          setTknid(el.tokenId)
          setIndx(i)
          getSellList()
        }} >Get SellList</button>
      </div>)
      )}
    </Wrap>
  )
}

export default Mypage
