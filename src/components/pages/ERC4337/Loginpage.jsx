"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CreateAcc, getUserInfo } from "../../../api/ERC4337/NewApi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import loadingGif from "../../../images"
import styled, { keyframes } from "styled-components"

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  color: white;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  @media (max-width: 480px) {
    min-height: 100vh;
  }
`

const LeftPanel = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    min-height: 300px;
    flex: none;
  }
  
  @media (max-width: 480px) {
    min-height: 250px;
  }
`

const BrandLogo = styled.div`
  position: absolute;
  top: 40px;
  left: 40px;
  font-size: 28px;
  font-weight: 700;
  color: white;
  z-index: 10;
  
  @media (max-width: 768px) {
    top: 20px;
    left: 20px;
    font-size: 24px;
  }
`

const PlatformInfo = styled.div`
  position: absolute;
  bottom: 60px;
  left: 40px;
  right: 40px;
  z-index: 10;
  text-align: center;
  
  @media (max-width: 768px) {
    bottom: 40px;
    left: 20px;
    right: 20px;
  }
`

const PlatformTitle = styled.h2`
  color: white;
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 16px;
  }
`

const PlatformSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  font-weight: 400;
  margin: 0 0 30px 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 14px;
    gap: 10px;
  }
`

const FeatureIcon = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
  
  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
`

const StatsContainer = styled.div`
  display: flex;
  gap: 30px;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const StatItem = styled.div`
  text-align: center;
`

const StatNumber = styled.div`
  color: #667eea;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 11px;
  }
`

const ArtisticBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%);
`

const MedusaBust = styled.div`
  position: absolute;
  top: 120px;
  transform: translateX(-50%);
  width: 300px;
  height: 400px;
  animation: ${float} 6s ease-in-out infinite;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 200px;
    height: 250px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ec4899 100%);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    box-shadow: 
      0 0 50px rgba(102, 126, 234, 0.5),
      0 0 100px rgba(118, 75, 162, 0.3);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 180px;
    background: linear-gradient(135deg, #ec4899 0%, #764ba2 100%);
    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    box-shadow: 
      0 0 30px rgba(236, 72, 153, 0.5),
      0 0 60px rgba(118, 75, 162, 0.3);
  }
  
  @media (max-width: 768px) {
    top: 80px;
    width: 200px;
    height: 250px;
    
    &::before {
      width: 120px;
      height: 150px;
    }
    
    &::after {
      width: 80px;
      height: 100px;
    }
  }
`

const FloatingShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  
  &::before {
    content: '';
    position: absolute;
    top: 40px;
    right: 40px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    animation: ${float} 4s ease-in-out infinite;
    animation-delay: 1s;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 80px;
    left: 40px;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #ec4899 0%, #764ba2 100%);
    border-radius: 50%;
    animation: ${float} 5s ease-in-out infinite;
    animation-delay: 2s;
  }
  
  @media (max-width: 768px) {
    height: 150px;
    
    &::before {
      top: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
    }
    
    &::after {
      top: 50px;
      left: 20px;
      width: 30px;
      height: 30px;
    }
  }
`

const RightPanel = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 40px;
  
  @media (max-width: 768px) {
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding: 40px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 30px 16px;
  }
`

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 480px) {
    max-width: 100%;
  }
`

const FormTitle = styled.h1`
  color: white;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 40px 0;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 24px;
    margin-bottom: 24px;
  }
`

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0;
  
  &::before {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
  
  span {
    padding: 0 20px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }
`

const GoogleButton = styled.button`
  width: 100%;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 14px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
`

const Input = styled.input`
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 16px;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 14px;
  }
`

const OptionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
`

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #667eea;
`

const CheckboxLabel = styled.label`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
`

const ForgotPassword = styled.a`
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #667eea;
  }
`

const Button = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-sizing: border-box;
  position: relative;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 14px;
  }
`

const LoadingImage = styled.img`
  position: absolute;
  left: 20px;
  width: 20px;
  height: 20px;
  box-sizing: border-box;
`

const SignupButtonWrapper = styled.div`
  margin-top: 30px;
`

const SignupLink = styled.div`
  text-align: center;
  margin-top: 30px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  
  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    margin-left: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

const StatusMessage = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-size: 14px;
  
  @media (max-width: 768px) {
    margin-top: 16px;
    padding: 12px;
    font-size: 13px;
  }
