'use client'
import styles from "./page.module.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Link from "next/link";

import Card from './components/Card/card';

import { useEffect, useRef, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { fetchProducts, fetchUser } from "./states/APIs/apis";

export default function Home() {
  return (
    <div className={styles.mainPage}>
      <div className={styles.mainContent}>
        <Carousel />
        <SpecialOffers />
        <NewProducts />
      </div>
    </div>
  );
}

function Carousel() {
  return (
    <div id="mainCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className={`carousel-indicators ${styles.marginZero}`}>
        <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="0" className="active"></button>
        <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="1"></button>
        <button type="button" data-bs-target="#mainCarousel" data-bs-slide-to="2"></button>
      </div>

      <div className="carousel-inner">
        <div className="carousel-item active">
          <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1727851295/mainCarousel_eqbvvk.jpg" className="d-block w-100" />
        </div>
        <div className="carousel-item">
          <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1727851295/shippingCarousel_z7gmek.jpg" className="d-block w-100" />
        </div>
        <div className="carousel-item">
          <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1727851294/3dPrintingCarousel_qcgzjq.jpg" className="d-block w-100" />
        </div>
      </div>

      <button className="carousel-control-prev" type="button" data-bs-target="#mainCarousel " data-bs-slide="prev">
        <span className={`carousel-control-prev-icon ${styles.prevIcon}`}></span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
        <span className={`carousel-control-next-icon ${styles.nextIcon}`}></span>
      </button>
    </div>
  );
}

function SpecialOffers() {

  const products = useSelector((state) => state.productsData.data);

  const [arr, setArr] = useState([]);

  useEffect(() => {
    if (!products)
      return;
    const filtered = [...products].filter((product) => product.discount > 0);
    setArr(filtered);
  }, [products]);

  
  const container = useRef();

  function slideLeft() {
    container.current.scrollBy({left: -260, behavior: 'smooth'});
  }

  function slideRight() {
    container.current.scrollBy({left: 260, behavior: 'smooth'});
  }

  return (
    <div className={`${styles.section}`}>
      <div className={styles.header}>
        <h4>Special Offers <FontAwesomeIcon icon="fa-solid fa-fire" style={{color: "#F8C051"}} /></h4>
        <Link href="/pages/products?category=all&sale=1">View All →</Link>
      </div>
      <div className={styles.content} >
        <button onClick={slideLeft} className={styles.sliderButton}>&lt;</button>
        <div className={styles.cardContainer} ref={container} >
          {
            arr.slice(0, Math.min(arr.length, 10)).map((product) => (
              <Card key={product._id} product={product} />
            ))
          }
        </div>
        <button onClick={slideRight} className={styles.sliderButton}>&gt;</button>
      </div>
    </div>
  );
}

function NewProducts() {

  const products = useSelector((state) => state.productsData.data);

  const [arr, setArr] = useState([]);

  useEffect(() => {
    if (!products)
      return;
    const sorted = [...products].sort((a, b) => new Date(b.date) - new Date(a.date));
    setArr(sorted);
  }, [products]);

  const container = useRef();

  function slideLeft() {
    container.current.scrollBy({left: -260, behavior: 'smooth'});
  }

  function slideRight() {
    container.current.scrollBy({left: 260, behavior: 'smooth'});
  }

  return (
    <div className={`${styles.section}`}>
      <div className={styles.header}>
        <h4>New Products</h4>
        <Link href="/pages/products?category=all">View All →</Link>
      </div>
      <div className={styles.content} >
        <button onClick={slideLeft} className={styles.sliderButton}>&lt;</button>
        <div className={styles.cardContainer} ref={container} >
          {
            arr.slice(0, Math.min(arr.length, 10)).map((product) => (
              <Card key={product._id} product={product} />
            ))
          }
        </div>
        <button onClick={slideRight} className={styles.sliderButton}>&gt;</button>
      </div>
    </div>
  );
}