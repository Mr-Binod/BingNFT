import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { getUsers } from '../../../api/ERC1155/Model';
import { createWallet } from '../../../api/ERC1155/Wallet';

export const Loginpage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userkeys, setUserkeys] = useState([])
    const [users, setUsers] = useState(null);
    const [userbalance, setUserbalance] = useState(0);

    const user = useSelector((state) => state.LoginReducer.user)
    const islogin = useSelector((state) => state.LoginReducer.State)



    const queryClient = useQueryClient();
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["data"],
        queryFn: async () => {
            const wallets = await getUsers();
            // const usernft = await userNft(signer.getAddress(), contractNFT )
            setUsers(wallets)
            const privateKeys = wallets.map((el) => el.privateKey);
            setUserkeys(privateKeys);

            return ({ wallets })
        },
        refetchOnMount: true,
        refetchOnWindowFocus: false,
        enabled: true,
        retry: 2
    })

    const createwalletMutn = useMutation({
        mutationFn: createWallet,
        onSuccess: () => {
            // refetch()
            queryClient.invalidateQueries(['users'])
        }
    })

    const loginHandler = (e) => {
        e.preventDefault();
        const { userid } = e.target;
        const isUser = users && users.find((el) => el.user === userid.value);
        if (!userid.value || !isUser || userid.value.trim() === "") return alert('아이디를 입력해주세요');
        // dispatch({ type: 'setUserId', payload: userid.value })  // ✅ Set in Redux
        // dispatch({ type: 'login' })
        // navigate('/main')
        userid.value = "";
    }

    const LogoutHandler = () => {
        dispatch({ type: 'logout' })  // This will clear userId and user too
        console.log('zz')
    }

    const signUp = (e) => {
        e.preventDefault();
        const { signupid } = e.target;
        const isUser = users && users.find((el) => el.user === signupid.value);
        if (isUser) return alert('이미 사용된 아이디입니다');
        dispatch({ type: 'setUserId', payload: signupid.value })  // ✅ Set in Redux
        createwalletMutn.mutate(signupid.value, userbalance)
        signupid.value = "";
    }

    return (<>
        <div>Loginpage</div>
         <div> <form onSubmit={(e) => loginHandler(e)}>
            <input type="text" name='userid' />
            <button>Login</button>
        </form> <br />
            <form onSubmit={(e) => signUp(e)}>
                <input type="text" name='signupid' />
                <button>signup</button>
            </form></div>
            {/* : <button onClick={LogoutHandler}>Logout</button> */}
    </>
    )
}
