"use client";
import styles from "./footer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Link from "next/link";

export default function Footer() {
  return (
    <div className={`container-fluid ${styles.footer}`}>
      <div className={` ${styles.footerContent}`}>
        <div className={styles.logoContainer}>
          <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1727851295/side-bar-logo_jgrp2c.png" />
        </div>
        <div className={styles.pages}>
          <h2>Pages</h2>
          <div className={styles.line}></div>
          <Link href="/">Home</Link>
          <Link href="/">Categories</Link>
          <Link href="/">3D Printing</Link>
          <Link href="/">About Us</Link>
        </div>
        <div className={styles.socialSection}>
          <h2>Contact Us</h2>
          <div className={styles.line}></div>
          <div className={styles.socialMedia}>
            <Link href="https://www.facebook.com">
              <div className={styles.socialContainer}>
                <FontAwesomeIcon
                  icon="fa-brands fa-facebook"
                  style={{ color: "white", width: "25px", height: "25px" }}
                />
              </div>
            </Link>
            <Link href="https://www.instagram.com">
              <div className={styles.socialContainer}>
                <FontAwesomeIcon
                  icon="fa-brands fa-instagram"
                  style={{ color: "white", width: "25px", height: "25px" }}
                />
              </div>
            </Link>
            <Link href="https://www.linkedin.com">
              <div className={styles.socialContainer}>
                <FontAwesomeIcon
                  icon="fa-brands fa-linkedin"
                  style={{ color: "white", width: "25px", height: "25px" }}
                />
              </div>
            </Link>
            <Link href="https://www.whatsapp.com">
              <div className={styles.socialContainer}>
                <FontAwesomeIcon
                  icon="fa-brands fa-whatsapp"
                  style={{ color: "white", width: "25px", height: "25px" }}
                />
              </div>
            </Link>
          </div>
        </div>
        <div className={styles.location}>
          <h2>Location</h2>
          <div className={styles.line}></div>
          <p>
            <FontAwesomeIcon
              icon="fa-solid fa-location-dot"
              style={{ width: "20px", height: "20px" }}
            />{" "}
            El-Abbasiya Street El Weili, Cairo - Egypt
          </p>
        </div>
      </div>
      <div className={styles.line}></div>
      <p>All Copyrights Reserved 2024 © AB Electronics.</p>
    </div>
  );
}
