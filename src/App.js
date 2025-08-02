import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useSelector } from "react-redux";
import Newpage from "./components/pages/ERC4337/Loginpage";
import Mainpage from "./components/pages/ERC4337/Mainpage";
import Mypage from "./components/pages/ERC4337/Mypage";
import Tradehistory from "./components/pages/ERC4337/Tradehistory";


function App() {
  const islogin = useSelector((state) => state.LoginReducer.State)
  return (
    <div className="App">
      <BrowserRouter>

        {/* {!islogin ? */}
          <Routes>
            <Route path="/" element={<Newpage />} />
          {/* </Routes> :
          <Routes> */}
            <Route path="/main" element={<Mainpage />} />
            <Route path="/mypage" element={<Mypage />} />
            <Route path="/history" element={<Tradehistory />} />
          </Routes>
          {/* } */}
      </BrowserRouter>
    </div>
  );
}

export default App;
