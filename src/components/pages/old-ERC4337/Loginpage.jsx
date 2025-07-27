import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { CreateAcc, getUserInfo, getUsersInfo } from '../../../api/ERC4337/NewApi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import loadingGif from '../../../images';

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
        <div>
            {/* <button onClick={requestWhitelist.mutate} >request for whitelist</button> */}
            {/* <button onClick={getUsersInfo} >request for getUsersInfo</button> */}

            <div>Loginpage</div>
            <div> <form onSubmit={(e) => loginHandler(e)}>
                <input type="text" name='userid' placeholder='아이디'/> <br />
                <input type="text" name='userpw' placeholder='비밀번호' /> <br />
                {loading ? <img src={loadingGif} width='50px' /> :<button>Login</button>}
            </form> <br />
                <form onSubmit={(e) => signUpHandler.mutate(e)}>
                    <input type="text" name='signupid' placeholder='아이디'/> <br />
                    <input type="text" name='signuppw' placeholder='비밀번호 4개 이상'/> <br />
                    {loading ? <img src={loadingGif} width='50px' /> : <button>signup</button>}
                </form></div>
                {isPending && <div>pending</div> }
        </div>
    )
}

export default Newpage
