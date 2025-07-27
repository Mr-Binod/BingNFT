import React from 'react'
import axios from 'axios'

const getWallet = async () => {
    const {data} = await axios.get('http://localhost:3001/wallet')
    console.log(data, "api")
    return data
}
const getWallets = async () => {
    const {data} = await axios.get('http://localhost:3001/wallets')
    console.log(data, "api2")
    return data
}
const createWallet = async (user, Userbalance) => {
    const {data} = await axios.post('http://localhost:3001/wallet', {user, Userbalance})
    console.log(data, "3")
    return data
}

export {getWallet, getWallets, createWallet}
