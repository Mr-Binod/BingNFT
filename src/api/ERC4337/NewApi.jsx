import axios from "axios"
import { ethers } from "ethers"

const getUsersInfos = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/account`)
    return response.data
}

const getUserInfo = async (userid, userpw) => {
    const {data} = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/account/${userid}`)
    console.log(data)
    if (data.state !== 201) return alert('아이디를 일치하지 않습니다')
    if(userpw !== data.message.userpw) return alert('비밀번호 일치하지않습니다')
    return data
}
const getUserInfoOne = async (userid) => {
    const {data} = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/account/${userid}`)
    // if (data.state !== 201) return alert('아이디를 일치하지 않습니다')
    // if(userpw !== data.message.userpw) return alert('비밀번호 일치하지않습니다')
    return data
}
 
const CreateAcc = async (data) => {
    if(data.userpw.length < 4) {
        alert('비밀번호 4개 이상 입력해주세요')
        return {state : 406}}
    const result = await getUserInfoOne(data.id)
    if(result.state === 201) return result
    const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/account`, data) 
    return response.data
}

const CreateNft = async (IpfsUri, smartAcc) => {
    const _data = {Uri : IpfsUri, address : smartAcc}
    const {data} = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/createnft`,_data ) 
    return data
}

const CheckZero = async () => {
    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/checkzero`)
}


export {getUsersInfos, CreateAcc, getUserInfo, CreateNft, getUserInfoOne, CheckZero}
