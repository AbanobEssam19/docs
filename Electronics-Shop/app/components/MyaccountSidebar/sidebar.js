'use client'
import styles from "./sidebar.module.css";
import Link from "next/link";

export default function MyaccountSidebar(props) {
    const num = props.num; //color

    function logout() {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        window.location.href = "/";
    }

    return (
        <div className = {styles.SideBar}>
            <Link href = "/pages/myaccount" style={num ==  1? {color: "var(--main)"} : {} }>Account Details</Link>
            <Link href = "/pages/myaccount/orders" style={num ==  2? {color: "var(--main)"} : {} }>Orders</Link>
            <Link href = "/" onClick={logout} >Logout</Link>
        </div>
    )
}