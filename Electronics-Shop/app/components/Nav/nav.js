"use client";
import styles from "./nav.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUser, fetchProducts, fetchCarts } from "@/app/states/APIs/apis";
import { updateUser } from "@/app/states/reducers/userSlice";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

function CartItem({ product, cart }) {
  const dispatch = useDispatch();

  if (!product) {
    return <div>Loading...</div>;
  }

  async function removeCartItem() {
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
  };

  const [itemQuantity, setItemQuantity] = useState(cart.quantity);

  useEffect(() => {
    setItemQuantity(cart.quantity);
  }, [cart])

  async function setQuantity(num) {
    const quantity = parseInt(itemQuantity) + parseInt(num);

    if (quantity <= 0) {
      removeCartItem();
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
      setItemQuantity(quantity);
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.cartItemContainer} >
      <div className={styles.imgContainer} >
        <img src={product.photo[0]} />
      </div>
      <div className={styles.itemInfo} >
        <div className={styles.itemInfoHead}>
          <p className={styles.title} >{product.name}</p>
          <button onClick={removeCartItem}>
            <FontAwesomeIcon
              icon="fa-solid fa-xmark" />
          </button>
        </div>
        <div className={styles.quantity} >
          <div className={styles.quantityButtons} >
            <button onClick={() => setQuantity(-1)}>-</button>
            {itemQuantity}
            <button onClick={() => setQuantity(1)}>+</button>
          </div>
          <p className={styles.price} >{product.price * itemQuantity}.00 EGP</p>
        </div>
      </div>
    </div>
  )
}

