"use client"

import axios from "axios"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import styled, { keyframes } from "styled-components"
import loadingGif from "../../../images"
import { Link, useNavigate } from "react-router-dom"
import { CheckZero, getUserInfoOne } from "../../../api/ERC4337/NewApi"
import { useQuery, useQueryClient } from "@tanstack/react-query"

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  color: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Sidebar = styled.div`
  height: 100vh;
  width: 280px;
  position: fixed;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    position: relative;
    padding: 16px;
    gap: 16px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 40px;
  text-align: center;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
    font-size: 20px;
  }
`

const NavMenu = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
`

const NavItem = styled.div`
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    transform: translateX(4px);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    min-width: 120px;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
    min-width: 100px;
  }
`

const LogoutButton = styled.button`
  margin-top: auto;
  padding: 16px 20px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
  }
`

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  
  @media (max-width: 768px) {
    display: block;
  }
`

const MobileOverlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  
  @media (max-width: 768px) {
    display: ${props => props.showMobileMenu ? 'block' : 'none'};
  }
`

const MobileSidebar = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px 24px;
  z-index: 1001;
  animation: slideIn 0.3s ease-out;
  
  @media (max-width: 768px) {
    display: ${props => props.showMobileMenu ? 'flex' : 'none'};
    flex-direction: column;
    gap: 32px;
  }
`

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`

const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 32px 138px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
  }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`

const HeaderCenter = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  width: 300px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  input {
    background: none;
    border: none;
    color: white;
    outline: none;
    width: 100%;
    font-size: 14px;

    &::placeholder {
      color: #a0aec0;
    }
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

const Balance = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    display: none;
  }
`

const MobileBalance = styled.div`
  display: none;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 12px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  
  @media (max-width: 768px) {
    display: flex;
  }
`

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
  }
`

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`

const Content = styled.div`
  color: white;
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const PageSubtitle = styled.p`
  font-size: 16px;
  color: #a0aec0;
  margin: 0 0 32px 0;
  line-height: 1.6;
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`

const SectionTitle = styled.h2`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
`

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`

const InfoItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`

const InfoLabel = styled.div`
  color: #a0aec0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`

const InfoValue = styled.div`
  color: white;
  font-size: 16px;
  font-weight: 600;
  word-break: break-all;
`

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`

const NFTCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
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
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
`

const NFTInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #a0aec0;
  font-size: 14px;
  margin-bottom: 12px;
`

const NFTDescription = styled.p`
  color: #a0aec0;
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
`

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &.sell {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
  }

  &.cancel {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #a0aec0;
`

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
`

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  backdrop-filter: blur(20px);
`

const ModalTitle = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  text-align: center;
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Input = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: white;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    border-color: #667eea;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`

const Button = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const CancelButton = styled(Button)`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`

