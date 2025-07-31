

# Zuno
<!-- <div   width="150px" height="150px">
<img src='./newbingfront/myapp/src/images/icons/notionarylogo.png' style="background-color:white;width:150px;" >

</div> -->



# 목차
- [프로젝트 소개](#프로젝트-소개)
- [개인 프로젝트](#팀원-소개)
- [화면 구성](#화면-구성)
- [주요 기능](#주요-기능)
- [개발 기간](#개발-기간)
- [기술 스택](#기술-스택)
- [협업 도구](#협업-도구-communication)
- [테이블 구성](#테이블-구성)
---

## 개발 기간
- 2025-07-21 ~ 2025-07-25 (5일)

## 프로젝트 소개
Notionary는 워크스페이스 공간 제공해주고, 사용자들이 질문과 의견을 낼수 있는 소통 공간으로 개발하게 됬습니다. 여기에서는 우리가 워크스페이스를 정리하면서 카태고리별로 굼금한 글과 질문을 작성할수 있습니다. 글을 작성할때 본인의 워크스페이스를 공유하면서 질문과 응답을 받을수도 있습니다.
---

## 팀원 소개 
<div>
<img src="https://github.com/Mr-Binod.png" width="80px"><br>
<a href="https://github.com/Mr-Binod">팀원 : 비노드 </a><br>
역활활 : 워크스페이시 페이지 구현
</div>


## 화면 구성 :
<label>웤크스페이스 폴더 생성</label>
<img src="./newbingfront/myapp/public/images/createworkspace-ezgif.com-speed.gif"><br><br>
<label>페이지 생성</label>
<img src="./newbingfront/myapp/public/images/createpage-ezgif.com-speed.gif"><br><br>
<label>워크스페이스 기능</label>
<img src="./newbingfront/myapp/public/images/functionsws.gif"><br><br>
<label>삭제 기능</label>
<img src="./newbingfront/myapp/public/images/deletews-ezgif.com-speed.gif">



## 주요 기능

### 담당 : Zuno 프로젝트
- 로그인 페이지 : 사용자가 회원가입하면 ERC4337로 wallet 생성해서 smart Account 생성 
- 메인 페이지 :메인 페이지에서 사용자 정보 아이디, 공개키, 잔액, NFT 구매 기능. 사용자가 토큰 바랭하면 1000BTK 발앻 및 nft 생성 기능
- 마이 페이지 : 사용자의 정보, 소유하고 있는 NFT, 판매중이 NFT 확인하고 판매 NFT 취소 기능


## API 문서 
get  : /account   전체 계정 조회
get  : /account/:id   id 사용자 계정 조회
get  : /userop  mempool 조회
get : /wallet

post : /account   계정 생성
post : /createnft  NFT 생성 
post : /userop  entrypoing 호출
post : /wallet  wallet 생성
post : /nft   nft 생성


delete : /checkzero  nft 수량 0 이며 삭제


## 기술 스택 
### FRONTEND

<table>
  <tr>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/react.png" width="200px"><br>
      <label>React</label>
    </td>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/html-5_5968267.png" width="200px"><br>
      <label>HTML5</label>
    </td>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/css.png" width="200px"><br>
      <label>CSS</label>
    </td>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/js_5968292.png" width="200px"><br>
      <label>JavaScript</label>
    </td>
  </tr>
</table>

### BACKEND
<table>
  <tr>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/js_5968292.png" width="200px"><br>
      <label>JavaScript</label>
    </td>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/mysql.png" width="200px"><br>
      <label>MySQL</label>
    </td>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/nodejs.256x157.png" width="200px"><br>
      <label>Node.js</label>
    </td>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/express.png" width="200px"><br>
      <label>Express</label>
    </td>
  </tr>
</table>

### 협업 도구 COMMUNICATION 
<table>
  <tr>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/github_2504911.png" width="200px"><br>
      <label>GitHub</label>
    </td>
    <td align="center">
      <img src="./newbingfront/myapp/public/images/Notion.png" width="200px"><br>
      <label>Notion</label>
    </td>
  </tr>
</table>




### 프론트 폴더 구조
---
📦Notionary

┣ 📂 dapp 프론트

┣ 📂src

    ┣ 📂 API

    ┣ 📂 Components

    ┣ 📂 css

    ┣ 📂 Hooks

    ┣ 📂 images

    ┣ 📂 Reducer

    ┣ 📂 Store
  
 ┣ 📜 App.js

 ┣ 📜 index.js

 ┣ 📜 package-lock.json

 ┣ 📜 package.json


### 백엔드 폴더 구조
---
┣ 📂 백엔드

┣ 📂controllers

┣ 📂middlewares

┣ 📂models

┣ 📂public

┣ 📂routers

┣ 📂script
  
 ┣ 📜 App.js

 ┣ 📜 index.js

 ┣ 📜 package-lock.json

 ┣ 📜 package.json