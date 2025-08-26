"use client";
import { updateUser } from "@/app/states/reducers/userSlice";
import styles from "./page.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Error from "../Error/page";
import EmptyWishlist from "../EmptyWishlist/page";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

function WishlistItem({ id, setSelectedItems }) {
  const products = useSelector((state) => state.productsData.data);
  const [product, setProduct] = useState(null);

  const dispatch = useDispatch();
  useEffect(() => {
    if (products) setProduct(products.find((el) => el._id == id));
  }, [products]);

  if (!product) {
    return <div>loading...</div>;
  }

  const inStockStatusIcon = (
    <div className={product.quantity ? styles.state : styles.state2}>
      <FontAwesomeIcon
        icon={
          product.quantity
            ? "fa-regular fa-circle-check"
            : "fa-solid fa-circle-xmark"
        }
      />
      <p className={styles.stockStatus}>
        {product.quantity ? "In Stock" : "Out of Stock"}
      </p>
    </div>
  );

  const handleCheck = (e) => {
    if (e.target.checked) {
      setSelectedItems((prev) => [...prev, product]);
    } else {
      setSelectedItems((prev) => prev.filter((el) => el._id !== product._id));
    }
  };

  async function addToCart() {
    let token = localStorage.getItem("token");

    if (!token) token = sessionStorage.getItem("token");

    const res = await fetch(`/api/cartitem/${product._id}/${1}/true`, {
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
  }

  return (
    <tr>
      <td>
        <input
          onChange={handleCheck}
          type="checkbox"
          className={styles.center}
        />
      </td>
      <td className={styles.productImg}>
        <div className={styles.center}>
          <img
            className={styles.product_image}
            src={`${product["photo"][0]}`}
          />
        </div>
      </td>
      <td className={styles.productName}>{product.name}</td>
      <td>{product.price} EGP</td>
      <td>{inStockStatusIcon}</td>
      <td>
        <div className={styles.center}>
          <button className={styles.add_to_cart_button} onClick={addToCart}>Add to Cart</button>
        </div>
      </td>
    </tr>
  );
}

export default function Wishlist() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userData.data);
  const [selectedItems, setSelectedItems] = useState([]);
  const actionRef = useRef(null);

  const alertContainer = document.getElementById("alertContainer");

  const handleAddAll = async () => {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.success) {
      dispatch(updateUser(data.user));
      alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          <strong>Success!</strong> Items added to cart.
        </div>
      `;
    }
  };
  const handleRemoveAll = async () => {
    const res = await fetch("/api/wishlist", {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (data.success) {
      dispatch(updateUser({ ...user, wishlist: [] }));
    }
  };
  const handleApply = async () => {
    let res = await fetch("/api/wishlistsome", {
      method: `${actionRef.current.value == "add" ? "POST" : "DELETE"}`,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ selectedItems: selectedItems, user: user }),
    });
    const data = await res.json();
    if (data.success) {
      setSelectedItems([]);
      dispatch(updateUser(data.user));
      if (actionRef.current.value == "add") {
        alertContainer.innerHTML = `
          <div class="alert alert-success alert-dismissible fade show ${alertStyles.alert}">
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            <strong>Success!</strong> Items added to cart.
          </div>
        `;
      }
    }
  };

  if (!user) {
    return <Error />;
  }

  if (user.wishlist.length == 0) {
    return <EmptyWishlist />;
  }

  return (
    <>
      <div className={`container ${styles.main}`}>
        <h1>Your Wishlist</h1>
        <table style={{ overflow: "auto" }}>
          <thead>
            <tr>
              <th></th>
              <th className={styles.tableHeadPhoto}></th>
              <th>Product Name</th>
              <th>Unit Price</th>
              <th>Stock Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {user &&
              user.wishlist.map((id) => {
                return (
                  <WishlistItem
                    key={id}
                    selectedItems={selectedItems}
                    setSelectedItems={setSelectedItems}
                    id={id}
                  />
                );
              })}
          </tbody>
        </table>

        <div className={styles.bom}>
          <div className={styles.ri}>
            <select
              ref={actionRef}
              className={styles.sco}
              name="cars"
              id="cars"
            >
              <option disabled>ACTIONS</option>
              <option value="add">Add to cart</option>
              <option value="remove">Remove</option>
            </select>
            <button onClick={handleApply} className={styles.bot}>
              Apply
            </button>
          </div>
          <div className={styles.ff}>
            <button onClick={handleRemoveAll} className={styles.bot}>
              Remove All
            </button>
            <button onClick={handleAddAll} className={styles.bot}>
              Add All to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
