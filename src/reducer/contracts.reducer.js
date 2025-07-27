

const initialState = {}



export const contractReducer = (state = initialState, action) => {
    const {type, payload} = action;

    switch (type) {
        case "Contracts": {
            state = payload
            // console.log(state, 'walletred')
            return state
        }
            
    
        default:
            return state
    }
}