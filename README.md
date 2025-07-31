

# ZunoNFT
<h2><a href="https://bing-nft.vercel.app/" style="color: lightblue;">ZunoNFT 사이트 이동</a></h2>

# 목차
- [프로젝트 소개](#프로젝트-소개)
- [개인 프로젝트](#팀원-소개)
- [화면 구성](#화면-구성)
- [주요 기능](#주요-기능)
- [개발 기간](#개발-기간)
- [기술 스택](#기술-스택)
- [협업 도구](#협업-도구-communication)
- [회고 로그](#회고-로그)
---

## 개발 기간
- 대략 일주

## 프로젝트 소개

ZunoNFT는 블록체인에서 계정 추상화 erc4337 로직 사용해서 사용자가 wallet 없이도 편하게 블록첸을 기능을 사용할수있고 TOKEN 발급이나 NFT 거래도 할수 있는 플랫품으로 개발하게 되었습니다. 

---

## 팀원 소개 
<div>
<img src="https://github.com/Mr-Binod.png" width="80px"><br>
<a href="https://github.com/Mr-Binod">팀원 : 비노드 </a><br>
</div>


## 화면 구성 :
<label >회원 가입 (블록에 기록 되기때문에 시간 좀 소요됩니다)</label> </br> 
<img src="./src/images/signup.gif"><br><br>
<label>NFT 생성</label></br>
<img src="./src/images/nftUpload.gif"></br></br>
<label>NFT 판매</label></br>
<img src="./src/images/sellnft.gif"><br><br>
<label>NFT 구매</label></br>
<img src="./src/images/buynft.gif"></br>



## 주요 기능

### 담당 : Zuno 프로젝트

- 로그인 페이지 : 사용자가 회원가입하면 ERC4337로 wallet 생성해서 smart Account 생성 
- 메인 페이지 :메인 페이지에서 사용자 정보 아이디, 공개키, 잔액 확인 및 NFT 구매 가능. 사용자가 토큰 발행하면 1000BTK 발행 및 nft 생성 기능
- 마이 페이지 : 사용자의 정보, 소유하고 있는 NFT, 판매중이 NFT 확인하고 판매 NFT 취소 기능

## API 문서 

### 📥 GET 요청

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/account` | 전체 계정 조회 |
| GET | `/account/:id` | 특정 ID의 사용자 계정 조회 |
| GET | `/userop` | mempool 조회 |
| GET | `/user/:user` | 특정 사용자의 NFT 조회 |
| GET | `/sellnft` | 판매 중인 NFT 리스트 조회 |
| GET | `/sellnft/:userid/:nftid` | 특정 사용자의 특정 NFT 조회 |

---

### 🛠 PATCH 요청

| 메서드 | 경로 | 설명 |
|--------|------|------|
| PATCH | `/sellnft` | 사용자의 구매한 NFT 추가 |

---

### ➕ POST 요청

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/account` | 계정 생성 |
| POST | `/createnft` | NFT 생성 |
| POST | `/userop` | EntryPoint 호출 |
| POST | `/wallet` | 지갑 생성 |
| POST | `/nft` | NFT 생성 및 DB 저장 |
| POST | `/creteusernft` | 사용자 NFT 생성 및 DB 저장 |
| POST | `/sellnft` | NFT 판매 등록 |
| POST | `/contractsellnft` | 판매 컨트랙트 호출 |
| POST | `/buynft` | NFT 구매 |
| POST | `/contractbuynft` | 구매 컨트랙트 호출 |

---

### ❌ DELETE 요청

| 메서드 | 경로 | 설명 |
|--------|------|------|
| DELETE | `/sellnft` | 사용자의 판매 NFT 삭제 |
| DELETE | `/sellnftcontractsellnft` | 사용자의 판매 NFT를 컨트랙트에서 삭제 |
| DELETE | `/checkzero` | NFT 수량이 0이면 삭제 |
<!-- get  : /account   전체 계정 조회
get  : /account/:id   id 사용자 계정 조회
get  : /userop  mempool 조회
get  : /user/:user   user의 nft 조회
get  : /sellnft   sellnft list 조
get :  /sellnft/:userid/:nftid  user의 nft 조회


patch : /sellnft  사용자의 구매했던 nft 추가


post : /account   계정 생성
post : /createnft  NFT 생성 
post : /userop  entrypoing 호출
post : /wallet  wallet 생성
post : /nft   nft 생성 db 저장
post : /createnft   nft create 호
post : /creteusernft  user nft 생성 db 저
post : /sellnft   nft 팔기
post : /contractsellnft   sell contract 호출
post : /buynft   nft 구매
post : /contractbuynft   contract buy 호출


delete : /sellnft  사용자의 판매 nft 삭제
delete : /sellnftcontractsellnft  사용자의 판매 nft contract 에서 삭제
delete : checkzero     nft 량 0 이면 삭제 -->




## 기술 스택 
### FRONTEND
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)

### 🛠 BACKEND
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)

### CONTRACT

![Solidity](https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white)

### 협업 도구 COMMUNICATION 
![Notion API](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)

### Library and test tools

#### FRONTEND
- react-query
- tanstack /react-query
- redux react-redux
- axios
- ethers
- dotenv

#### BACKEND
- crypto
- elliptic

test & contract deployment
1. remixd
2. hardhat

#### RPC
- INFURA
- PINATA

# 회고 로그 
<!-- - 프로젝트 목표, 계획, 구현, 유지보수, 회고 -->
### 구현
- ERC4337 블록체인 기능을 활용해서 토큰 발행할수 있고 가지고 있는 토큰으로 NFT 거래할수 있는 플랫품을 개발하게 되었습니다.
- 사용자가 가입하면 WALLET 이랑 SMART ACCOUNT 계정을 생성되고 WHITE LIST 에 등록되고 WHITE LIST 등록 된 SMART CONTRACT 들의 GASFEE 대납자가 지불하게 됩니다
- 사용자의 정보, NFT정보, 판매 NFT LIST들이 DATABASE 에 저장했습니다
- 백엔드는 NESTJS 사용했고 프론트는 REACT 사요하고 CONTRACT는 SOLIDITY 사용해서 구현하게 되었습니다.
- 프론트는 보기 쉽고 심플하게 구현 했습니다

### 문제점 및 해결
- ERC4337 사용해서 ERC1155 로직을 호출할때 에러가 발생했고 구현이 어려웠습니다
- 그래서 대납자 사용해서 ERC1155 컨트랙트를 호출하게 되었습니다
- NESTJS 사용해서 백엔드 구현할때 배우면서 해야되기때문에 어려움이 겪였습니다 
- ENV 로직 호출, 데이터베이스 설게, 의존성 주입, 타입 정의 같은 불편함을 저리하면서 환성하였습니다
- 회원 가입으나 거래할때 시간좀 걸리고 사용자가 이탈한 불편함

### 아프로 계획
- 가입이나 거래 로직을 실행할때 소요된 시간 컨트랙트에서 처리된 부분과 UI쪽에서 다르고 유저가 빠르게 볼수 있게 할 예정
- 스왑 기능 주가 예정
- 화면 디자인 더 예쁘게 디자인 할 예정
- 토큰 발행기능을 저움에 무료하고 3 번지나면 유로로 할 예정
- 거래가되면 수수료 확보할 예정 