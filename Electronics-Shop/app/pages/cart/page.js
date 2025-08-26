'use client'
import styles from "./page.module.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Link from "next/link";

import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/states/reducers/userSlice";
import { useEffect, useState, useRef } from "react";
import EmptyCart from "../EmptyCart/page";
import Error from "../Error/page";

function CartItem({ product, cart, clearCoupon }) {


    const dispatch = useDispatch();

    async function removeItem() {
        let token = localStorage.getItem('token');

        if (!token)
            token = sessionStorage.getItem('token');

        const res = await fetch(`/api/cartitem/${product._id}`, {
            method: "DELETE",
            headers: {
                'token': `${token}`
            }
        });

        const data = await res.json();
        if (data.success) {
            dispatch(updateUser(data.user));
        }

        clearCoupon();
    }

    const [itemQuantity, setItemQuantity] = useState(cart.quantity);

    const quantityInput = useRef(null);

    useEffect(() => {
        quantityInput.current.value = cart.quantity;
        setItemQuantity(cart.quantity);
    }, [cart]);

    async function setQuantity(num) {
        const quantity = (quantityInput.current.value != "" && parseInt(quantityInput.current.value)) + parseInt(num);

        if (quantity <= 0) {
            removeItem();
            return;
        }

        let token = localStorage.getItem('token');

        if (!token)
            token = sessionStorage.getItem('token');

        const res = await fetch(`/api/cartitem/${product._id}/${quantity}`, {
            method: "PUT",
            headers: {
                'token': `${token}`
            }
        });

        const data = await res.json();
        if (data.success) {
            dispatch(updateUser(data.user));
            quantityInput.current.value = quantity;
            setItemQuantity(quantity);
        }

        clearCoupon();
    }

    return (
        <tr className={styles.item} >
            <td>
                <img src={product.photo[0]} />
                <p>{product.name}</p>
            </td>
            <td className={styles.price} >{product.price}.00 EGP</td>
            <td>
                <div className={styles.amountContainer}>
                    <button onClick={() => setQuantity(-1)}>-</button>
                    <input type="number" ref={quantityInput} onBlur={() => setQuantity(0)} />
                    <button onClick={() => setQuantity(1)}>+</button>
                </div>
            </td>
            <td className={styles.total} >{itemQuantity * product.price}.00 EGP</td>
            <td>
                <button onClick={removeItem}>
                    <FontAwesomeIcon
                        icon="fa-solid fa-xmark" />
                </button>
            </td>
        </tr>
    )
}

export default function ShoppingCart() {

    const user = useSelector((state) => state.userData.data);

    const [coupons, setCoupons] = useState(null);

    useEffect(() => {
        async function getCoupons() {
            const res = await fetch("/api/coupons");
            const data = await res.json();
            setCoupons(data.coupons);
        }

        getCoupons();
    }, []);

    const shippingText = useRef();

    const [shipping, setShipping] = useState(true);

    function ShippingDeclaration(e) {
        let id = e.target.id;
        if (id == "shipping") {
            shippingText.current.innerText = "Shipping price will be added during checkout";
            setShipping(true);
        }
        else if (id == "pickup") {
            shippingText.current.innerText = "Address : El-Abbasiya Street El Weili, Cairo - Egypt";
            setShipping(false);
        }
    }

    const [coupon, setCoupon] = useState("");

    const [couponItem, setCouponItem] = useState(null);

    const couponText = useRef(null);

    function clearCoupon() {
        setCoupon("");
        setCouponItem(null);
        couponText.current.innerText = "";
    }

    function checkCoupon() {
        if (coupon == "") {
            return;
        }
        setCouponItem(null);
        couponText.current.innerText = "Coupon not found";
        couponText.current.style.color = "red";
        coupons.map((item) => {
            if (item.code == coupon) {
                if (new Date(item.expiryDate) <= new Date()) {
                    couponText.current.innerText = "Coupon expired";
                    return;
                }
                
                if (item.minPurchase > user.total) {
                    couponText.current.innerText = `Coupon applies to ${item.minPurchase} EGP or more`;
                    return;
                }

                if (item.newUser && user.orders.length > 0) {
                    couponText.current.innerText = "Coupon applies to new users only";
                    return;
                }
                
                if (user.usedCoupons.includes(item._id)) {
                    couponText.current.innerText = "Coupon applied before";
                    return;
                }
                
                setCouponItem(item);
                couponText.current.innerText = "Coupon applied successfully";
                couponText.current.style.color = "green";
                return;
            }
        });
    }

    if (!user) {
        return <Error />;
    }

    if (user && !user.cart.length) {
        return <EmptyCart />;
    }

    return (
        <div className={`container ${styles.main}`} >
            <div className={styles.content} >
                <div className={styles.products} >
                    <table >
                        <thead>
                            <tr>
                                <th style={{ width: "50%" }} >PRODUCT</th>
                                <th style={{ width: "15%" }} >UNIT PRICE</th>
                                <th style={{ width: "15%" }} >QUANTITY</th>
                                <th style={{ width: "15%" }} >SUBTOTAL</th>
                                <th style={{ width: "5%" }} ></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                user.cart.map((item) => {
                                    return <CartItem key={item.product._id} product={item.product} cart={item} clearCoupon={clearCoupon} />;
                                })
                            }
                        </tbody>
                    </table>
                    <div className={styles.couponSection}>
                        <input type="text" placeholder="Coupon code" value={coupon} onChange={(e) => {setCoupon(e.target.value)}} />
                        <button onClick={checkCoupon}>Apply</button>
                    </div>
                    <p className={styles.couponText} ref={couponText}></p>
                </div>
                <div className={styles.totalSection}>
                    <p>CART TOTAL</p>
                    <div className={styles.section}>
                        <strong>Subtotal</strong>
                        <p>{user.total}.00 EGP</p>
                    </div>
                    <div className={`${styles.shippingOptions} ${styles.section}`} >
                        <strong>Shipping</strong>
                        <div>
                            <div>
                                <input type='radio' id='shipping' value='shipping' name='shippingOptions' defaultChecked onChange={ShippingDeclaration} />
                                <label htmlFor='shipping' >Shipping</label>
                            </div>
                            <div>
                                <input type='radio' id='pickup' value='pickup' name='shippingOptions' onChange={ShippingDeclaration} />
                                <label htmlFor='pickup' >Pick up from store</label>
                            </div>
                            <p ref={shippingText}>Shipping price will be added during checkout</p>
                        </div>
                    </div>
                    <div className={styles.discountSection}>
                        <strong>Discount</strong>
                        <p>{couponItem ? -couponItem.discount : 0}.00 EGP</p>
                    </div>
                    <div className={styles.section} >
                        <strong>Total</strong>
                        <p>{couponItem ? user.total - couponItem.discount : user.total}.00 EGP</p>
                    </div>
                    <Link href={`/pages/checkout?shipping=${shipping}&coupon=${couponItem ? couponItem._id : ""}`} >Proceed to checkout</Link>
                </div>
            </div>
        </div>
    )
}