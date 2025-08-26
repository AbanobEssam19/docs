'use client';
import MyaccountSidebar from "@/app/components/MyaccountSidebar/sidebar";

import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Error from "../../Error/page";

function OrderDetails ({order, printing}) {
    if (!order)
        return <div>Loading...</div>;
    const date = new Date(order.date);
    return (
        <div className= {styles.OrderDetails}>
            <p style = {{color: "red"}}>#{order.orderID}</p>
            <p style = {{color: "grey"}}>{date.toLocaleDateString()}</p>
            <p style = {{color: "grey"}}>{order.status}</p>
            <p style = {{color: "black"}}>{order.total} {!printing && "EGP"}</p>
        </div>
    )
}


export default function Orders () {
    const [orders, setOrders] = useState(null);
    const [printingOrders, setPrintingOrders] = useState(null);
    const user = useSelector((state) => state.userData.data);

    useEffect(() => {

        async function getOrders() {
            const res = await fetch('/api/orders');

            const data = await res.json();

            setOrders(data.orders);
        }

        getOrders();

        async function getPrintingOrders() {
            const res = await fetch('/api/printingorders'); 

            const data = await res.json();

            setPrintingOrders(data.orders);
            console.log(data.orders);
        }

        getPrintingOrders();
    }, []);

    if (!user || !orders || !printingOrders) {
        return <Error />;
    }

    return(
        <div className={`container ${styles.Orders}`} style={{minHeight : "500px"}}>
            <MyaccountSidebar num ={2}/>
            <div className = {styles.OrderIcons}>
                <div className = {styles.OrderText}>
                    <p>ORDER</p>
                    <p>DATE</p>
                    <p>STATUS</p>
                    <p>TOTAL</p>
                </div>
                {
                    user.orders.map((id) => {
                        const order = orders.find((order) => order._id === id);
                        return <OrderDetails key={order._id} order={order} printing={false} />;
                    })
                }
                {
                    user.printingOrders.map((id) => {
                        const order = printingOrders.find((order) => order._id === id);
                        return <OrderDetails key={order._id} order={order} printing={true} />;
                    })
                }
            </div>
        </div>
    )
}