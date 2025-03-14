import {createBrowserRouter} from"react-router-dom";
import App from "../App.jsx";
import About from "../component/About/index.jsx";
import Contact from "../component/Contact/index.jsx";
import Singup from "../component/Singup/index.jsx";
import Login from "../component/Login/index.jsx";
const router = createBrowserRouter([
    {
        path: "/",
        element:<App/>
    },
    {
        path: "/Gioithieu",
        element:<About/>
    },
    {
        path: "/Tuongtac",
        element:<Contact/>
    },
    {
        path:"/Dangky",
        element:<Singup/>
    },
    {
        path:"/Dangnhap",
        element:<Login/>
    }
]);
export default router;