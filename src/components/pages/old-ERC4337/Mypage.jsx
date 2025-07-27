"use client"

import axios from "axios"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"
import loadingGif from "../../../images"
import { Link } from "react-router-dom"
import { CheckZero, getUserInfoCreate } from "../../../api/ERC4337/NewApi"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const Container = styled.div`
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`

const Header = styled.header`
    background: white;
    border-radius: 20px;
    padding: 20px 30px;
    margin-bottom: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`

const Logo = styled.h1`
    color: #333;
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
`

const Navigation = styled.nav`
    display: flex;
    gap: 15px;
    align-items: center;
`

const NavLink = styled(Link)`
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    border-radius: 10px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
    }
`

const UserInfo = styled.div`
    background: white;
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`

const InfoGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
`

const InfoItem = styled.div`
    padding: 15px;
    background: #f8f9fa;
    border-radius: 12px;
    border-left: 4px solid #667eea;
    
    strong {
        color: #333;
        display: block;
        margin-bottom: 5px;
    }
    
    span {
        color: #666;
        font-size: 0.9rem;
        word-break: break-all;
    }
`

const Section = styled.section`
    background: white;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`

const SectionTitle = styled.h2`
    color: #333;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    
    &::before {
        content: '';
        width: 4px;
        height: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 2px;
    }
`

const NFTGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 25px;
    margin-top: 20px;
`

const NFTCard = styled.div`
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }
`

const NFTImage = styled.img`
    width: 100%;
    height: 200px;
    object-fit: cover;
`

const NFTContent = styled.div`
    padding: 20px;
`

const NFTTitle = styled.h3`
    color: #333;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 10px;
`

const NFTInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    font-size: 0.9rem;
    color: #666;
`

const NFTDescription = styled.p`
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 15px;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
`

const Button = styled.button`
    padding: 12px 25px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
    }
    
    &.sell {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }
    
    &.cancel {
        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
    }
`

const LoadingContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 20px;
`

const Modal = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`

const ModalContent = styled.div`
    background: white;
    border-radius: 20px;
    padding: 40px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const ModalTitle = styled.h3`
    color: #333;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
`

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 20px;
`

const Input = styled.input`
    padding: 15px 20px;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    
    &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
`

const ButtonGroup = styled.div`
    display: flex;
    gap: 15px;
    margin-top: 20px;
`

const CancelButton = styled(Button)`
    background: #6c757d;
    
    &:hover {
        background: #5a6268;
    }
