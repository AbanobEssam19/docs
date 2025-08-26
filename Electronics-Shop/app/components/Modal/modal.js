'use client'
import { useEffect, useState, useRef } from "react";
import styles from "./modal.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/states/reducers/userSlice";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

export default function Modal() {

  const product = useSelector((state) => state.modalData.data);
  const user = useSelector((state) => state.userData.data);

  const dispatch = useDispatch();

  const closeBtn = useRef(null);

  const [amount, setAmount] = useState(1);
  const amountRef = useRef();

  function increaseAmount() {
    amountRef.current.value = parseInt(amountRef.current.value) + 1;
    setAmount(amountRef.current.value);
  }

  function decreaseAmount() {
    if (amountRef.current.value > 1)
      amountRef.current.value = amountRef.current.value - 1;
    setAmount(amountRef.current.value);
  }

  async function addItem() {
    let token = localStorage.getItem("token");

    if (!token) token = sessionStorage.getItem("token");

    const res = await fetch(`/api/cartitem/${product._id}/${amount}/false`, {
      method: "POST",
      headers: {
        token: `${token}`,
      },
    });

    const data = await res.json();

    const alert = document.getElementById("alertContainer");

    if (data.success) {
      dispatch(updateUser(data.user));
      
      alert.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          <strong>Success!</strong> Item added to cart.
        </div>
      `;
    }
    else {
      alert.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          You need to login first!
        </div>
      `;
    }
  }

  const [inWishList, setInWishList] = useState(false);

  useEffect(() => {
    setInWishList(false);
    user && product && user.wishlist.map((id) => {
      if (id == product._id) {
        setInWishList(true);
        return;
      }
    });
  }, [user, product]);

  const wishListHandler = async () => {
    if (!user) {
      const alert = document.getElementById("alertContainer");
      alert.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          You need to login first!
        </div>
      `;
      return;
    }
    const res = await fetch(`/api/addtowishlist/${product._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.success) {
      setInWishList(!inWishList);
      dispatch(updateUser(data.user));
    } 
  };

  return (
    <div
      className="modal fade"
      id="modalProduct"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle"
      aria-hidden="true"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        role="document"
      >
        <div
          className={`modal-content ${styles.ModelContent}`}
        >
          <div
            className="modal-header border-0"
            style={{ position: "relative" }}
          >
            <h5 className="modal-title" id="exampleModalLongTitle"></h5>
            <button
              type="button"
              className={`col-1 close ${styles.closebtn}`}
              style={{ width: "36px" }}
              data-bs-dismiss="modal"
              aria-label="Close"
              ref={closeBtn}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className={`modal-body ${styles.ModelBody}`}>
            <div className={styles.LeftPart}>
              <img src={product && product.photo[0]} />
            </div>
            <div className={styles.RightPart}>
              <h1 className={styles.ProductText}>
                {product && product.name}
              </h1>
              <div className={styles.state} style={product && product.quantity > 0 ? {} : { backgroundColor: "#ff00000a" }}>
                <FontAwesomeIcon
                  icon={`fa-regular fa-circle-${product && product.quantity > 0 ? "check" : "xmark"}`}
                  style={product && product.quantity > 0 ? { color: "#54ca87" } : { color: "red" }}
                />
                <p style={product && product.quantity > 0 ? {} : { color: "red" }}>{product && product.quantity > 0 ? "In" : "Out of"} Stock</p>
              </div>
              <div className={styles.price}>
                <p>{product && product.price}.00 EGP</p>
                <del style={product && product.discount > 0 ? {} : { display: "none" }}>{product && Math.floor((product.price / (100 - product.discount)) * 100)}.00 EGP</del>
              </div>
              <div className={styles.buttonsBox}>
                <div className={styles.amountContainer}>
                  <button onClick={decreaseAmount} disabled={product && product.quantity == 0}>-</button>
                  <input
                    type="number"
                    value={amount}
                    ref={amountRef}
                    onChange={(e) => {
                      if (e.target.value === "") e.target.value = 1;
                      setAmount(e.target.value);
                    }}
                    disabled={product && product.quantity == 0}
                  />
                  <button onClick={increaseAmount} disabled={product && product.quantity == 0}>+</button>
                </div>
                <button disabled={product && product.quantity == 0} onClick={addItem} >Add to cart</button>
                <button onClick={wishListHandler}>
                  <FontAwesomeIcon icon={`fa-${inWishList ? "solid" : "regular"} fa-heart`} style={inWishList ? { color: "red" } : {}} />
                  <p>{inWishList ? "Remove from" : `Add to`} wishlist</p>
                </button>
              </div>
              <div className={styles.cartAmount}>
                <FontAwesomeIcon icon="fa-solid fa-bag-shopping" />
                <p>
                  <strong>Other people want this</strong>, {product && product.popularity} people have
                  this in their carts right now.
                </p>
              </div>
              <div className={styles.categories}>
                <p style={{ display: "inline" }}>categories: </p>
                {product && product.categories && product.categories.map((category) => (
                  <><Link href={`/pages/products?category=${category.toLowerCase()}`} onClick={() => closeBtn.current.click()} >{category}</Link>  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}