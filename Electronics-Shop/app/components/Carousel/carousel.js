"use client";
import styles from "./carousel.module.css";
function Carousel({ product }) {
  return (
    <div
      id="mainCarousel"
      className={`carousel slide ${styles.parentCarousel}`}
      data-bs-ride="carousel"
    >
      <div className={`carousel-inner ${styles.carouselInner}`}>
        {product.photo.map((photo, index) => {
          return <div key={index} className={`carousel-item ${index == 0 && "active"} ${styles.carouselItem}`}>
            <img src={photo} className="d-block w-100" />
          </div>;
        })}
      </div>

      <button
        style={product.photo.length == 1 ? { display: "none" } : {}}
        className="carousel-control-prev"
        type="button"
        data-bs-target="#mainCarousel"
        data-bs-slide="prev"
      >
        <span
          className={`carousel-control-prev-icon ${styles.prevIcon}`}
        ></span>
      </button>
      <button
        style={product.photo.length == 1 ? { display: "none" } : {}}
        className="carousel-control-next"
        type="button"
        data-bs-target="#mainCarousel"
        data-bs-slide="next"
      >
        <span
          className={`carousel-control-next-icon ${styles.nextIcon}`}
        ></span>
      </button>
    </div>
  );
}
export default Carousel;
