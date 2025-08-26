import { updateModal } from "@/app/states/reducers/modalSlice";
import styles from "./card.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Link from "next/link";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/states/reducers/userSlice";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

export default function Card({ product }) {
  const dispatch = useDispatch();

  if (!product) {
    return <div>Loading...</div>;
  }

  async function addItem() {
    let token = localStorage.getItem("token");

    if (!token) token = sessionStorage.getItem("token");

    const res = await fetch(`/api/cartitem/${product._id}/${1}/false`, {
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

  const user = useSelector((state) => state.userData.data);

  const [inCart, setInCart] = useState(false);
  const [inWishList, setInWishList] = useState(false);
  const heartIconRef = useRef(null);
  useEffect(() => {
    setInCart(false);
    if (user && product) {
      const exist = user.cart.find((item) => item.productID == product._id);
      if (exist) setInCart(true);
  }
  }, [user, product]);
  useEffect(() => {
    setInWishList(false);
    if (user && product) {
      const inside = user.wishlist.find((el) => el == product._id);
      if (inside) setInWishList(true);
    }
  }, [user, product]);
  useEffect(() => {
    if (inWishList) {
      heartIconRef.current.style.color = "red";
    } else {
      heartIconRef.current.style.color = "black";
    }
  }, [inWishList]);
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
    <div className={`${styles.wholeCard}`}>
      <div className={styles.cardImg}>
        <Link href={`/pages/product?id=${product._id}`}>
          <img src={product.photo[0]} />
          <div
            className={styles.discount}
            style={product.discount != 0 ? {} : { display: "none" }}
          >
            {product.discount}%
          </div>
        </Link>
        <div className={styles.wish}>
          <button className={styles.wishList} onClick={wishListHandler}>
            <FontAwesomeIcon
              ref={heartIconRef}
              icon={`fa-${inWishList ?  "solid" : "regular"} fa-heart`}
              style={{ width: "35px", height: "14px" }}
            />
          </button>
        </div>
        {/* <!-- Button trigger modal --> */}
        <button
          type="button"
          className={`btn btn-light ${styles.eye}`}
          data-bs-toggle="modal"
          data-bs-target="#modalProduct"
          onClick={() => dispatch(updateModal(product))}
        >
          <FontAwesomeIcon
            icon="fa-regular fa-eye"
            style={{ width: "35px", height: "14px", color: "black" }}
          />
        </button>
      </div>
      <Link href={`/pages/product?id=${product._id}`} className={styles.anchor}>
        <h3 className={styles.title}>{product.name}</h3>
      </Link>
      <div className={styles.lowerPart}>
        <div className={styles.price}>
          <span style={product.discount != 0 ? {} : { display: "none" }}>
            {Math.floor((product.price / (100 - product.discount)) * 100)}.00EGP
          </span>
          <p>{product.price}.00EGP</p>
        </div>
        <button
          className={styles.shoppingCart}
          onClick={addItem}
          disabled={inCart || product.quantity == 0}
        >
          <FontAwesomeIcon
            icon={`fa-solid fa-${inCart ? "check" : "cart-shopping"}`}
            style={{
              width: "30px",
              height: "14px",
              color: "black",
              marginTop: "5px",
            }}
          />
        </button>
      </div>
    </div>
  );
}
