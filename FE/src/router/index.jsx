import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import About from "../component/About/index.jsx";
import Contact from "../component/Contact/index.jsx";
import Singup from "../component/Singup/index.jsx";
import Login from "../component/Login/index.jsx";
import Cart from "../component/Cart/index.jsx";
import Checkout from "../component/CheckOut/index.jsx";
import ProductDetail from "../component/HomePage/ProductDetails/index.jsx";
import SetupProfile from "../component/UserProfile/index.jsx";
import AddProduct from "../component/Products/index.jsx";
import ProductList from "../component/ProductList/index.jsx";
import SearchResults from "../component/Search/index.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />
    },
    {
        path: "/Gioithieu",
        element: <About />
    },
    {
        path: "/Tuongtac",
        element: <Contact />
    },
    {
        path: "/Dangky",
        element: <Singup />
    },
    {
        path: "/Dangnhap",
        element: <Login />
    },
    {
        path: "/Giohang",
        element: <Cart />
    },
    {
        path: "/Thanhtoan",
        element: <Checkout />
    },
    {
        path: "/product/:id",
        element: <ProductDetail />
    },
    {
        path: "/Themsanpham",
        element: <AddProduct />
    },
    {
        path: "/products",
        element: <ProductList />
    },
    {
        path: "/profile",
        element: <SetupProfile />
    },
    {
        path :"/search",
        element:<SearchResults/>
    }


]);
export default router;