function Nav1() {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.userData.data);

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token)
      token = sessionStorage.getItem('token');
    dispatch(fetchUser(token));
    dispatch(fetchProducts());
  }, []);

  const cartButton = useRef(null);
  const closeCartButton = useRef(null);

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const alert = document.getElementById("alertContainer");
    setAlert(alert);
  }, [])

  function showError() {
    alert.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        You need to login first!
      </div>
    `;
  }

  function checkUser() {
    if (user == null) {
      showError();
    }
    else if (window.location.pathname == "/pages/checkout") {
      window.location.href = "/pages/cart";
    }
    else if (window.location.pathname != "/pages/cart") {
      cartButton.current.click();
    }
  }

  const searchBtn = useRef(null);

  const [searchValue, setSearchValue] = useState("");

  return (
    <div className={`container ${styles.nav1}`}>
      <Link href="/" className={styles.navHeader}>
        <div className={styles.logoContainer}>
          <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1727851294/logo_zdcp3q.png" />
        </div>
        <h1>AB Electronics</h1>
      </Link>

      <div className={styles.searchBarContainer}>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Search for products..."
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key == "Enter" && searchBtn.current.click()}
        />
        <Link className={styles.searchBtn} href={`/pages/products?search=${searchValue}`} ref={searchBtn}>
          <FontAwesomeIcon
            icon="fa-solid fa-magnifying-glass"
          />
        </Link>
      </div>

      <Link href={user ? "/pages/myaccount" : "/pages/sign"} className={styles.navBtns}>
        <FontAwesomeIcon
          icon="fa-regular fa-user"
          style={{ width: "30px", height: "25px" }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {user ? <p style={{ color: "gray", fontSize: "small" }}>Welcome</p> : ""}
          <p style={{ fontWeight: "bold" }}>{user ? user.username : "Sign in"}</p>
        </div>
      </Link>

      <Link
        onClick={() => !user && showError()}
        href="/pages/wishlist"
        className={`${styles.navBtns} ${styles.wishlist}`}
        title="Wishlist"
      >
        <div className={styles.counter}>
          <p>{user ? user.wishlist.length : 0}</p>
        </div>
        <FontAwesomeIcon
          icon="fa-regular fa-heart"
          style={{ width: "40px", height: "30px" }}
        />
      </Link>

      <button className={styles.navBtns} onClick={checkUser}>
        <div className={styles.counter}>
          <p>{user ? user.cart.length : 0}</p>
        </div>
        <FontAwesomeIcon
          icon="fa-solid fa-cart-shopping"
          style={{ width: "40px", height: "30px" }}
        />
      </button>
      <button data-bs-toggle="offcanvas"
        data-bs-target="#cartSideBar"
        style={{ display: "none" }}
        ref={cartButton}></button>
      <div
        className={`offcanvas offcanvas-end`}
        id="cartSideBar"
      >
        <div className={`offcanvas-header ${styles.cartHeader}`}>
          <p>CART ({user ? user.cart.length : 0})</p>
          <button type="button" data-bs-dismiss="offcanvas" ref={closeCartButton}>
            <FontAwesomeIcon
              icon="fa-solid fa-xmark"
              style={{ width: "20px", height: "20px" }}
            />
          </button>
        </div>
        <div className={`offcanvas-body ${styles.cartBody}`}>
          <div className={styles.itemContainer}>
            {
              user && user.cart.map((item) => {
                return <CartItem key={item.product._id} product={item.product} cart={item} />;
              })
            }
          </div>
          <div className={styles.cartFooter}>
            <div className={styles.total}>
              <p>TOTAL:</p>
              <p>{user && user.total}.00 EGP</p>
            </div>
            <div className={styles.footerLinks}>
              <Link href="/pages/cart" onClick={() => closeCartButton.current.click()} >VIEW CART</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Nav2() {
  const user = useSelector((state) => state.userData.data);

  const closeMenuButton = useRef(null);

  const [searchValue, setSearchValue] = useState("");
  const searchBtn = useRef(null);

  const products = useSelector((state) => state.productsData.data);

  const [categories, setCategories] = useState(null);

  const [alert, setAlert] = useState(null);

  useEffect(() => {
    let set = new Set();

    set.add("All");

    products && products.map((product) => {
      for (const category of product.categories) {
        set.add(category);
      }
    });

    setCategories([...set]);
  }, [products]);

  const cartButton = useRef(null);

  useEffect(() => {
    const alert = document.getElementById("alertContainer");
    setAlert(alert);
  }, [])

  function showError() {
    alert.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        You need to login first!
      </div>
    `;
  }

  function checkUser() {
    if (user == null) {
      showError();
    }
    else {
      cartButton.current.click();
    }
  }

  return (
    <div className={`container-fluid ${styles.nav2}`}>
      <div className={`container ${styles.contentContainer}`}>
        <ul className={styles.mainNav}>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li className={styles.categoriesLink}>
            <p>
              Categories <FontAwesomeIcon icon="fa-solid fa-caret-down" />
            </p>
            <div className={styles.categoriesDropDown}>
              <ul>
                {
                  categories && categories.map((category) => {
                    return <li key={category}><Link href={`/pages/products?category=${category.toLowerCase()}`}>{category}</Link></li>
                  })
                }
              </ul>
            </div>
          </li>
          <li>
            <Link href="/pages/printing">3D Printing</Link>
          </li>
          <li>
            <Link href="/pages/contact">Contact Us</Link>
          </li>
        </ul>

        <button
          className={styles.menuBtn}
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#navSideBar"
        >
          <FontAwesomeIcon
            className={styles.menuIcon}
            icon="fa-solid fa-bars"
          />
          <p>Menu</p>
        </button>

        <div className={styles.searchBarContainer}>
          <input
            type="text"
            className={styles.searchBar}
            placeholder="Search for products..."
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => e.key == "Enter" && searchBtn.current.click()}
          />
          <Link className={styles.searchBtn} href={`/pages/products?search=${searchValue}`} ref={searchBtn}>
            <FontAwesomeIcon
              icon="fa-solid fa-magnifying-glass"
            />
          </Link>
        </div>

        <button
          data-bs-toggle="offcanvas"
          data-bs-target="#cartSideBar" style={{ display: "none" }} ref={cartButton}></button>

        <button className={styles.navBtns} onClick={checkUser}>
          <FontAwesomeIcon
            icon="fa-solid fa-cart-shopping"
            style={{ width: "40px", height: "30px" }}
          />
        </button>
      </div>

      <div
        className={`offcanvas offcanvas-start`}
        id="navSideBar"
        style={{ width: "350px" }}
      >
        <div className={`offcanvas-header ${styles.sideBarHeader}`}>
          <div className={styles.sideBarLogo}>
            <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1727851295/side-bar-logo_jgrp2c.png" />
          </div>
          <button type="button" data-bs-dismiss="offcanvas" ref={closeMenuButton} >
            <FontAwesomeIcon
              icon="fa-solid fa-xmark"
              style={{ width: "20px", height: "20px" }}
            />
          </button>
        </div>
        <div className={`offcanvas-body ${styles.sideBarBody}`}>
          <li className={styles.sideNavItem}>
            <Link href="/" onClick={() => closeMenuButton.current.click()}>
              <FontAwesomeIcon icon="fa-solid fa-house" /> Home
            </Link>
          </li>
          <li className={styles.sideNavItem}>
            <button
              className={styles.categoriesBtn}
              data-bs-toggle="collapse"
              data-bs-target="#categoriesCollapse"
            >
              <FontAwesomeIcon icon="fa-solid fa-list" /> Categories
            </button>
          </li>
          <div
            id="categoriesCollapse"
            className={`collapse ${styles.categoriesSideNav}`}
          >
            {
              categories && categories.map((category) => {
                return (
                  <li key={category} className={styles.sideNavItem}>
                    <Link href={`/pages/products?category=${category.toLowerCase()}`} onClick={() => closeMenuButton.current.click()}>
                      {category}
                    </Link>
                  </li>
                );
              })
            }
          </div>
          <li className={styles.sideNavItem}>
            <Link href="/pages/printing" onClick={() => closeMenuButton.current.click()}>
              <FontAwesomeIcon icon="fa-brands fa-unity" /> 3D Printing
            </Link>
          </li>
          <li className={styles.sideNavItem}>
            <Link href="/pages/contact" onClick={() => closeMenuButton.current.click()}>
              <FontAwesomeIcon icon="fa-solid fa-address-card" /> Contact Us
            </Link>
          </li>
          <li className={styles.sideNavItem}>
            <Link href="/pages/wishlist" onClick={() => closeMenuButton.current.click()}>
              <FontAwesomeIcon icon="fa-solid fa-heart" /> Wishlist
            </Link>
          </li>
          <li className={styles.sideNavItem}>
            <Link href={user ? "/pages/myaccount" : "/pages/sign"} onClick={() => closeMenuButton.current.click()}>
              <FontAwesomeIcon icon="fa-solid fa-user" /> {user ? "My account" : "Sign in"}
            </Link>
          </li>
        </div>
      </div>
    </div>
  );
}

export default function Nav() {

  return (
    <div className={styles.main}>
      <Nav1 />
      <Nav2 />
    </div>
  );
}
