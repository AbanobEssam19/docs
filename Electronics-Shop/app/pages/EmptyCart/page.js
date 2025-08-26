import styles from "./page.module.css";
import Link from "next/link";

export default function EmptyCart() {
    return (
        <div className={styles.emptyCart} >
            <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1728664383/istockphoto-898475764-612x612_1_chhwgr.png" />
            <h2>YOUR CART IS EMPTY, LET'S CHANGE THAT!</h2>
            <p>Browse our awesome store, <Link href="/pages/products?category=all">start shopping now!</Link></p>
        </div>
    );
}
