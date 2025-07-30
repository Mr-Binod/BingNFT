"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useDispatch, useSelector } from "react-redux"
import useNewEthers from "../../../hooks/useNewEthers"
import { CreateNft, getUserInfoCreate } from "../../../api/ERC4337/NewApi"
import { sendEntryPoint } from "../../../api/ERC4337/SendUserOps"
import { uploadIPFS } from "../../../api/ERC4337/Ipfs"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import loadingGif from "../../../images"
import { ethers } from "ethers"
import styled from "styled-components"

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const Header = styled.header`
  background: #ffffff;
  border-bottom: 1px solid #e5e5e5;
  padding: 16px 24px;
  position: sticky;
  top: 0;
  z-index: 100;
`

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Logo = styled.h1`
  color: #333333;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
`

const Navigation = styled.nav`
  display: flex;
  gap: 16px;
  align-items: center;
`

const NavLink = styled(Link)`
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
  }
`

const LogoutButton = styled.button`
  background: #374151;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1f2937;
  }
`

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`

const SectionTitle = styled.h2`
  color: #333333;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
`

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`

const InfoItem = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 16px;
`

const InfoLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`

const InfoValue = styled.div`
  font-size: 16px;
  color: #333333;
  font-weight: 600;
  word-break: break-all;
`

const Button = styled.button`
  background: #374151;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  &:hover {
    background: #1f2937;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 500px;
`

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #374151;
    box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
  }
`

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #374151;
    box-shadow: 0 0 0 3px rgba(55, 65, 81, 0.1);
  }
`

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`

const NFTCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const NFTImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`

const NFTContent = styled.div`
  padding: 16px;
`

const NFTTitle = styled.h3`
  color: #333333;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
`

const NFTInfo = styled.div`
  font-size: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
  color: #6b7280;
`

const NFTPrice = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 5px;
`

const NFTDescription = styled.p`
  color: #6b7280;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const NFTSeller = styled.div`
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 8px;
`

const ActionButton = styled(Button)`
  width: 100%;
  justify-content: center;
  position:relative;

  &.cancel {
    background: #dc2626;
    
    &:hover {
      background: #b91c1c;
    }
  }

  &.buy {
    background: #059669;
    
    &:hover {
      background: #047857;
    }
  }
`

const LoadingImage = styled.img`
position: absolute;
left: 60px;
  width: 50px;
  height: 50px;
  box-sizing: border-box;
`

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`

const ModalTitle = styled.h3`
  color: #333333;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`

const CancelButton = styled(Button)`
  background: #6c757d;

  &:hover {
    background: #5a6268;
  }
`

/* global BigInt */

