
import { combineReducers, createStore } from "redux"
import combinedReducer from "../reducer/combined.reducer"


export const store = createStore(combinedReducer)

//  default store