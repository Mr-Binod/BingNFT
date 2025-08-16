import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { ethers } from 'ethers'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Keyframe animations
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

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
`

const gradientShift = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
  color: white;
  display: flex;
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
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 70%, #1a1a2e 100%);
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
  @media (max-width: 480px) {
    width: 300px;
  }
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
`

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${fadeInUp} 0.8s ease-out;
`

const PageSubtitle = styled.p`
  color: #a0aec0;
  font-size: 18px;
  margin: 0 0 40px 0;
  line-height: 1.6;
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
`

const FilterBar = styled.div`
  display: flex;
  /* flex-direction: column; */
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.8s ease-out 0.4s both;
  
  @media (min-width: 769px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  
  @media (min-width: 769px) {
    flex-direction: row;
    align-items: center;
    gap: 590px;
  }
  @media (min-width: 480px) {
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }
  `

const FilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
`

const FilterButton = styled.button`
  padding: 12px 20px;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.active ? 'rgba(102, 126, 234, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
    flex: 1;
    min-width: fit-content;
  }
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
    flex: 1;
    min-width: fit-content;
    max-width: max-content;
  }
`

const TimeFilter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  
  @media (max-width: 768px) {
    gap: 4px;
  }
`

const TradeHistoryTable = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: ${fadeInUp} 0.8s ease-out 0.6s both;
`

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 70px;
  gap: 24px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  color: #a0aec0;
  font-size: 14px;
  
  > div {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  > div:nth-child(2) {
    justify-content: flex-start;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 35px 2.5fr 1fr 0.8fr 0.8fr 60px;
    gap: 6px;
    padding: 12px 8px;
    font-size: 11px;
  }
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 50px 2fr 1fr 1fr 1fr 70px;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 35px 2.5fr 1fr 0.8fr 0.8fr 60px;
    gap: 6px;
    padding: 12px 8px;
    font-size: 12px;
  }
`

const RankNumber = styled.div`
  font-weight: 700;
  color: ${props => props.rank <= 3 ? '#f59e0b' : '#a0aec0'};
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const NFTInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const NFTImage = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.error {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 12px;
    
    &::after {
      content: 'NFT';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
`

const NFTDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const NFTName = styled.div`
  font-weight: 600;
  color: white;
  font-size: 14px;
`

const NFTCollection = styled.div`
  font-size: 12px;
  color: #a0aec0;
`

const Price = styled.div`
  font-weight: 600;
  color: #10b981;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Volume = styled.div`
  font-weight: 600;
  color: #667eea;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Change = styled.div`
  font-weight: 600;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Status = styled.div`
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    switch (props.status) {
      case 'buy': return '#10b981';
      case 'sell': return '#f59e0b';
      case 'cancel': return '#ef4444';
      case 'mint': return '#667eea';
      default: return '#a0aec0';
    }
  }};
  
  @media (max-width: 768px) {
    font-size: 12px;
    font-weight: 500;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 24px;
  color: #a0aec0;
`

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
`

const EmptyDescription = styled.p`
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 32px;
  padding: 20px;
`

const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${props => props.active ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.active ? '#667eea' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: rgba(102, 126, 234, 0.2);
    border-color: rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PageInfo = styled.div`
  color: #a0aec0;
  font-size: 14px;
  margin: 0 16px;
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

const slideInTrade = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`

const slideOutTrade = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`

const fadeInTrade = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

const fadeOutTrade = keyframes`
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
  border-radius: 0 15px 15px 0;
  box-sizing: border-box;
  
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
    animation: ${props => props.showMobileMenu ? slideInTrade : slideOutTrade} 0.3s ease-out;
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

const Tradehistory = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userId, userinfo, islogin } = useSelector((state) => state.LoginReducer)

  const [tradeHistory, setTradeHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEvents, setTotalEvents] = useState(0)
  const eventsPerPage = 10
  const Contracts = useSelector((state) => state.contractReducer)
  const [events, setEvents] = useState([])
  const queryClient = useQueryClient()
  const [isThrottled, setIsThrottled] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)



  const { data: tradeEvents, isLoading } = useQuery({
    queryKey: ['trade', currentPage, activeFilter, timeFilter, debouncedSearchQuery],
    queryFn: async () => {
      try {
        setLoading(true)
        if (Contracts.NftContract && userinfo.smartAcc && userinfo.smartAcc !== "0x" && userinfo.smartAcc.length >= 42) {

          setEvents([])
          const balance = await Contracts.TokenContract.balanceOf(userinfo?.smartAcc)
          const newBalance = Math.floor(Number(ethers.formatEther(balance)))
          setBalance(newBalance)
          const filter = Contracts.NftContract.filters.history();
          const allEvents = await Contracts.NftContract.queryFilter(filter, 0, "latest")
          

          // Process all events first
          const allEventData = []
          for (const event of allEvents) {
            const { from, to, id, amount, price, trade, uri } = event.args
            const uridata = await axios.get(`https://gateway.pinata.cloud/ipfs/${uri}`);
            const imgpath = uridata.data.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
            const newUridata = uridata.data;
            newUridata.image = imgpath;
            const change = (price / amount)

            // Add timestamp to the event data
            const timestamp = event.blockNumber ? await event.getBlock().then(block => block.timestamp) : Date.now() / 1000
            allEventData.push({ from, to, id, amount, price, trade, change, newUridata, timestamp })

          }

          // Filter all events based on activeFilter, timeFilter, and debouncedSearchQuery
          const filteredEvents = allEventData.filter(trade => {
            // First filter by trade type
            let passesTradeFilter = false
            if (activeFilter === 'all') passesTradeFilter = true
            else if (activeFilter === 'completed') passesTradeFilter = trade.trade === 'buy'
            else if (activeFilter === 'pending') passesTradeFilter = trade.trade === 'sell'
            else if (activeFilter === 'failed') passesTradeFilter = trade.trade === 'cancel'
            else if (activeFilter === 'minted') passesTradeFilter = trade.trade === 'mint'

            if (!passesTradeFilter) return false

            // Then filter by time
            const now = Math.floor(Date.now() / 1000)
            const tradeTime = trade.timestamp
            const timeDiff = now - tradeTime

            let passesTimeFilter = false
            if (timeFilter === 'all') passesTimeFilter = true
            else if (timeFilter === '24h') passesTimeFilter = timeDiff <= 24 * 60 * 60
            else if (timeFilter === '7d') passesTimeFilter = timeDiff <= 7 * 24 * 60 * 60
            else if (timeFilter === '30d') passesTimeFilter = timeDiff <= 30 * 24 * 60 * 60

            if (!passesTimeFilter) return false

            // Finally filter by search query
            if (debouncedSearchQuery.trim() === '') return true

            const nftName = trade.newUridata?.name || ''
            const searchLower = debouncedSearchQuery.toLowerCase()
            const nameLower = nftName.toLowerCase()

            const passesSearchFilter = nameLower.includes(searchLower)

            return passesSearchFilter
          })

          // Sort filtered events by timestamp in descending order (latest first)
          const sortedEvents = filteredEvents.sort((a, b) => b.timestamp - a.timestamp)

          // Paginate the sorted results
          const startIndex = (currentPage - 1) * eventsPerPage
          const endIndex = startIndex + eventsPerPage
          const pageEvents = sortedEvents.slice(startIndex, endIndex)

          // Set the page events
          setEvents(pageEvents)
          setTotalEvents(sortedEvents.length)
          setTotalPages(Math.ceil(sortedEvents.length / eventsPerPage))
          setLoading(false)
          return pageEvents
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data on error
        setTradeHistory([]);
        setLoading(false);
        return [];
      }
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 10000),
    enabled: !!Contracts.NftContract,
    staleTime: 0, // Always consider data stale to force refetch
    cacheTime: 30000, // Reduce cache time
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  })

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setEvents([])
  }, [currentPage])

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['trade'] })
  }, [userinfo])

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }


  useEffect(() => {
    // Reset to page 1 when filter changes
    setCurrentPage(1)
  }, [activeFilter])

  useEffect(() => {
    // Reset to page 1 when time filter changes
    setCurrentPage(1)
  }, [timeFilter, debouncedSearchQuery])


  const LogoutHandler = () => {
    dispatch({ type: "logout" })
    navigate('/')
  }

  const filteredHistory = events

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
          <NavItem onClick={() => navigate('/mypage')}>
            💼 포트폴리오
          </NavItem>
          <NavItem onClick={() => navigate('/history')} className="active">
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
          <NavItem onClick={() => navigate('/main')}>
            📊 대시보드
          </NavItem>
          <NavItem onClick={() => navigate('/main#marketplace')}>
            🛍️ 마켓플레이스
          </NavItem>
          <NavItem onClick={() => navigate('/mypage')}>
            💼 포트폴리오
          </NavItem>
          <NavItem onClick={() => navigate('/history')} className="active">
            📄 거래 내역
          </NavItem>
     
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
                💰 {balance ? balance : 0} BTK
              </MobileBalance>
              {/* <DesktopLogo>ZunoNFT</DesktopLogo> */}
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
                💰 {balance ? balance : 0} BTK
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
          <PageTitle>거래 내역</PageTitle>
          <PageSubtitle>
            플랫폼 전체의 모든 NFT 거래, 판매 및 거래 활동을 추적하세요
          </PageSubtitle>

          <FilterBar>
            <FilterSection>
            <FilterButtons>
              <FilterButton
                active={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
              >
                  모든 거래
              </FilterButton>
              <FilterButton
                active={activeFilter === 'completed'}
                onClick={() => setActiveFilter('completed')}
              >
                  완료됨
              </FilterButton>
              <FilterButton
                active={activeFilter === 'pending'}
                onClick={() => setActiveFilter('pending')}
              >
                  대기중
              </FilterButton>
              <FilterButton
                active={activeFilter === 'failed'}
                onClick={() => setActiveFilter('failed')}
              >
                  실패
              </FilterButton>
              <FilterButton
                active={activeFilter === 'minted'}
                onClick={() => setActiveFilter('minted')}
              >
                  민팅됨
              </FilterButton>
            </FilterButtons>
            <TimeFilter>
              <FilterButton
                active={timeFilter === '24h'}
                onClick={() => setTimeFilter('24h')}
              >
                24h
              </FilterButton>
              <FilterButton
                active={timeFilter === '7d'}
                onClick={() => setTimeFilter('7d')}
              >
                7d
              </FilterButton>
              <FilterButton
                active={timeFilter === '30d'}
                onClick={() => setTimeFilter('30d')}
              >
                30d
              </FilterButton>
              <FilterButton
                active={timeFilter === 'all'}
                onClick={() => setTimeFilter('all')}
              >
                All
              </FilterButton>
            </TimeFilter>
            </FilterSection>
          </FilterBar>

          <TradeHistoryTable>
            <TableHeader>
              <div>순위</div>
              <div>NFT</div>
              <div>가격 (BTK)</div>
              <div>수량</div>
              <div>변화 (%)</div>
              <div>상태</div>
            </TableHeader>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#a0aec0' }}>
                거래 내역을 불러오는 중...
              </div>
            ) : filteredHistory.length > 0 ? (
              filteredHistory?.map((trade, i) => (

                <TableRow key={i}>
                  <RankNumber rank={trade.rank}>#{((currentPage - 1) * eventsPerPage) + i + 1}</RankNumber>
                  <NFTInfo>
                    <NFTImage>
                      <img
                        src={trade.newUridata.image}
                        alt={trade.nftName}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.classList.add('error');
                        }}
                      />
                    </NFTImage>
                    <NFTDetails>
                      <NFTName>{trade.newUridata.name}</NFTName>
                      <NFTCollection>BingNFT</NFTCollection>
                    </NFTDetails>
                  </NFTInfo>
                  <Price>{trade.price} BTK</Price>
                  <Volume>{trade.amount}</Volume>
                  <Change positive={trade.positive}>{trade.change}%</Change>
                  <Status status={trade.trade}>{trade.trade}</Status>
                </TableRow>
              ))
            ) : (
              <EmptyState>
                <EmptyIcon>📊</EmptyIcon>
                <EmptyTitle>거래 내역 불러오는 중</EmptyTitle>
                <EmptyDescription>
                  아직 기록된 거래가 없습니다. NFT 거래를 시작하여 여기서 내역을 확인하세요.
                </EmptyDescription>
              </EmptyState>
            )}
          </TradeHistoryTable>

          {/* Pagination Controls */}
          {filteredHistory.length > 0 && totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ← 이전
              </PaginationButton>

              <PageInfo>
                페이지 {currentPage} / {totalPages}
                (총 {totalEvents}개 이벤트)
              </PageInfo>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationButton
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}

              {totalPages > 5 && (
                <>
                  {currentPage > 3 && <span style={{ color: '#a0aec0' }}>...</span>}
                  <PaginationButton
                    active={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </PaginationButton>
                </>
              )}

              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                다음 →
              </PaginationButton>
            </PaginationContainer>
          )}
        </Content>
      </MainContent>
    </Container>
  )
}

export default Tradehistory