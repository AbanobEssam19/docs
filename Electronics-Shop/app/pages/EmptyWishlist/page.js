import styles from "./page.module.css";
import Link from "next/link";

export default function EmptyWishlist() {
    return (
        <div className={styles.emptyCart} >
            <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1729102039/png-transparent-emoji-broken-heart-sad-emoji-love-text-heart-thumbnail_ljjyff.png" />
            <h2>YOUR WISHLIST IS EMPTY, LET'S CHANGE THAT!</h2>
            <p>You can now add products to your wishlist, <Link href="/pages/products?category=all">start shopping now!</Link></p>
        </div>
    );
}
