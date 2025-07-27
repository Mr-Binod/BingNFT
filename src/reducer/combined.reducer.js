import { combineReducers } from "redux";
import LoginReducer from "./Login.reducer";
import { NftsReducer } from "./Nfts.reducer";
import { contractReducer } from "./contracts.reducer";




const combinedReducer = combineReducers({
    LoginReducer,
    NftsReducer,
    contractReducer
})


export default combinedReducer