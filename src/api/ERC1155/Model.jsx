import React from 'react'
import axios from 'axios'

const getUser = async (user) => {
    const {data} = await axios.get(`http://localhost:3001/model/${user}`)
    console.log(data, "api")
    return data
}
const getUsers = async () => {
    const {data} = await axios.get('http://localhost:3001/models')
    console.log(data, "api2")
    return data
}

const Patchbalance = async (id, balance) => {
    console.log(id, balance, 'ss1')
    const {data} = await axios.patch('http://localhost:3001/model', {id, balance})
    // console.log(data)
    console.log(data, 'dsss')
    return data
}


export {getUser, getUsers, Patchbalance}
