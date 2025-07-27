import axios from "axios"
import { ethers } from "ethers"


const getUsersInfos = async () => {
    const response = await axios.get('http://localhost:3001/account')
    return response.data
}

const getUserInfo = async (userid, userpw) => {
    const {data} = await axios.get(`http://localhost:3001/account/${userid}`)
    if (data.state !== 201) return alert('아이디를 일치하지 않습니다')
    if(userpw !== data.message.userpw) return alert('비밀번호 일치하지않습니다')
    return data
}
const getUserInfoCreate = async (userid) => {
    const {data} = await axios.get(`http://localhost:3001/account/${userid}`)
    console.log(data, 'login')
    // if (data.state !== 201) return alert('아이디를 일치하지 않습니다')
    // if(userpw !== data.message.userpw) return alert('비밀번호 일치하지않습니다')
    return data
}
 
const CreateAcc = async (data) => {
    console.log(data)
    if(data.userpw.length < 4) {
        alert('비밀번호 4개 이상 입력해주세요')
        return {state : 406}}
    const result = await getUserInfoCreate(data.id)
    console.log(data)
    console.log(result)
    if(result.state === 201) return result
    const response = await axios.post('http://localhost:3001/account', data) 
    return response.data
}

const CreateNft = async (IpfsUri, smartAcc) => {
    console.log('GG')
    const _data = {Uri : IpfsUri, address : smartAcc}
    const {data} = await axios.post('http://localhost:3001/createnft',_data ) 
    return data
}

const CheckZero = async () => {
    await axios.delete('http://localhost:3001/checkzero')
}


export {getUsersInfos, CreateAcc, getUserInfo, CreateNft, getUserInfoCreate, CheckZero}
