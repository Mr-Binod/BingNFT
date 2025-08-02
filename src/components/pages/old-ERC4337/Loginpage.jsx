import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { CreateAcc, getUserInfo, getUsersInfo } from '../../../api/ERC4337/NewApi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import loadingGif from '../../../images';
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

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`

const MainCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 48px;
  width: 100%;
  max-width: 900px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 12px;
  }
`

const Title = styled.h1`
  color: #667eea;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 48px 0;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 28px;
    margin-bottom: 32px;
  }
`

const FormsContainer = styled.div`
  display: flex;
  gap: 48px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 32px;
  }
`

const FormSection = styled.div`
  flex: 1;
  animation: ${slideIn} 0.6s ease-out;
`

const FormTitle = styled.h2`
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 20px;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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
    color: rgba(255, 255, 255, 0.6);
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

const Button = styled.button`
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

const Divider = styled.div`
  width: 1px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  margin: 0 24px;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    margin: 24px 0;
  }
`

const StatusMessage = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  font-size: 14px;
  
  @media (max-width: 768px) {
    margin-top: 20px;
    padding: 12px;
    font-size: 13px;
  }
`

const Newpage = () => {

    const queryClient = useQueryClient();
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [render, setRender] = useState(0)

    const {loading} = useSelector((state) => state.LoginReducer)

    const signUpHandler = useMutation({
        mutationFn: async (e) => {
            e.preventDefault();
            
            const { signupid, signuppw } = e.target
            const data = {
                id: signupid.value,
                userpw : signuppw.value,
                email: 'bing34@gmail.com',
                salt: 'hii',
                domain: 'google'
            }
            dispatch({ type: 'Loading', payload: true })
            const response = await CreateAcc(data)
            console.log(response)
            if (response.state === 200) alert('가입 완료되었습니다')
            if (response.state === 201) alert('이미 사용되고 있는 아이디 입니다')
            
            signupid.value = "";
            signuppw.value = "";
            dispatch({ type: 'Loading', payload: false })
            navigate('/')
            setRender((prev) => prev + 1)
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["user"])
        }
    })

    const {isPending} = signUpHandler;

    const loginHandler = async (e) => {
        e.preventDefault();
        
        const { userid, userpw } = e.target;
        console.log('gg', userid.value, userpw.value)
        const data = await getUserInfo(userid.value, userpw.value)
        console.log(data, 'f')
        if(!data) return
        dispatch({ type: 'setUserId', payload: userid.value })  // ✅ Set in Redux
        dispatch({ type: 'login' })
        
        userid.value = "";
        navigate('/main')
    }

    console.log(loading)

    return (
        <Container>
            <MainCard>
                <Title>ZunoNFT Platform</Title>
                <FormsContainer>
                    <FormSection>
                        <FormTitle>로그인</FormTitle>
                        <Form onSubmit={(e) => loginHandler(e)}>
                            <Input type="text" name="userid" placeholder="아이디를 입력하세요" />
                            <Input type="password" name="userpw" placeholder="비밀번호를 입력하세요" />
                            {loading ? (
                                <Button disabled>
                                    <LoadingImage src={loadingGif} />
                                    로그인 중...
                                </Button>
                            ) : (
                                <Button type="submit">로그인</Button>
                            )}
                        </Form>
                    </FormSection>

                    <Divider />

                    <FormSection>
                        <FormTitle>회원가입</FormTitle>
                        <Form onSubmit={(e) => signUpHandler.mutate(e)}>
                            <Input type="text" name="signupid" placeholder="사용할 아이디를 입력하세요" />
                            <Input type="password" name="signuppw" placeholder="비밀번호 (4자 이상)" />
                            {loading ? (
                                <Button disabled>
                                    <LoadingImage src={loadingGif} />
                                    가입 중...
                                </Button>
                            ) : (
                                <Button type="submit">회원가입</Button>
                            )}
                        </Form>
                    </FormSection>
                </FormsContainer>

                {isPending && (
                    <StatusMessage>
                        처리 중입니다...
                    </StatusMessage>
                )}
            </MainCard>
        </Container>
    )
}

export default Newpage
