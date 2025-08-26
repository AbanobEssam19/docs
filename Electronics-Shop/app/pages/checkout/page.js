'use client'
import styles from "./page.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { updateUser } from "@/app/states/reducers/userSlice";
import Error from "../Error/page";
import EmptyCart from "../EmptyCart/page";
import Link from "next/link";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

export default function Checkout() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userData.data);

  const searchParams = useSearchParams();
  const shipping = searchParams.get('shipping');
  const couponID = searchParams.get('coupon');

  const [coupons, setCoupons] = useState(null);

  useEffect(() => {
    async function getCoupons() {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data.coupons);
    }

    getCoupons();
  }, []);

  const [coupon, setCoupon] = useState(null);

  useEffect(() => {
    if (!coupons)
      return;

    const coupon = coupons.find(coupon => coupon._id == couponID);

    setCoupon(coupon);
  }, [couponID, coupons]);

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    region: '',
    notes: '',
    shipping: 0
  });

  useEffect(() => {
    if (!user)
      return;
    setUserData({
      ...userData,
      firstName: user.firstname,
      lastName: user.lastname,
      address: user.address,
      city: user.city,
      region: user.region,
      shipping: shipping == "true" ? 50 : 0
    });

    const cityField = document.getElementById("city");
    if (cityField) {
      cityField.value = user.city;
    }
  }, [user, shipping])

  function updateData(e) {
    const { id, value } = e.target;
    setUserData({
      ...userData,
      [id]: value
    });
  };

  const ordersPageRef = useRef(null);

  async function checkout(e) {
    e.preventDefault();

    const alert = document.getElementById("alertContainer");

    if (userData.firstName == '' || userData.lastName == '' || userData.address == '' || userData.city == '' || userData.region == '') {
      alert.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          Please fill in all the required fields.
        </div>
      `;
      return;
    }

    const res = await fetch(`/api/order/${user._id}/${coupon ? coupon._id : "none"}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await res.json();

    if (data.success) {
      dispatch(updateUser(data.user));
      alert.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          Your order has been placed.
        </div>
      `;
      ordersPageRef.current.click();
    }
    else {
      alert.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          ${data.error}
        </div>
      `;
    }

  }

  if (!user) {
    return <Error />;
  }

  if (!shipping) {
    return (
      <div style={{ minHeight: '500px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '25px' }}>You need to choose shipping method first, <Link href="/pages/cart" style={{ color: 'var(--main)' }}>from here.</Link></p>
      </div>
    )
  }

  if (!user.cart.length) {
    return <EmptyCart />;
  }

  return (
    <form className="container" style={{ marginTop: '50px' }}>
      <Link href="/pages/myaccount/orders" style={{ display: 'none' }} ref={ordersPageRef}></Link>
      <div className={`container ${styles.main}`}>
        <div className={styles.formClass}>
          <div className={styles.inputCollection}>
            <div className={styles.inputWrapper}>
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                value={userData.firstName}
                onChange={updateData}
                required
              />
            </div>
            <div className={styles.inputWrapper}>
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                value={userData.lastName}
                onChange={updateData}
                required
              />
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="address">Street address *</label>
            <input
              type="text"
              id="address"
              value={userData.address}
              onChange={updateData}
              required
              placeholder="House number and street name"
            />
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="city">City *</label>
            <select id="city" required onChange={updateData}>
              <option value="Giza">Giza</option>
              <option value="Cairo">Cairo</option>
            </select>
          </div>
          <div className={styles.inputWrapper}>
            <label htmlFor="city">Region *</label>
            <input
              type="text"
              id="region"
              value={userData.region}
              onChange={updateData}
              required
            />
          </div>
          <div className={styles.inputCollection}>
            <div className={styles.inputWrapper}>
              <label htmlFor="phone">Phone *</label>
              <input
                type="text"
                id="phone"
                value={user && user.phone}
                required
                disabled
              />
            </div>
            <div className={styles.inputWrapper}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={user && user.email}
                required
                disabled
              />
            </div>
          </div>
          <h6 style={{ fontWeight: 'bold' }}>Additional information</h6>
          <div className={styles.inputWrapper}>
            <label htmlFor="notes">Order Notes</label>
            <textarea
              style={{ borderRadius: '8px', height: '100px', padding: '10px' }}
              id="notes"
              placeholder="Notes about your order"
              value={userData.notes || ''}
              onChange={updateData}
            />
          </div>
        </div>
        <div className={` ${styles.order} container`}>
          <h6 style={{ fontWeight: "bold" }}>YOUR ORDER</h6>

          <div className={styles.orderTable}>
            <div className={styles.orderHeader}>
              <p>Product</p>
              <p>Subtotal</p>
            </div>
            <div className={styles.orderBody}>
              {
                user && user.cart.map((item) => {
                  return (
                    <div className={styles.orderData} key={item.productID}>
                      <p>{item.product.name} <span style={{ color: "red" }}>x{item.quantity}</span></p>
                      <p>{item.product.price * item.quantity}.00 EGP</p>
                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className={styles.orderHeader} >
            <h6 style={{ fontWeight: "bold" }}>Cash on Delivery</h6>
            <p>{userData.shipping || 0}.00 EGP</p>
          </div>
          <div className={styles.group}>
            <p style={{ fontWeight: "bold" }}>Discount</p>
            <p style={{ fontWeight: "bold" }}>{coupon ? -coupon.discount : 0}.00 EGP</p>
          </div>
          <div className={styles.group}>
            <p style={{ fontWeight: "bold" }}>Total</p>
            <p style={{ fontWeight: "bold" }}>{(user.total + userData.shipping) - (coupon ? coupon.discount : 0)}.00 EGP</p>
          </div>
          <button type="submit" onClick={checkout}>Place Order</button>
        </div>
      </div>
    </form>
  );
}