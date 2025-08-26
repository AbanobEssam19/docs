"use client";
import Carousel from "../../components/Carousel/carousel";
import styles from "./page.module.css";
import Link from "next/link";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Card from "@/app/components/Card/card";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/app/states/reducers/userSlice";

import Error from "../Error/page";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

export default function Product() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const products = useSelector((state) => state.productsData.data);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (products) {
      const foundProduct = products.find((product) => product._id == productId);
      setProduct(foundProduct);
    }
  }, [productId, products]);

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
  const user = useSelector((state) => state.userData.data);

  const dispatch = useDispatch();

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

  if (!product) {
    return <Error />;
  }

  return (
    <>
      <div className={`container ${styles.main}`}>
        <div className={styles.product}>
          <Carousel product={product} />
          <div className={styles.productDetails}>
            <h3 className={styles.title}>{product.name}</h3>
            <div className={styles.state} style={product.quantity > 0 ? {} : { backgroundColor: "#ff00000a" }}>
              <FontAwesomeIcon
                icon={`fa-regular fa-circle-${product.quantity > 0 ? "check" : "xmark"}`}
                style={product.quantity > 0 ? { color: "#54ca87" } : { color: "red" }}
              />
              <p style={product.quantity > 0 ? {} : { color: "red" }}>{product.quantity > 0 ? "In" : "Out of"} Stock</p>
            </div>
            <div className={styles.price}>
              <p>{product.price}.00 EGP</p>
              <del>
                {Math.floor((product.price / (100 - product.discount)) * 100)}.00 EGP
              </del>
            </div>
            <div className={styles.buttonsBox}>
              <div className={styles.amountContainer}>
                <button onClick={decreaseAmount} disabled={product.quantity == 0}>-</button>
                <input
                  type="number"
                  value={amount}
                  ref={amountRef}
                  onChange={(e) => {
                    if (e.target.value === "") e.target.value = 1;
                    setAmount(e.target.value);
                  }}
                  disabled={product.quantity == 0}
                />
                <button onClick={increaseAmount} disabled={product.quantity == 0}>+</button>
              </div>
              <button disabled={product.quantity == 0} onClick={addItem} >Add to cart</button>
              <button onClick={wishListHandler}>
                <FontAwesomeIcon icon={`fa-${inWishList ?  "solid" : "regular"} fa-heart`} style={inWishList ? { color: "red" } : {}} />
                <p>{inWishList ? "Remove from" : `Add to`} wishlist</p>
              </button>
            </div>
            <div className={styles.cartAmount}>
              <FontAwesomeIcon icon="fa-solid fa-bag-shopping" />
              <p>
                <strong>Other people want this</strong>, {product.popularity}{" "}
                people have this in their carts right now.
              </p>
            </div>
            <div className={styles.categories}>
              <p style={{ display: "inline" }}>categories: </p>
              {product.categories.map((category) => {
                return <>
                  <Link
                    key={category}
                    href={`/pages/products?category=${category.toLowerCase()}`}
                  >
                    {category}
                  </Link>{" "}
                  </>
              })}
            </div>
          </div>
        </div>
        <div className={styles.productDescription}>
          <h4>Description:</h4>
          <div>
            {product.description.map((desc) => {
              return <p>{desc}</p>;
            })}
            <br />
            <br />
            <strong style={{fontSize: "larger"}}>Specifications:</strong>
            {product.specifications.map((spec) => {
              return <p>{spec}</p>;
            })}
          </div>
        </div>
        <RelatedProducts product={product} />
      </div>
    </>
  );
}

function RelatedProducts({ product }) {
  const products = useSelector((state) => state.productsData.data);
  const container = useRef();
  const [RelatedProducts, setRelatedProducts] = useState(null);
  useEffect(() => {
    if (!products) {
      return;
    }
    let set = new Set();
    product.categories.map((cat) => {
      products.map((pro) => {
        product != pro && pro.categories.includes(cat) && set.add(pro);
      });
    });
    setRelatedProducts(set);
  }, [product, products]);

  function slideLeft() {
    container.current.scrollBy({ left: -260, behavior: "smooth" });
  }

  function slideRight() {
    container.current.scrollBy({ left: 260, behavior: "smooth" });
  }

  return (
    <div className={`${styles.section}`}>
      <div className={styles.header}>
        <h4>Related Products </h4>
      </div>
      <div className={styles.content}>
        <button onClick={slideLeft}>&lt;</button>
        <div className={styles.cardContainer} ref={container}>
          {RelatedProducts &&
            Array.from(RelatedProducts).map((rel, index) => (
              <Card key={index} product={rel} />
            ))}
        </div>
        <button onClick={slideRight}>&gt;</button>
      </div>
    </div>
  );
}
