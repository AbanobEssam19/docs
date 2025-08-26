import styles from './page.module.css';

export default function Error() {
    return (
        <div className={styles.main}>
            <h3>Something went wrong...</h3>
            <p>Either you are not logged in or the page you are trying to access does not exist.</p>
        </div>
    );
}