`

const Mypage = () => {
  const [balance, setBalance] = useState(0)
  const [userNfts, setUserNfts] = useState(null)
  const [isactive, setIsactive] = useState(false)
  const [selldata, setSelldata] = useState({ userid: "", nftid: null, nftUridata: "" })

  const { userId, userinfo, loading } = useSelector((state) => state.LoginReducer)
  const Contracts = useSelector((state) => state.contractReducer)
  const sellLists = useSelector((state) => state.NftsReducer)

  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["mypage"],
    queryFn: async () => {
      const data = await getUserInfoCreate(userId)
      const { data: sellnft } = await axios.get("http://localhost:3001/sellnft")
      console.log(sellnft, "ss")
      const parsedSellnft = sellnft.message.map((el) => {
        const parsed = JSON.parse(el.nftUridata)
        el.nftUridata = parsed
        return el
      })
      console.log(parsedSellnft, data.message)
      dispatch({ type: "nftDatas", payload: parsedSellnft })
      return data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: true,
    retry: 3,
  })

  useEffect(() => {
    const { TokenContract } = Contracts
    ;(async () => {
      const balance = await TokenContract.balanceOf(userinfo.smartAcc)
      const newBalance = Math.floor(Number(ethers.formatEther(balance)))
      setBalance(newBalance)
      const { data } = await axios.get(`http://localhost:3001/user/${userId}`)
      const parsedData = data.message.map((el, i) => {
        const newNftUridata = JSON.parse(el.nftUridata)
        return { ...el, nftUridata: newNftUridata }
      })
      setUserNfts(parsedData)
    })()
  }, [Contracts, sellLists])

  const sellNft = async (e) => {
    e.preventDefault()
    setIsactive(false)
    const { NfttknAmt, uintprice } = e.target
    console.log(NfttknAmt, uintprice, userNfts, selldata)
    const UserNftidToken = userNfts.find((el) => el.nftid == selldata.nftid)
    if (uintprice.value <= 0) return alert("판매 가격을 확인해주세요")
    if (UserNftidToken.nftidToken < Number(NfttknAmt.value) || 0 >= Number(NfttknAmt.value))
      return alert("판매 토큰 량 확인해주세요")
    const _data = {
      userid: selldata.userid,
      smartAccAddress: userinfo.smartAcc,
      nftid: selldata.nftid,
      nftidTokenAmt: Number(NfttknAmt.value),
      price: Number(uintprice.value),
      nftUridata: selldata.nftUridata,
    }
    const { data: findOne } = await axios.get(`http://localhost:3001/sellnft/${selldata.userid}/${selldata.nftid}`)
    if (findOne.message) return alert("이미 판매중 아니템입니다 취소후 다시 시도해주세요")
    dispatch({ type: "Loading", payload: true })
    const { data } = await axios.post("http://localhost:3001/sellnft", _data)
    const { data: contractData } = await axios.post("http://localhost:3001/contractsellnft", _data)
    if (contractData.state === 201) alert("NFT 네트워크에 기록 되었습니다다")
    CheckZero()
    await queryClient.invalidateQueries({ queryKey: ["mypage"] })
    console.log(await queryClient.invalidateQueries({ queryKey: ["mypage"] }))
    dispatch({ type: "Loading", payload: false })
  }

  const LogoutHandler = () => {
    dispatch({ type: "logout" })
    console.log("zz")
  }

  const MypageCancelHandler = async ({ userid, sender, nftid, nftUridata, nftidToken }) => {
    const _data = { smartAccAddress: sender, nftid }
    const stringifyData = JSON.stringify(nftUridata)
    const updataData = { userid, nftid, nftUridata: stringifyData, nftidToken }
    console.log(_data)
    const confirmed = window.confirm("판매 취소 하시겠습니까?")
    if (!confirmed) return
    dispatch({ type: "Loading", payload: true })
    const { data } = await axios.delete("http://localhost:3001/sellnft", { data: _data })
    const { data: PatchData } = await axios.patch("http://localhost:3001/sellnft", updataData)
    const { data: ContractRes } = await axios.delete("http://localhost:3001/contractsellnft", { data: _data })
    if ((ContractRes.state = 200)) alert("네트워크에 기로 되었습니다")
    dispatch({ type: "Loading", payload: false })
    await queryClient.invalidateQueries({ queryKey: ["mypage"] })
  }

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <img src={loadingGif || "/placeholder.svg"} width="50px" alt="loading" />
          <span>로딩 중...</span>
        </LoadingContainer>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Logo>My NFT Collection</Logo>
        <Navigation>
          <NavLink to="/main">Main Page</NavLink>
          <NavLink to="/" onClick={LogoutHandler}>
            Logout
          </NavLink>
        </Navigation>
      </Header>

      {isactive && (
        <Modal>
          <ModalContent>
            <ModalTitle>NFT 판매하기</ModalTitle>
            <Form onSubmit={(e) => sellNft(e)}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  판매할 수량
                </label>
                <Input type="number" name="NfttknAmt" placeholder="판매 수량을 입력하세요" required />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#333" }}>
                  개당 판매 가격 (BTK)
                </label>
                <Input type="number" name="uintprice" placeholder="가격을 입력하세요" required />
              </div>
              <ButtonGroup>
                <CancelButton type="button" onClick={() => setIsactive(false)}>
                  취소
                </CancelButton>
                <Button type="submit">판매 등록</Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      <UserInfo>
        <SectionTitle>사용자 정보</SectionTitle>
        <InfoGrid>
          <InfoItem>
            <strong>아이디</strong>
            <span>{userId}</span>
          </InfoItem>
          <InfoItem>
            <strong>Public Key</strong>
            <span>{userinfo?.UserAddress}</span>
          </InfoItem>
          <InfoItem>
            <strong>Smart Account</strong>
            <span>{userinfo?.smartAcc}</span>
          </InfoItem>
          <InfoItem>
            <strong>잔액</strong>
            <span>{balance ? balance : 0} BTK</span>
          </InfoItem>
          <InfoItem>
            <strong>White List</strong>
            <span>{userinfo?.checkWhitelist === true ? "승인됨" : "대기중"}</span>
          </InfoItem>
        </InfoGrid>
      </UserInfo>

      <Section>
        <SectionTitle>내 NFT 컬렉션</SectionTitle>
        {userNfts && userNfts.length > 0 ? (
          <NFTGrid>
            {userNfts.map((el, i) => (
              <NFTCard key={i}>
                <NFTImage src={el.nftUridata.image} alt={el.nftUridata.name} />
                <NFTContent>
                  <NFTTitle>{el.nftUridata.name}</NFTTitle>
                  <NFTInfo>
                    <span>토큰 ID: {el.nftid}</span>
                    <span>보유 수량: {el.nftidToken}</span>
                  </NFTInfo>
                  <NFTDescription>{el.nftUridata.description}</NFTDescription>
                  {loading ? (
                    <LoadingContainer>
                      <img src={loadingGif || "/placeholder.svg"} width="30px" alt="loading" />
                    </LoadingContainer>
                  ) : (
                    <Button
                      className="sell"
                      onClick={() => {
                        setIsactive(true)
                        const stringifyNftUridata = JSON.stringify(el.nftUridata)
                        setSelldata((prev) => ({
                          ...prev,
                          userid: el.userid,
                          nftid: el.nftid,
                          nftUridata: stringifyNftUridata,
                        }))
                      }}
                    >
                      판매하기
                    </Button>
                  )}
                </NFTContent>
              </NFTCard>
            ))}
          </NFTGrid>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>보유한 NFT가 없습니다.</div>
        )}
      </Section>

      <Section>
        <SectionTitle>판매 중인 NFT</SectionTitle>
        {sellLists && sellLists.filter((el) => el.userid === userId).length > 0 ? (
          <NFTGrid>
            {sellLists.map((el, i) => {
              if (el.userid === userId) {
                return (
                  <NFTCard key={i}>
                    <NFTImage src={el.nftUridata.image} alt={el.nftUridata.name} />
                    <NFTContent>
                      <NFTTitle>{el.nftUridata.name}</NFTTitle>
                      <NFTInfo>
                        <span>토큰 ID: {el.nftid}</span>
                        <span>판매 수량: {el.nftidTokenAmt}</span>
                      </NFTInfo>
                      <NFTInfo>
                        <span>
                          <strong>가격: {el.price} BTK</strong>
                        </span>
                      </NFTInfo>
                      <NFTDescription>{el.nftUridata.description}</NFTDescription>
                      {loading ? (
                        <LoadingContainer>
                          <img src={loadingGif || "/placeholder.svg"} width="30px" alt="loading" />
                        </LoadingContainer>
                      ) : (
                        <Button
                          className="cancel"
                          onClick={() => {
                            MypageCancelHandler({
                              userid: el.userid,
                              sender: el.smartAccAddress,
                              nftid: el.nftid,
                              nftUridata: el.nftUridata,
                              nftidToken: el.nftidTokenAmt,
                            })
                          }}
                        >
                          판매 취소
                        </Button>
                      )}
                    </NFTContent>
                  </NFTCard>
                )
              }
              return null
            })}
          </NFTGrid>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>판매 중인 NFT가 없습니다.</div>
        )}
      </Section>
    </Container>
  )
}

export default Mypage
