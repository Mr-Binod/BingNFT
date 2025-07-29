"use client"

import axios from "axios"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components"
import loadingGif from "../../../images"
import { Link, useNavigate } from "react-router-dom"
import { CheckZero, getUserInfoCreate } from "../../../api/ERC4337/NewApi"
import { useQuery, useQueryClient } from "@tanstack/react-query"

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* margin-bottom: 5px; */
  font-size: 16px;
  color: #6b7280;
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

const NFTPrice = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #374151;
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
  justify-content: center;
  gap: 8px;
  width: 100%;

  &:hover {
    background: #1f2937;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  &.cancel {
    background: #dc2626;
    
    &:hover {
      background: #b91c1c;
    }
  }
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const LoadingImage = styled.img`
  width: 16px;
  height: 16px;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const BaseUrl = process.env.REACT_APP_API_BASE_URL

  const { data, isLoading } = useQuery({
    queryKey: ["mypage"],
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
      ; (async () => {
        const balance = await TokenContract.balanceOf(userinfo.smartAcc)
        const newBalance = Math.floor(Number(ethers.formatEther(balance)))
        setBalance(newBalance)
        const { data } = await axios.get(`${BaseUrl}/user/${userId}`)
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
    // return
    const _data = {
      userid: selldata.userid,
      smartAccAddress: userinfo.smartAcc,
      nftid: selldata.nftid,
      nftidTokenAmt: Number(NfttknAmt.value),
      price: Number(uintprice.value),
      nftUridata: selldata.nftUridata,
    }
    const { data: findOne } = await axios.get(`${BaseUrl}/sellnft/${selldata.userid}/${selldata.nftid}`)
    if (findOne.message) return alert("이미 판매중 아니템입니다 취소후 다시 시도해주세요")
    dispatch({ type: "Loading", payload: true })
    const { data } = await axios.post(`${BaseUrl}/sellnft`, _data)
    // if (data) alert('NFT 판매 등록 완료되었습니다')
    const { data: contractData } = await axios.post(`${BaseUrl}/contractsellnft`, _data)
    if (contractData.state === 201) alert("NFT 네트워크에 기록 되었습니다다")
    CheckZero()
    await queryClient.invalidateQueries({ queryKey: ["mypage"] })
    console.log(await queryClient.invalidateQueries({ queryKey: ["mypage"] }))
    dispatch({ type: "Loading", payload: false })
  }
  // console.log(queryClient.invalidateQueries())

  const LogoutHandler = () => {
    dispatch({ type: "logout" }) // This will clear userId and user too
    console.log("zz")
    navigate('/')
  }

  const MypageCancelHandler = async ({ userid, sender, nftid, nftUridata, nftidToken }) => {
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
    await queryClient.invalidateQueries({ queryKey: ["mypage"] })
  }
  console.log(sellLists, userId)

  if (!userinfo) {
    return <div>Loading...</div>
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>BingNFT Platform</Logo>
          <Navigation>
            <NavLink to="/main">메인페이지</NavLink>
            <LogoutButton onClick={LogoutHandler}>로그아웃</LogoutButton>
          </Navigation>
        </HeaderContent>
      </Header>

      <Content>
        {isactive && (
          <Modal onClick={(e) => e.target === e.currentTarget && setIsactive(false)}>
            <ModalContent>
              <ModalTitle>NFT 판매</ModalTitle>
              <Form onSubmit={(e) => sellNft(e)}>
                <Input type="number" name="NfttknAmt" placeholder="판매할 수량을 입력하세요" />
                <Input type="number" name="uintprice" placeholder="개당 판매 가격 (BTK)" />
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

        <Card>
          <SectionTitle>사용자 정보</SectionTitle>
          <UserInfoGrid>
            <InfoItem>
              <InfoLabel>아이디</InfoLabel>
              <InfoValue>{userId}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Public Key</InfoLabel>
              <InfoValue>{userinfo.UserAddress}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Smart Account</InfoLabel>
              <InfoValue>{userinfo.smartAcc}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>잔액</InfoLabel>
              <InfoValue>{balance ? balance : 0} BTK</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>화이트리스트</InfoLabel>
              <InfoValue>{userinfo.checkWhitelist === true ? "true" : "false"}</InfoValue>
            </InfoItem>
          </UserInfoGrid>
        </Card>

        <Card>
          <SectionTitle>내 NFT 컬렉션</SectionTitle>
          {!userNfts || userNfts.length === 0 ? (
            <EmptyState>
              <EmptyIcon>🖼️</EmptyIcon>
              <h3>보유한 NFT가 없습니다</h3>
              <p>메인페이지에서 NFT를 생성하거나 구매해보세요</p>
            </EmptyState>
          ) : (
            <NFTGrid>
              {userNfts?.map((el, i) => {
                return (
                  <NFTCard key={i}>
                    <NFTImage src={el.nftUridata.image} alt={el.nftUridata.name} />
                    <NFTContent>
                      <NFTTitle><span>이름 : {el.nftUridata.name}</span></NFTTitle>
                      <NFTInfo>
                        <span>토큰 ID: {el.nftid}</span>
                        <span>보유량: {el.nftidToken}</span>
                      </NFTInfo>
                      <NFTDescription>{el.nftUridata.description}</NFTDescription>
                      {loading ? (
                        <Button disabled>
                          <LoadingImage src={loadingGif} />
                          처리 중...
                        </Button>
                      ) : (
                        <Button
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
                )
              })}
            </NFTGrid>
          )}
        </Card>

        <Card>
          <SectionTitle>판매 중인 NFT</SectionTitle>
          {!sellLists || sellLists.filter((el) => el.userid === userId).length === 0 ? (
            <EmptyState>
              <EmptyIcon>🏪</EmptyIcon>
              <h3>판매 중인 NFT가 없습니다</h3>
              <p>보유한 NFT를 판매해보세요</p>
            </EmptyState>
          ) : (
            <NFTGrid>
              {sellLists.map((el, i) => {
                if (el.userid === userId) {
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
                          <span>판매량: {el.nftidTokenAmt}</span>
                        </NFTInfo>
                        <NFTDescription>{el.nftUridata.description}</NFTDescription>
                        {loading ? (
                          <Button disabled>
                            <LoadingImage src={loadingGif} />
                            처리 중...
                          </Button>
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
                              return
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
          )}
        </Card>
      </Content>
    </Container>
  )
}

export default Mypage
