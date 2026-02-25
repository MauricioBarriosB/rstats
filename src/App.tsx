import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import {
  Home,
  Contact,
  Login,
  UserData,
  Routes as RoutesPage,
  Statistics,
  UserAccount,
} from "./pages";

function App() {
  return (
    <BrowserRouter basename="/rstats">
      <Layout>
        <Routes> 
          <Route path="/home" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/userdata" element={<UserData />} />
          <Route path="/" element={<RoutesPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/useraccount" element={<UserAccount />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