`

const Newpage = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [showSignup, setShowSignup] = useState(false)

  const { loading } = useSelector((state) => state.LoginReducer)

  const signUpHandler = useMutation({
    mutationFn: async (e) => {
      e.preventDefault()

      const { signupid, signuppw } = e.target
      const data = {
        id: signupid.value,
        userpw: signuppw.value,
        email: "bing34@gmail.com",
        salt: "hii",
        domain: "google",
      }
      dispatch({ type: "Loading", payload: true })
      const response = await CreateAcc(data)
      // console.log(response)
      if (response.state === 200) {
        alert("가입 완료되었습니다")
        // Switch to login mode after successful signup
        setShowSignup(false)
      }
      if (response.state === 201) alert("이미 사용되고 있는 아이디 입니다")

      signupid.value = ""
      signuppw.value = ""
      dispatch({ type: "Loading", payload: false })
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user"])
    },
  })

  const { isPending } = signUpHandler

  const loginHandler = async (e) => {
    e.preventDefault()

    const { userid, userpw } = e.target
    // console.log("gg", userid.value, userpw.value)
    const data = await getUserInfo(userid.value, userpw.value)
    // console.log(data, "f")
    if (!data) return
    dispatch({ type: "setUserId", payload: userid.value }) // ✅ Set in Redux
    dispatch({ type: "login" })

    userid.value = ""
    navigate("/main")
  }

  // console.log(loading)

  return (
    <Container>
      <LeftPanel>
        <BrandLogo>ZunoNFT</BrandLogo>
        <ArtisticBackground />
        <MedusaBust />
        <FloatingShapes />
        <PlatformInfo>
          <PlatformTitle>ZunoNFT에 오신 것을 환영합니다</PlatformTitle>
          <PlatformSubtitle>
            ERC-4337 계정 추상화를 기반으로 구축된 차세대 NFT 마켓플레이스입니다. 
            향상된 보안과 사용자 경험으로 고유한 디지털 자산을 생성, 거래하고 수집하세요.
          </PlatformSubtitle>
          <FeaturesList>
            <FeatureItem>
              <FeatureIcon>🔒</FeatureIcon>
              <span>계정 추상화 보안</span>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>⚡</FeatureIcon>
              <span>가스비 없는 거래</span>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>🎨</FeatureIcon>
              <span>고유한 디지털 아트워크</span>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>💎</FeatureIcon>
              <span>희귀한 NFT 컬렉션</span>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>🌐</FeatureIcon>
              <span>크로스체인 호환성</span>
            </FeatureItem>
          </FeaturesList>
          <StatsContainer>
            <StatItem>
              <StatNumber>10K+</StatNumber>
              <StatLabel>생성된 NFT</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>5K+</StatNumber>
              <StatLabel>활성 사용자</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>100+</StatNumber>
              <StatLabel>컬렉션</StatLabel>
            </StatItem>
          </StatsContainer>
        </PlatformInfo>
      </LeftPanel>
      
      <RightPanel>
        <FormContainer>
          <FormTitle>{showSignup ? "회원가입" : "로그인"}</FormTitle>
          
          {/* <GoogleButton type="button">
            <span>G</span>
            Sign in with Google
          </GoogleButton> */}
          
          <Divider>
            <span>또는</span>
          </Divider>
          
          {showSignup ? (
            <Form onSubmit={(e) => signUpHandler.mutate(e)}>
              <InputGroup>
                <Label>사용자명</Label>
                <Input type="text" name="signupid" placeholder="사용자명을 입력하세요" />
              </InputGroup>
              <InputGroup>
                <Label>비밀번호</Label>
                <Input type="password" name="signuppw" placeholder="최소 4자 이상의 문자나 숫자" />
              </InputGroup>
              {loading ? (
                <SignupButtonWrapper>
                  <Button disabled>
                    <LoadingImage src={loadingGif} />
                    계정 생성 중...
                  </Button>
                </SignupButtonWrapper>
              ) : (
                <SignupButtonWrapper>
                  <Button type="submit">회원가입</Button>
                </SignupButtonWrapper>
              )}
            </Form>
          ) : (
            <Form onSubmit={(e) => loginHandler(e)}>
              <InputGroup>
                <Label>사용자명</Label>
                <Input type="text" name="userid" placeholder="사용자명을 입력하세요" />
              </InputGroup>
              <InputGroup>
                <Label>비밀번호</Label>
                <Input type="password" name="userpw" placeholder="비밀번호를 입력하세요" />
              </InputGroup>
              <OptionsRow>
                <CheckboxGroup>
                  <Checkbox type="checkbox" id="remember" />
                  <CheckboxLabel htmlFor="remember">로그인 상태 유지</CheckboxLabel>
                </CheckboxGroup>
                <ForgotPassword href="#">비밀번호를 잊으셨나요?</ForgotPassword>
              </OptionsRow>
              {loading ? (
                                  <Button disabled>
                    <LoadingImage src={loadingGif} />
                    로그인 중...
                  </Button>
              ) : (
                                  <Button type="submit">로그인</Button>
              )}
            </Form>
          )}
          
          <SignupLink>
            {showSignup ? "이미 계정이 있으신가요?" : "계정이 없으신가요?"}
            <a href="#" onClick={(e) => { e.preventDefault(); setShowSignup(!showSignup); }}>
              {showSignup ? "로그인" : "회원가입"}
            </a>
          </SignupLink>

          {isPending && (
            <StatusMessage>
              처리 중...
            </StatusMessage>
          )}
        </FormContainer>
      </RightPanel>
    </Container>
  )
}

export default Newpage
