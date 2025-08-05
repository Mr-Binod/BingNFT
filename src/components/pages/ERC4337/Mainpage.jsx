"use client"

import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useLocation, useNavigate } from "react-router-dom"
import styled, { keyframes } from "styled-components"
import loadingGif, { github } from "../../../images"
import useNewEthers from "../../../hooks/useNewEthers"
import { CreateNft, getUserInfoOne } from "../../../api/ERC4337/NewApi"
import { sendEntryPoint } from "../../../api/ERC4337/SendUserOps"
import { uploadIPFS } from "../../../api/ERC4337/Ipfs"
import axios from "axios"
import { ethers } from "ethers"

// Rate limiting utility
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Retry function with exponential backoff
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        const delayMs = baseDelay * Math.pow(2, i)
        await delay(delayMs)
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

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



const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50% , #16213e 100%);
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
    display: none;
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
    flex: 1;
  display: flex;
  flex-direction: column;
  
  gap: 8px;
  }
  @media (max-width: 480px) {
    flex: 1;
  display: flex;
  flex-direction: column;
  
  gap: 8px;
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
  background: ${props => props.className === 'active' ? 'rgba(102, 126, 234, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.className === 'active' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.className === 'active' ? 'white' : '#a0aec0'};

  &:hover {
    background: ${props => props.className === 'active' ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
    transform: translateX(4px);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    min-width: 120px;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    padding: 0px 12px;
    height: 40px;
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
  
  @media (max-width: 768px) {
    margin-top: auto;
    margin-bottom: 20px;
    padding: 12px 16px;
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding: 10px 14px;
    font-size: 12px;
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
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    display: block;
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

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease-out, visibility 0.3s ease-out;
  
  @media (max-width: 768px) {
    opacity: ${props => props.showMobileMenu ? 1 : 0};
    visibility: ${props => props.showMobileMenu ? 'visible' : 'hidden'};
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`

const MobileSidebar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: rgba(26, 32, 44, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px 24px;
  z-index: 1001;
  transform: translateX(-100%);
  transition: transform 0.3s ease-out;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    top: 65px;
    height: calc(100vh - 80px);
    gap: 32px;
    width: 50%;
    padding: 24px;
    transform: ${props => props.showMobileMenu ? 'translateX(0)' : 'translateX(-100%)'};
  }
  
  @media (min-width: 769px) {
    display: none;
  }
  @media (max-width: 480px) {
    top: 65px;
    height: calc(100vh - 80px);
    padding: 16px;
    gap: 16px;
    border-radius: 0 15px 15px 0;
    box-sizing: border-box;
    transform: ${props => props.showMobileMenu ? 'translateX(0)' : 'translateX(-100%)'};
    animation: ${props => props.showMobileMenu ? slideIn : slideOut} 0.3s ease-out;
  }
`



const MainContent = styled.div`
  flex: 1;
  margin-left: 280px;
  padding: 32px 138px;
  padding-top: 140px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 16px;
    padding-top: 140px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
    padding-top: 140px;
  }
`

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 138px;
  margin-bottom: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 280px;
  right: 0;
  background: linear-gradient(135deg, #0a0a0aeb 0%, #1a1a2e 70%, #16213e 100%);
  backdrop-filter: blur(20px);
  z-index: 100;
  
  @media (max-width: 768px) {
    gap: 12px;
    padding: 16px;
    left: 0;
    right: 0;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    padding: 12px 16px;
  }
`

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

const HeaderBottom = styled.div`
  display: none;
  align-items: center;
  justify-content: center;
  width: 100%;
  
  @media (max-width: 768px) {
    display: flex;
  }
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 200px;
`

const DesktopLogo = styled.div`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const HeaderCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 500px;
  
  @media (max-width: 768px) {
    display: none;
  }
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  /* min-width: 200px; */
  justify-content: flex-end;
  /* padding-right: 16px; */
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
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
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    
    input {
      font-size: 13px;
    }
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
    font-size: 14px;
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
  font-weight: 600;
  font-size: 14px;
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
`

const Content = styled.div`
  max-width: 1350px;
  margin: 0 auto;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0;
  }
  @media (max-width: 480px) {
    margin-top : 35px;
  }
`

const WelcomeSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
  animation: ${fadeInUp} 0.8s ease-out;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`

const WelcomeTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`

const WelcomeSubtitle = styled.p`
  color: #a0aec0;
  font-size: 18px;
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  margin-bottom: 40px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 768px) {
    gap: 20px;
    margin-bottom: 24px;
  }
`

const Card = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.8s ease-out;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 16px;
  }
`

const SectionTitle = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.3);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 1px;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin: 0 0 16px 0;
  }
`

const UserInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const InfoItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`

const InfoLabel = styled.div`
  font-size: 12px;
  color: #a0aec0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`

const InfoValue = styled.div`
  font-size: 16px;
  color: white;
  font-weight: 600;
  word-break: break-all;
  font-family: 'Fira Code', monospace;
`

const ActionButtons = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`

const Button = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  flex: 1;
  max-width: 200px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:hover::before {
    left: 100%;
  }

  &:disabled {
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 15px rgba(74, 85, 104, 0.3);
  }

  &.secondary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    
    &:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 12px;
    max-width: none;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 500px;
`

const Input = styled.input`
  padding: 16px 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`

const TextArea = styled.textarea`
  padding: 16px 20px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  font-size: 16px;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  backdrop-filter: blur(10px);

  &::placeholder {
    color: #a0aec0;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 100px;
  }
`

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const NFTCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-sizing: border-box;
  padding: 20px 0px;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 16px 0px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 0px;
  }
`

const NFTImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
  
  @media (max-width: 768px) {
    height: 200px;
  }
  
  @media (max-width: 480px) {
    height: 180px;
  }
`

const NFTContent = styled.div`
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`

const NFTTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
`

const NFTInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #a0aec0;
  font-size: 14px;
`

const NFTPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  /* margin-bottom: 12px; */
`

const NFTDescription = styled.p`
  color: #a0aec0;
  font-size: 14px;
  line-height: 1.5;
  /* margin: 0 0 16px 0; */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const NFTSeller = styled.div`
  font-size: 12px;
  color: #718096;
  margin-bottom: 16px;
  font-weight: 500;
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

  &.cancel {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
    }
  }

  &.buy {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const LoadingImage = styled.img`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  animation: spin 1s linear infinite;
`

const spin = keyframes`
  from {
    transform: translateX(-50%) rotate(0deg);
  }
  to {
    transform: translateX(-50%) rotate(360deg);
  }
`

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeInUp} 0.3s ease-out;
`

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.5s ease-out;
  
  @media (max-width: 768px) {
    padding: 24px;
    width: 95%;
  }
`

const ModalTitle = styled.h3`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 24px 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const CancelButton = styled(Button)`
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);

  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
  }
`

// New styled components for the mintplicity-like layout
const FeaturedSection = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`

const FeaturedNFT = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 20px;
  }
`

const FeaturedImage = styled.div`
  img {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    
    @media (max-width: 768px) {
      height: 250px;
    }
  }
`

const FeaturedDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`

const Timer = styled.div`
  color: #f59e0b;
  font-size: 18px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const CollectionTitle = styled.h2`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`

const CollectionDescription = styled.p`
  color: #a0aec0;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`

const CreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const CreatorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
`

const CreatorName = styled.span`
  color: white;
  font-weight: 600;
`

const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`

const SocialButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`

const StatsSection = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`

const StatLabel = styled.div`
  color: #a0aec0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`

const StatValue = styled.div`
  color: white;
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`

const StatChange = styled.div`
  color: #10b981;
  font-size: 12px;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 10px;
  }
`

const NFTGridSection = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`

const SectionHeader = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
    margin-top: 12px;
  }
`

const FilterButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  outline: none;

  &::placeholder {
    color: #a0aec0;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`

const SortSelect = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  cursor: pointer;

  option {
    background: #1a1a2e;
    color: white;
  }
  
  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`

const QuickActionsSection = styled.div`
  margin: 20px 0;
  width: 100%;
  
  @media (max-width: 768px) {
    margin: 16px 0;
  }
`

// Sidebar Quick Actions styled components
const SidebarQuickActions = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 768px) {
    margin: 16px 0;
    padding: 16px;
  }
`

const SidebarSectionTitle = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`

const SidebarActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SidebarButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:hover::before {
    left: 100%;
  }

  &:disabled {
    background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 15px rgba(74, 85, 104, 0.3);
  }

  &.secondary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    
    &:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
    }
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 12px;
  }
`

/* global BigInt */

const Mainpage = () => {
  const [userInfo, setUserInfo] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [sellnfts, setSellnfts] = useState(null)
  const [count, setCount] = useState(0)
  const [showBtn, setShowBtn] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [cancelData, setCancelData] = useState({
    userid: "",
    sender: "",
    nftid: null,
    nftUridata: "",
    nftidToken: null,
  })
  const [showNftModal, setShowNftModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

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
      const data = await getUserInfoOne(userId)
      const { data: sellnft } = await axios.get(`${BaseUrl}/sellnft`)
      const parsedSellnft = sellnft.message.map((el) => {
        const parsed = JSON.parse(el.nftUridata)
        el.nftUridata = parsed
        return el
      })

      setUserInfo(data.message)
      dispatch({ type: "setUser", payload: data.message })
      dispatch({ type: "nftDatas", payload: parsedSellnft })
      setSellnfts(parsedSellnft)
      Contracts.PaymasterContract?.on('WhiteListAdd', async (address) => {
        const data = await getUserInfoOne(userId)
        setUserInfo(data.message)
        dispatch({ type: "setUser", payload: data.message })
  
        return data
      })
      return data
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: true,
    retry: 3,
  })

  // Call the hook directly in the component
  const result = useNewEthers(userInfo?.privateKey, userInfo?.smartAcc)

  // Update contracts when result changes
  useEffect(() => {
    if (result) {
      dispatch({ type: 'Contracts', payload: result })
    }
  }, [result, dispatch])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  const createNftMutn = useMutation({
    mutationFn: async (e) => {
      e.preventDefault()
      const { NftContract } = Contracts
      const { smartAcc } = userInfo
      const formdata = new FormData()
      const { nftname, nftdesc } = e.target
      const File = e.target.file.files[0]
      dispatch({ type: "Loading", payload: true })


      if (!nftname.value.trim() || !nftdesc.value.trim() || !File) {
        dispatch({ type: "Loading", payload: false })
        return alert("모든 필드를 채워주세요.");
      }
      const nftName = nftname.value
      const nftDesc = nftdesc.value

      formdata.append("file", File)


      const IpfsUri = await uploadIPFS({ formdata, nftName, nftDesc })
      const data = await CreateNft(IpfsUri, smartAcc)


      const filter = await NftContract.filters.TokenURICreated() // create a filter
      const events = await NftContract.queryFilter(filter, 0, "latest") // from block 0 to latest
      const latestEvent = await NftContract.queryFilter(filter, "latest", "latest") // from block 0 to latest

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

        if (sender !== userInfo.smartAcc) return alert("ff")
        const nftidToken = Number(await NftContract.balanceOf(sender, tokenId))
        try {
          const uridata = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri}`)
          const imgpath = uridata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
          uridata.data.image = imgpath
          const newtokenId = Number(tokenId)
          const JsonData = JSON.stringify(uridata.data)
          const _data = { userid: userId, nftid: newtokenId, nftidToken, nftUridata: JsonData }

          const data = await axios.post(`${BaseUrl}/createusernft`, _data)

        } catch (error) {
          alert("NFT 추가 오류" + error)
        }
      }
      alert("nft 추가 완료")
      dispatch({ type: "Loading", payload: false })

      // navigate('/mypage')
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
    try {
      if (!Contracts || !userInfo?.smartAcc) return;
      dispatch({ type: "Loading", payload: true })
      const { TokenContract, SmartAccountContract, EntryPointContract, signer } = Contracts
      const { smartAcc } = userInfo

      const mintCallData = TokenContract.interface.encodeFunctionData("mint", [smartAcc, amount])
      const callData = SmartAccountContract.interface.encodeFunctionData("execute", [
        process.env.REACT_APP_BING_TKN_CA,
        value,
        mintCallData,
      ])

      // Add delay to prevent rate limiting
      await delay(2000)

      const response = await retryWithBackoff(async () => {
        return await sendEntryPoint(smartAcc, EntryPointContract, callData, signer)
      })

      await TokenContract.on('minted', async (address, amount) => {
        try {
          // Add delay before balance check
          await delay(1000)
          const balance = await retryWithBackoff(async () => {
            return await TokenContract.balanceOf(smartAcc)
          })
          const newBalance = ethers.formatEther(balance)
          setUserBalance(newBalance)
          dispatch({ type: "Loading", payload: false })
          await queryClient.invalidateQueries({ queryKey: ["user"] })

        } catch (error) {
          console.error('Error in minted event handler:', error)
          dispatch({ type: "Loading", payload: false })
        }
      })

    } catch (error) {
      console.error('Error in GetCoin:', error)
      dispatch({ type: "Loading", payload: false })
      alert('토큰 발행 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  useEffect(() => {
    if (!Contracts || !userInfo?.smartAcc) return

    const fetchBalance = async () => {
      try {
        const { TokenContract } = Contracts
        const { smartAcc } = userInfo
        if (!smartAcc) return;

        // Add delay to prevent rate limiting
        await delay(1000)

        const balance = await retryWithBackoff(async () => {
          return await TokenContract?.balanceOf(smartAcc)
        })
        const newbalance = balance.toString()
        const newBalance = Math.floor(Number(ethers.formatEther(balance)))

        setUserBalance(newBalance)
      } catch (error) {
        console.error('Error fetching balance:', error)
        // Set a default balance if the call fails
        setUserBalance(0)
      }
    }

    fetchBalance()
  }, [Contracts, userInfo])

  const CancelSell = async ({ userid, sender, nftid, nftUridata, nftidToken }) => {
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
    await queryClient.invalidateQueries({ queryKey: ["user"] })
  }

  const BuyNft = async ({ sender, nftid, nftUridata, nftidToken, price }) => {
    try {
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

      
      const { data: Deletedata } = await axios.delete(`${BaseUrl}/sellnft`, { data: _data })
      const result2 = await axios.post(`${BaseUrl}/contractbuynft`, data)

      const amount = ethers.parseEther(`${price}`, 18)
      

      const mintCallData = TokenContract.interface.encodeFunctionData("transfer(address,uint256)", [sender, amount])
      // const events = await EntryPointContract.on("UserOpCompleted")

      
      const callData = SmartAccountContract.interface.encodeFunctionData("execute", [
        process.env.REACT_APP_BING_TKN_CA,
        value,
        mintCallData,
      ])

      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await sendEntryPoint(smartAcc, EntryPointContract, callData, signer)
      await TokenContract.on('Transfer', async (address, amount) => {
        try {
          // Add delay before balance check
          await new Promise(resolve => setTimeout(resolve, 1000))
          const balance = await TokenContract.balanceOf(smartAcc)
          const newBalance = ethers.formatEther(balance)
          setUserBalance(newBalance)
          alert("NFT 구매 완료 되었습니다")
          dispatch({ type: "Loading", payload: false })
          await queryClient.invalidateQueries({ queryKey: ["user"] })
          // navigate('/mypage')
        } catch (error) {
          console.error('Error in Transfer event handler:', error)
          dispatch({ type: "Loading", payload: false })
        }
      })

      // alert("NFT 구매 완료 되었습니다")
      // dispatch({ type: "Loading", payload: false })
      // await queryClient.invalidateQueries({ queryKey: ["user"] })
      // navigate('/mypage')
    } catch (error) {
      console.error('Error in BuyNft:', error)
      dispatch({ type: "Loading", payload: false })
      alert('NFT 구매 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    }
  }

  const LogoutHandler = () => {
    dispatch({ type: "logout" })
    navigate('/')
  }

  // Filter NFTs based on search query
  const filteredNFTs = sellnfts?.filter(nft => {
    if (!debouncedSearchQuery.trim()) return true

    const nftName = nft.nftUridata?.name || ''
    const nftDescription = nft.nftUridata?.description || ''
    const sellerName = nft.userid || ''

    const searchLower = debouncedSearchQuery.toLowerCase()
    const nameLower = nftName.toLowerCase()
    const descLower = nftDescription.toLowerCase()
    const sellerLower = sellerName.toLowerCase()

    const matchesName = nameLower.includes(searchLower)
    const matchesDesc = descLower.includes(searchLower)
    const matchesSeller = sellerLower.includes(searchLower)

    return matchesName || matchesDesc || matchesSeller
  }) || [];

  const ScrollToHash = () => {
    const { hash } = useLocation();

    useEffect(() => {
      if (hash) {
        const el = document.getElementById(hash.slice(1)); // remove #
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, [hash]);

    return null;
  };

  return (
    <Container>
      <ScrollToHash />
      <Sidebar showMobileMenu={showMobileMenu}>
        <Logo>ZunoNFT</Logo>
        <NavMenu>
          <NavItem onClick={() => navigate('/main')} className="active">
            📊 대시보드
          </NavItem>
          <NavItem onClick={() => {
            const el = document.getElementById('marketplace')
            el.scrollIntoView({ behavior: 'smooth' })
          }}>
            🛍️ 마켓플레이스
          </NavItem>
          <NavItem onClick={() => navigate('/mypage')}>
            💼 포트폴리오
          </NavItem>
          <NavItem onClick={() => navigate('/history')}>
            📄 거래 내역
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
          <NavItem onClick={() => navigate('/main')} className="active">
            📊 대시보드
          </NavItem>
          <NavItem onClick={() => {
            const el = document.getElementById('marketplace')
            el.scrollIntoView({ behavior: 'smooth' })
          }}>
            🛍️ 마켓플레이스
          </NavItem>
          <NavItem onClick={() => navigate('/mypage')}>
            💼 포트폴리오
          </NavItem>
          <NavItem onClick={() => navigate('/history')}>
            📄 거래 내역
          </NavItem>
          {/* <NavItem onClick={() => navigate('/settings')}>
            ⚙️ 설정
          </NavItem> */}
        </NavMenu>
        <LogoutButton onClick={LogoutHandler}>
          🚪 로그아웃
        </LogoutButton>
      </MobileSidebar>

      <MainContent>
        <Header>
          <HeaderTop>
            <HeaderLeft>
              <MobileMenuButton onClick={() => setShowMobileMenu(!showMobileMenu)}>
                ☰
              </MobileMenuButton>
              <MobileBalance>
                💰 {userBalance ? userBalance : 0} BTK
              </MobileBalance>
            </HeaderLeft>
            <HeaderCenter>
              <SearchBar>
                <input
                  type="text"
                  placeholder="NFT, 컬렉션, 사용자 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchBar>
            </HeaderCenter>
            <HeaderRight>
              <Balance>
                💰 {userBalance ? userBalance : 0} BTK
              </Balance>
              <UserProfile onClick={() => navigate('/mypage')}>
                <Avatar>{userId?.charAt(0)?.toUpperCase() || 'U'}</Avatar>
                <span>{userId || '사용자'}</span>
              </UserProfile>
            </HeaderRight>
          </HeaderTop>
          <HeaderBottom>
            <SearchBar>
              <input
                type="text"
                placeholder="NFT, 컬렉션, 사용자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchBar>
          </HeaderBottom>
        </Header>

        <Content>
          {/* Featured NFT Section - Like the image */}
          <FeaturedSection>
            <FeaturedNFT>
              <FeaturedImage>
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzMzNGI4YztzdG9wLW9wYWNpdHk6MSIgLz4KPHN0b3Agb2Zmc2V0PSIzNSUiIHN0eWxlPSJzdG9wLWNvbG9yOiM0YjM2NzA7c3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iNzAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNzE0Zjk2O3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4MzVkNzI7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjxyYWRpYWxHcmFkaWVudCBpZD0iZ3JhZDIiIGN4PSI1MCUiIGN5PSI1MCUiIHI9IjUwJSI+CjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZmZmZmY7c3RvcC1vcGFjaXR5OjAuMDgiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmZmZmZjtzdG9wLW9wYWNpdHk6MCIgLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNncmFkMSkiLz4KPGNpcmNsZSBjeD0iMjAwIiBjeT0iMjAwIiByPSIxNTAiIGZpbGw9InVybCgjZ3JhZDIpIi8+Cjxwb2x5Z29uIHBvaW50cz0iMjAwLDUwIDMxMCwxNTAgMzEwLDI1MCAyMDAsMzUwIDkwLDI1MCA5MCwxNTAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjE1KSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPHBvbHlnb24gcG9pbnRzPSIyMDAsMTAwIDI3MCwxNzAgMjcwLDIzMCAyMDAsMzAwIDEzMCwyMzAgMTMwLDE3MCIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA4KSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMikiIHN0cm9rZS13aWR0aD0iMSIvPgo8Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9IjQwIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMTIpIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8Y2lyY2xlIGN4PSIxNTAiIGN5PSIxMjAiIHI9IjYiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zKSIvPgo8Y2lyY2xlIGN4PSIyNTAiIGN5PSIxMzAiIHI9IjQiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4yNSkiLz4KPGNpcmNsZSBjeD0iMzIwIiBjeT0iMjAwIiByPSIzIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMikiLz4KPGNpcmNsZSBjeD0iODAiIGN5PSIyMDAiIHI9IjUiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4zNSkiLz4KPGNpcmNsZSBjeD0iMTcwIiBjeT0iMzAwIiByPSIzIiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMjUpIi8+CjxjaXJjbGUgY3g9IjI4MCIgY3k9IjI4MCIgcj0iNSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjMpIi8+Cjwvc3ZnPgo=" alt="Featured NFT" />
              </FeaturedImage>
              <FeaturedDetails>
                <Timer>⏰</Timer>
                <CollectionTitle>ZunoNFT </CollectionTitle>
                <CollectionDescription>
                  디지털 아트의 미래에 오신 것을 환영합니다. 여기서 코인을 받고 NFT를 구매할수 있습니다. 본인만의 NFT를 만들어보고 거래해보시는개 추천드립니다.
                </CollectionDescription>
                <CreatorInfo>
                  <CreatorAvatar>👤</CreatorAvatar>
                  <CreatorName>ZunoCreator</CreatorName>
                </CreatorInfo>
                <SocialLinks>
                  <SocialButton onClick={() => (navigate('/'))}>🌐 웹사이트</SocialButton>
                                      <SocialButton onClick={() => window.open('https://github.com/Mr-Binod', '_blank')}><img src={github} alt="github" style={{ width: '20px', height: '20px' }} /> github</SocialButton>
                </SocialLinks>
              </FeaturedDetails>
            </FeaturedNFT>
          </FeaturedSection>

          {/* Statistics Cards - Like the image */}
          <StatsSection>
            <StatsGrid>
              <StatCard>
                <StatLabel>최저가</StatLabel>
                <StatValue>1.28 BTK</StatValue>
                <StatChange>+5.2%</StatChange>
              </StatCard>
              <StatCard>
                <StatLabel>거래량</StatLabel>
                <StatValue>45.02 BTK</StatValue>
                <StatChange>+12.8%</StatChange>
              </StatCard>
              <StatCard>
                <StatLabel>시가총액</StatLabel>
                <StatValue>9,035.28 BTK</StatValue>
                <StatChange>+8.4%</StatChange>
              </StatCard>
              <StatCard>
                <StatLabel>평균가</StatLabel>
                <StatValue>21.23 BTK</StatValue>
                <StatChange>+3.1%</StatChange>
              </StatCard>
              <StatCard>
                <StatLabel>판매량</StatLabel>
                <StatValue>113</StatValue>
                <StatChange>+15.2%</StatChange>
              </StatCard>
              <StatCard>
                <StatLabel>공급량</StatLabel>
                <StatValue>890</StatValue>
                <StatChange>고정</StatChange>
              </StatCard>
            </StatsGrid>
          </StatsSection>

          {/* Quick Actions Section - Get Token and NFT Creation */}
          <QuickActionsSection>
            <Card>
              <SectionTitle>⚡ 빠른 액션</SectionTitle>
              <ActionButtons>
                {loading ? (
                  <Button disabled>
                  
                    처리 중...
                  </Button>
                ) : (
                  <Button onClick={GetCoin}>💰 1000 BTK 받기</Button>
                )}
                {loading ? (
                  <Button disabled>
              
                    처리 중...
                  </Button>
                ) : (
                  <Button className="secondary" onClick={() => setShowNftModal(true)}>🎨 NFT 생성</Button>
                )}
              </ActionButtons>
            </Card>
          </QuickActionsSection>

          {/* NFT Grid Section */}
          <NFTGridSection id="marketplace">
            <SectionHeader>
              <SectionTitle>🛍️ NFT 마켓플레이스</SectionTitle>
              <FilterBar>
                <FilterButton>📊 아이템</FilterButton>
                <FilterButton>📈 분석</FilterButton>
                <FilterButton>📋 활동</FilterButton>
                <SearchInput
                  type="text"
                  placeholder="NFT 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <SortSelect>
                  <option>가격 낮음에서 높음</option>
                  <option>가격 높음에서 낮음</option>
                  <option>최근 등록순</option>
                </SortSelect>
              </FilterBar>
            </SectionHeader>

            <NFTGrid>
              {filteredNFTs.map((el, i) => {
                return (
                  <NFTCard key={i}>
                    <NFTImage src={el.nftUridata.image} alt={el.nftUridata.name} />
                    <NFTContent>
                      <NFTInfo>
                        <NFTTitle>이름: {el.nftUridata.name}</NFTTitle>
                        <span>ID: {el.nftid}</span>
                      </NFTInfo>
                      <NFTInfo>
                        <NFTPrice>가격: {el.price} BTK</NFTPrice>
                        <span>수량: {el.nftidTokenAmt}</span>
                      </NFTInfo>
                      <NFTDescription>{el.nftUridata.description}</NFTDescription>
                      <NFTSeller>판매자: {el.userid}</NFTSeller>
                      {loading ? (
                        <ActionButton disabled>
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
          </NFTGridSection>
        </Content>

        {showNftModal && (
          <Modal onClick={(e) => e.target === e.currentTarget && setShowNftModal(false)}>
            <ModalContent>
              <ModalTitle>🎨 NFT 생성</ModalTitle>
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
      </MainContent>
    </Container>
  )
}

export default Mainpage