const Mainpage = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [sellnfts, setSellnfts] = useState(null)
  const [count, setCount] = useState(0)
  const [showBtn, setShowBtn] = useState(true)
  const [cancelData, setCancelData] = useState({
    userid: "",
    sender: "",
    nftid: null,
    nftUridata: "",
    nftidToken: null,
  })
  const [showNftModal, setShowNftModal] = useState(false)

  const Contracts = useSelector((state) => state.contractReducer)
  const { userId, loading, islogin } = useSelector((state) => state.LoginReducer)

  const amount = ethers.parseEther("1000", 18)
  const value = ethers.parseEther("0")
  const Eventlog = []

  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const BaseUrl = process.env.REACT_APP_API_BASE_URL

  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const data = await getUserInfoCreate(userId)
      const { data: sellnft } = await axios.get(`${BaseUrl}/sellnft`)
      console.log(sellnft, "ss")
      const parsedSellnft = sellnft.message.map((el) => {
        const parsed = JSON.parse(el.nftUridata)
        el.nftUridata = parsed
        return el
      })
      console.log(parsedSellnft, data.message)
      setUserInfo(data.message)
      dispatch({ type: "setUser", payload: data.message })
      dispatch({ type: "nftDatas", payload: parsedSellnft })
      setSellnfts(parsedSellnft)
      return data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: true,
    retry: 3,
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
      e.preventDefault()
      const { TokenContract, SmartAccountContract, EntryPointContract, NftContract, signer } = Contracts
      const { smartAcc } = userInfo
      const formdata = new FormData()
      const { nftname, nftdesc } = e.target
      const File = e.target.file.files[0]
      dispatch({ type: "Loading", payload: true })

      console.log(nftname.value, nftdesc.value, File)
      if (!nftname.value.trim() || !nftdesc.value.trim() || !File) {
        alert("모든 필드를 채워주세요.");
        return;
      }
      const nftName = nftname.value
      const nftDesc = nftdesc.value

      formdata.append("file", File)
      console.log(formdata)

      const IpfsUri = await uploadIPFS({ formdata, nftName, nftDesc })
      const data = await CreateNft(IpfsUri, smartAcc)

      const filter = NftContract.filters.TokenURICreated() // create a filter
      const events = await NftContract.queryFilter(filter, 0, "latest") // from block 0 to latest
      const latestEvent = await NftContract.queryFilter(filter, "latest", "latest") // from block 0 to latest
      console.log(latestEvent, "Lastest")
      for (const event of events) {
        const { tokenId, sender, uri } = event.args
        try {
          const uridata = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri}`)
          const imgpath = uridata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
          uridata.data.image = imgpath
          Eventlog.push({ tokenId, sender, uri, uridata: uridata.data })
        } catch (err) {
          console.error(`Failed to fetch URI for token ${tokenId.toString()}:`, err.message)
        }
      }
      for (const event of latestEvent) {
        const { tokenId, sender, uri } = event.args
        console.log(sender, userInfo.smartAcc, "ss")
        if (sender !== userInfo.smartAcc) return alert("ff")
        const nftidToken = Number(await NftContract.balanceOf(sender, tokenId))
        try {
          const uridata = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri}`)
          const imgpath = uridata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
          uridata.data.image = imgpath
          const newtokenId = Number(tokenId)
          const JsonData = JSON.stringify(uridata.data)
          const _data = { userid: userId, nftid: newtokenId, nftidToken, nftUridata: JsonData }
          console.log(_data)
          const data = await axios.post(`${BaseUrl}/createusernft`, _data)
          console.log(data)
          dispatch({ type: "Loading", payload: false })
        } catch (error) {
          alert("NFT 추가 오류" + error)
        }
      }
      // console.log('GG', data, Eventlog)
      navigate('/mypage')
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
    },
    onSuccess: () => {
      // refetch()
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })

  const GetCoin = async () => {
    // if(!Contracts) return;
    dispatch({ type: "Loading", payload: true })
    const { TokenContract, SmartAccountContract, EntryPointContract, signer } = Contracts
    const { smartAcc } = userInfo

    const mintCallData = TokenContract.interface.encodeFunctionData("mint", [smartAcc, amount])
    const events = await EntryPointContract.on("UserOpCompleted")

    console.log("nonce", events)
    const callData = SmartAccountContract.interface.encodeFunctionData("execute", [
      process.env.REACT_APP_BING_TKN_CA,
      value,
      mintCallData,
    ])
    const response = await sendEntryPoint(smartAcc, EntryPointContract, callData, signer)

    
    await TokenContract.on('minted', async (address, amount) => {
      const balance = await TokenContract.balanceOf(smartAcc)
      const newBalance = ethers.formatEther(balance)
      setUserBalance(newBalance)
      dispatch({ type: "Loading", payload: false })
      await queryClient.invalidateQueries({ queryKey: ["user"] })
      console.log("response mainpage", newBalance, response)
      console.log(address, amount)
    })

    // await new Promise((resolve, reject) => {
    //     const listener = async (owner, value) => {
    //         if (owner.toLowerCase() === smartAcc.toLowerCase()) {
    //             const balance = await TokenContract.balanceOf(smartAcc)
    //             const newBalance = ethers.formatEther(balance)
    //             setUserBalance(newBalance)

    //             console.log("Minted:", owner, value.toString())
    //             console.log("response mainpage", newBalance, response)
    //             TokenContract.off("minted", listener) // Clean up the listener
    //             resolve()
    //         }
    //     }
    //     setTimeout(() => {
    //         TokenContract.off("minted", listener)
    //         reject(new Error("Timeout: 'minted' event not received"))
    //     }, 60000) // 30 seconds
    //     TokenContract.on("minted", listener)
    // })
    // dispatch({ type: "Loading", payload: false })
    // await queryClient.invalidateQueries({ queryKey: ["user"] })
  }

  useEffect(() => {
    if (!Contracts || !userInfo) return
      ; (async () => {
        const { TokenContract } = Contracts
        const { smartAcc } = userInfo
        const balance = await TokenContract.balanceOf(smartAcc)
        const newbalance = balance.toString()
        const newBalance = Math.floor(Number(ethers.formatEther(balance)))

        setUserBalance(newBalance)
      })()
  }, [Contracts])

  const CancelSell = async ({ userid, sender, nftid, nftUridata, nftidToken }) => {
    const _data = { smartAccAddress: sender, nftid }
    const stringifyData = JSON.stringify(nftUridata)
    const updataData = { userid, nftid, nftUridata: stringifyData, nftidToken }
    console.log(_data)
    const confirmed = window.confirm("판매 취소 하시겠습니까?")
    if (!confirmed) return
    dispatch({ type: "Loading", payload: true })
    const { data } = await axios.delete(`${BaseUrl}/sellnft`, { data: _data })
    const { data: PatchData } = await axios.patch(`${BaseUrl}/sellnft`, updataData)
    const { data: ContractRes } = await axios.delete(`${BaseUrl}/contractsellnft`, { data: _data })
    if ((ContractRes.state = 200)) alert("네트워크에 기로 되었습니다")
    dispatch({ type: "Loading", payload: false })
    await queryClient.invalidateQueries({ queryKey: ["user"] })
  }

  const BuyNft = async ({ sender, nftid, nftUridata, nftidToken, price }) => {
    const confirmed = window.confirm("구매 하시겠습니까?")
    if (!confirmed) return
    if (userBalance < Number(price)) return alert("잔액이 부족합니다")
    const { TokenContract, SmartAccountContract, EntryPointContract, signer } = Contracts
    const { smartAcc } = userInfo
    dispatch({ type: "Loading", payload: true })
    const receiver = userInfo.smartAcc
    const stringifyData = JSON.stringify(nftUridata)
    const data = { userid: userId, sender, nftid, nftUridata: stringifyData, nftidToken, price, receiver }
    const _data = { smartAccAddress: sender, nftid }
    dispatch({ type: "Loading", payload: true })
    const result = await axios.post(`${BaseUrl}/buynft`, data)

    console.log(result, "buynft")
    const { data: Deletedata } = await axios.delete(`${BaseUrl}/sellnft`, { data: _data })
    const result2 = await axios.post(`${BaseUrl}/contractbuynft`, data)

    const amount = ethers.parseEther(`${price}`, 18)
    console.log({ sender, nftid, nftUridata, nftidToken, price, amount })

    const mintCallData = TokenContract.interface.encodeFunctionData("transfer(address,uint256)", [sender, amount])
    const events = await EntryPointContract.on("UserOpCompleted")

    console.log("nonce", events)
    const callData = SmartAccountContract.interface.encodeFunctionData("execute", [
      process.env.REACT_APP_BING_TKN_CA,
      value,
      mintCallData,
    ])
    const response = await sendEntryPoint(smartAcc, EntryPointContract, callData, signer)
    console.log("GGG")
    await new Promise((resolve, reject) => {
      const listener = async (owner, value) => {
        if (owner.toLowerCase() === smartAcc.toLowerCase()) {
          const balance = await TokenContract.balanceOf(smartAcc)
          const newBalance = ethers.formatEther(balance)
          setUserBalance(newBalance)

          console.log("Minted:", owner, value.toString())
          console.log("response mainpage", newBalance, response)
          TokenContract.off("Transfer", listener) // Clean up the listener
          resolve()
        }
      }
      setTimeout(() => {
        TokenContract.off("Transfer", listener)
        reject(new Error("Timeout: 'Transfer' event not received"))
      }, 100000) // 30 seconds
      TokenContract.on("Transfer", listener)
    })
    alert("NFT 구매 완료 되었습니다")
    dispatch({ type: "Loading", payload: false })
    await queryClient.invalidateQueries({ queryKey: ["user"] })
    navigate('/mypage')
  }

  const LogoutHandler = () => {
    dispatch({ type: "logout" }) // This will clear userId and user too
    console.log("zz")
    navigate('/')
  }


  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>BingNFT Platform</Logo>
          <Navigation>
            <NavLink to="/mypage">마이페이지</NavLink>
            <LogoutButton onClick={LogoutHandler}>로그아웃</LogoutButton>
          </Navigation>
        </HeaderContent>
      </Header>

      {showNftModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowNftModal(false)}>
          <ModalContent>
            <ModalTitle>NFT 생성</ModalTitle>
            <Form
              onSubmit={(e) => {
                createNftMutn.mutate(e)
                setShowNftModal(false)
              }}
            >
              <Input type="text" name="nftname" placeholder="NFT 이름을 입력하세요" />
              <TextArea name="nftdesc" placeholder="NFT 설명을 입력하세요"></TextArea>
              <Input type="file" name="file" accept="image/*" />
              <ButtonGroup>
                <CancelButton type="button" onClick={() => setShowNftModal(false)}>
                  취소
                </CancelButton>
                {loading ? (
                  <Button disabled>
                    <LoadingImage src={loadingGif} />
                    생성 중...
                  </Button>
                ) : (
                  <Button type="submit">NFT 생성하기</Button>
                )}
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      <Content>
        <Card>
          <SectionTitle>사용자 정보</SectionTitle>
          <UserInfoGrid>
            <InfoItem>
              <InfoLabel>아이디</InfoLabel>
              <InfoValue>{userId}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Public Key</InfoLabel>
              <InfoValue>{userInfo?.UserAddress}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Smart Account</InfoLabel>
              <InfoValue>{userInfo?.smartAcc}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>잔액</InfoLabel>
              <InfoValue>{userBalance ? userBalance : 0} BTK</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>화이트리스트</InfoLabel>
              <InfoValue>{userInfo?.checkWhitelist === true ? "true" : "false"}</InfoValue>
            </InfoItem>
          </UserInfoGrid>
        </Card>

        <Card>
          <SectionTitle>액션</SectionTitle>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between", }}>
            {loading ? (
              <Button disabled>
                <LoadingImage src={loadingGif} />
                처리 중...
              </Button>
            ) : (
              <Button onClick={GetCoin}>1000 BTK 받기</Button>
            )}
            {loading ? (
              <Button disabled>
                <LoadingImage src={loadingGif} />
                처리 중...
              </Button>
            ) : (
              <Button onClick={() => setShowNftModal(true)}>NFT 생성</Button>
            )}

          </div>
        </Card>

        <Card>
          <SectionTitle>NFT 마켓플레이스</SectionTitle>
          <NFTGrid>
            {sellnfts?.map((el, i) => {
              return (
                <NFTCard key={i}>
                  <NFTImage src={el.nftUridata.image} alt={el.nftUridata.name} />
                  <NFTContent>
                    <NFTInfo>
                      <NFTTitle>이름 : {el.nftUridata.name}</NFTTitle>
                      <span>토큰 ID: {el.nftid}</span>
                    </NFTInfo>
                    <NFTInfo>
                      <NFTPrice>가격 : {el.price} BTK</NFTPrice>
                      <span>수량: {el.nftidTokenAmt}</span>
                    </NFTInfo>
                    <NFTDescription>{el.nftUridata.description}</NFTDescription>
                    <NFTSeller>판매자: {el.userid}</NFTSeller>
                    {loading ? (
                      <ActionButton disabled>
                        <LoadingImage src={loadingGif} />
                        처리 중...
                      </ActionButton>
                    ) : el.userid === userId ? (
                      <ActionButton
                        className="cancel"
                        onClick={() => {
                          CancelSell({
                            userid: el.userid,
                            sender: el.smartAccAddress,
                            nftid: el.nftid,
                            nftUridata: el.nftUridata,
                            nftidToken: el.nftidTokenAmt,
                          })
                          return
                        }}
                      >
                        판매 취소
                      </ActionButton>
                    ) : (
                      <ActionButton
                        className="buy"
                        onClick={() => {
                          BuyNft({
                            sender: el.smartAccAddress,
                            nftid: el.nftid,
                            nftUridata: el.nftUridata,
                            nftidToken: el.nftidTokenAmt,
                            price: el.price,
                          })
                          return
                        }}
                      >
                        구매하기
                      </ActionButton>
                    )}
                  </NFTContent>
                </NFTCard>
              )
            })}
          </NFTGrid>
        </Card>
      </Content>
    </Container>
  )
}

export default Mainpage