const LoadingImage = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`

const Mypage = () => {
  const [balance, setBalance] = useState(0)
  const [userNfts, setUserNfts] = useState(null)
  const [isactive, setIsactive] = useState(false)
  const [selldata, setSelldata] = useState({ userid: "", nftid: null, nftUridata: "" })
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
      const data = await getUserInfoOne(userId)
      const { data: sellnft } = await axios.get(`${BaseUrl}/sellnft`)
      const parsedSellnft = sellnft.message.map((el) => {
        const parsed = JSON.parse(el.nftUridata)
        el.nftUridata = parsed
        return el
      })
      dispatch({ type: "nftDatas", payload: parsedSellnft })
      return data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: true,
    retry: 3,
  })

  useEffect(() => {
    const { TokenContract } = Contracts;
    (async () => {
      // Check if smart account address is valid before making contract calls
      if (Contracts && userinfo?.smartAcc && userinfo.smartAcc !== "0x" && userinfo.smartAcc.length >= 42) {
        try {
          const balance = await TokenContract?.balanceOf(userinfo.smartAcc)
          
          const newBalance = Math.floor(Number(ethers.formatEther(balance)))
          setBalance(newBalance)
          const { data } = await axios.get(`${BaseUrl}/user/${userId}`)
          const parsedData = data.message.map((el, i) => {
            const newNftUridata = JSON.parse(el.nftUridata)
            return { ...el, nftUridata: newNftUridata }
          })
          setUserNfts(parsedData)
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set default values on error
          setBalance(0);
          setUserNfts([]);
        }
      } else {
        console.log('Invalid smart account address or contracts not ready:', userinfo?.smartAcc);
        // Set default values when address is invalid
        setBalance(0);
        setUserNfts([]);
      }
    })()
  }, [Contracts, sellLists, userinfo])

  const sellNft = async (e) => {
    e.preventDefault()
    setIsactive(false)
    const { NfttknAmt, uintprice } = e.target
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
    dispatch({ type: "Loading", payload: false })
  }

  const LogoutHandler = () => {
    dispatch({ type: "logout" }) // This will clear userId and user too
    navigate('/')
  }

  const MypageCancelHandler = async ({ userid, sender, nftid, nftUridata, nftidToken }) => {
    const _data = { smartAccAddress: sender, nftid }
    const stringifyData = JSON.stringify(nftUridata)
    const updataData = { userid, nftid, nftUridata: stringifyData, nftidToken }
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

  if (!userinfo) {
    return <div>Loading...</div>
  }

  return (
    <Container>
      <Sidebar>
        <Logo>ZunoNFT</Logo>
        <NavMenu>
          <NavItem onClick={() => navigate('/main')}>
            📊 대시보드
          </NavItem>
          <NavItem onClick={() => navigate('/main#marketplace')}>
            🛍️ 마켓플레이스
          </NavItem>
          <NavItem onClick={() => navigate('/mypage')} style={{ background: 'rgba(102, 126, 234, 0.2)' }}>
            💼 포트폴리오
          </NavItem>
          <NavItem onClick={() => navigate('/history')}>
            📄 거래 내역
          </NavItem>
          <NavItem onClick={() => navigate('/settings')}>
            ⚙️ 설정
          </NavItem>
        </NavMenu>
        <LogoutButton onClick={LogoutHandler}>
          🚪 로그아웃
        </LogoutButton>
      </Sidebar>

      {/* Mobile Overlay and Sidebar */}
      <MobileOverlay showMobileMenu={showMobileMenu} onClick={() => setShowMobileMenu(false)} />
      <MobileSidebar showMobileMenu={showMobileMenu}>
        <Logo>ZunoNFT</Logo>
        <NavMenu>
          <NavItem onClick={() => navigate('/main')}>
            📊 대시보드
          </NavItem>
          <NavItem onClick={() => navigate('/main#marketplace')}>
            🛍️ 마켓플레이스
          </NavItem>
          <NavItem onClick={() => navigate('/mypage')} style={{ background: 'rgba(102, 126, 234, 0.2)' }}>
            💼 포트폴리오
          </NavItem>
          <NavItem onClick={() => navigate('/history')}>
            📄 거래 내역
          </NavItem>
          <NavItem onClick={() => navigate('/settings')}>
            ⚙️ 설정
          </NavItem>
        </NavMenu>
        <LogoutButton onClick={LogoutHandler}>
          🚪 로그아웃
        </LogoutButton>
      </MobileSidebar>

      <MainContent>
        <Header>
          <HeaderLeft>
            <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
              ☰
            </MobileMenuButton>
          </HeaderLeft>
          <HeaderCenter>
            <SearchBar>
              <input type="text" placeholder="포트폴리오 검색..." />
            </SearchBar>
            <MobileBalance>
              💰 {balance ? balance : 0}
            </MobileBalance>
          </HeaderCenter>
          <HeaderRight>
            <Balance>
              💰 {balance ? balance : 0} BTK
            </Balance>
            <UserProfile onClick={() => navigate('/mypage')}>
              <Avatar>{userId?.charAt(0)?.toUpperCase() || 'U'}</Avatar>
              <span>{userId || '사용자'}</span>
            </UserProfile>
          </HeaderRight>
        </Header>

        <Content>
          <PageTitle>포트폴리오</PageTitle>
          <PageSubtitle>
            NFT를 관리하고, 컬렉션을 확인하며, 거래 활동을 추적하세요
          </PageSubtitle>

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
                    <Button type="submit" className="primary">판매 등록</Button>
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
                <InfoValue>{userinfo?.smartAcc}</InfoValue>
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
                          <ActionButton disabled>
                            <LoadingImage src={loadingGif} />
                            처리 중...
                          </ActionButton>
                        ) : (
                          <ActionButton
                            className="sell"
                            onClick={() => {
                              setSelldata((prev) => ({
                                ...prev,
                                userid: el.userid,
                                nftid: el.nftid,
                                nftUridata: JSON.stringify(el.nftUridata),
                              }))
                              setIsactive(true)
                            }}
                          >
                            판매하기
                          </ActionButton>
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
                            <span>가격 : {el.price} BTK</span>
                            <span>판매량: {el.nftidTokenAmt}</span>
                          </NFTInfo>
                          <NFTDescription>{el.nftUridata.description}</NFTDescription>
                          {loading ? (
                            <Button disabled>
                              <LoadingImage src={loadingGif} />
                              처리 중...
                            </Button>
                          ) : (
                            <ActionButton
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
                            </ActionButton>
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
      </MainContent>
    </Container>
  )
}

export default Mypage
