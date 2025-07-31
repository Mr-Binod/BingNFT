"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { CreateAcc, getUserInfo } from "../../../api/ERC4337/NewApi"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import loadingGif from "../../../images"
import styled from "styled-components"

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 20px;
`

const MainCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`

const Title = styled.h1`
  color: #333333;
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin: 0 0 40px 0;
`

const FormsContainer = styled.div`
  display: flex;
  gap: 40px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`

const FormSection = styled.div`
  flex: 1;
`

const FormTitle = styled.h2`
  color: #333333;
  font-size: 20px;
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
  box-sizing: border-box;
  position: relative;

  &:hover {
    background: #1f2937;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`

const LoadingImage = styled.img`
position: absolute;
left: 60px;
  width: 50px;
  height: 50px;
  box-sizing: border-box;
`

const Divider = styled.div`
  width: 1px;
  background: #e5e5e5;
  margin: 0 20px;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 1px;
    margin: 20px 0;
  }
`

const Newpage = () => {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const navigate = useNavigate()

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
      if (response.state === 200) alert("가입 완료되었습니다")
      if (response.state === 201) alert("이미 사용되고 있는 아이디 입니다")

      signupid.value = ""
      signuppw.value = ""
      dispatch({ type: "Loading", payload: false })
      navigate("/")
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
      <MainCard>
        <Title>BingNFT Platform</Title>
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
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "8px",
              color: "#666",
              textAlign: "center",
            }}
          >
            처리 중입니다...
          </div>
        )}
      </MainCard>
    </Container>
  )
}

export default Newpage
