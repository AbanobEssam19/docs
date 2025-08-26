"use client";
import Card from "@/app/components/Card/card";
import styles from "./page.module.css";

import { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useSearchParams } from 'next/navigation';

import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchUser } from "@/app/states/APIs/apis";

export default function Products() {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [sortBy, setSortBy] = useState("");
  const [onSale, setOnSale] = useState(false);
  const [onStock, setOnStock] = useState(false);

  const [sorted, setSorted] = useState([]);
  const [current, setCurrent] = useState([]);

  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  const [startInd, setStartInd] = useState(0);
  
  const arrSize = 6;

  const [paginationLinks, setPaginationLinks] = useState([]);

  const paginationRef = useRef(null);

  const [title, setTitle] = useState("");

  const search = searchParams.get('search');

  const sale = searchParams.get('sale');

  const products = useSelector((state) => state.productsData.data);
  const dispatch = useDispatch();
  

  function reset() {
    document.getElementById("stock").checked = false;
    document.getElementById("stockCanvas").checked = false;
    document.getElementById("sale").checked = false;
    document.getElementById("saleCanvas").checked = false;
    document.getElementById("latest").selected = true;
    setOnSale(false);
    setOnStock(false);
    setMinPrice(0);
  }

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (!token)
      token = sessionStorage.getItem('token');
    dispatch(fetchUser(token));
    dispatch(fetchProducts());
  }, []);

  useEffect(() => {
    if (!products)
      return;

    if (search != null) {
      setTitle(`Searching result for: "${search}"`);
    }
    else {
      setTitle(`Products for category: ${category.toUpperCase()}`);
    }

    reset();

    if (sale == 1) {
      setOnSale(true);
      document.getElementById("sale").checked = true;
    }

    let temp = [];
    let mx = 0;
    for (let i = 0; i < products.length; i++) {
      if (category == "all") {
        mx = Math.max(mx, products[i].price);
        temp.push(products[i]);
      }
      else if (search != null && products[i].name.toLowerCase().includes(search.toLowerCase())) {
        mx = Math.max(mx, products[i].price);
        temp.push(products[i]);
      }
      else {
        for (let j = 0; j < products[i].categories.length; j++) {
          if (products[i].categories[j].toLowerCase() == category || (search != null && products[i].categories[j].toLowerCase().includes(search.toLowerCase()))) {
            mx = Math.max(mx, products[i].price);
            temp.push(products[i]);
            break;
          }
        }
      }
    }
    setMaxPrice(mx);
    temp.sort((a, b) => new Date(b.date) - new Date(a.date));
    setSorted(temp);
    setCurrent(temp);
  }, [products, category, search, sale]);
  
  useEffect(() => {
    const temp = [];
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].price >= minPrice && checkSale(sorted[i]) && checkStock(sorted[i])) {
        temp.push(sorted[i]);
      }
    }

    setCurrent([...temp]);
    setStartInd(0);
  }, [minPrice, onSale, onStock, sortBy, sorted]);

  useEffect(() => {
    if (sortBy == "latest") {
      let temp = [...sorted].sort((a, b) => new Date(b.date) - new Date(a.date));
      setSorted(temp);
    }
    else if (sortBy == "popularity") {
      let temp = [...sorted].sort((a, b) => b.popularity - a.popularity);
      setSorted(temp);
    }
    else {
      let temp = [...sorted].sort((a, b) => a.price - b.price);
      if (sortBy == "priceRev")
        temp.reverse();
      setSorted(temp);
    }
  }, [sortBy]);

  function checkSale(product) {
    if (!onSale)
      return true;
    return product.discount > 0;
  }

  function checkStock(product) {
    if (!onStock)
      return true;
    return product.quantity > 0;
  }

  

  useEffect(() => {
    let temp = [];
    
    let last = 0;
    for (let i = 0, j = 1; i < current.length; i += arrSize, ++j) {
      temp.push(
        <li key={`item${j}`} className={`page-item ${startInd == j - 1 ? 'active' : ''}`}>
          <button className="page-link" onClick={() => setStartInd(j - 1)}>{j}</button>
        </li>
      )
      last++;
    }

    
    temp.push(
      <li key={"next"} className={`page-item ${startInd == last - 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => setStartInd(Math.min(startInd + 1, last - 1))} >Next</button>
      </li>
    )

    setPaginationLinks(temp);
  }, [current, startInd]);

  return (
    <>
      <div className={`container`}>
        <div className={`${styles.FirstRow}`}>
          <p className={styles.title} style={{fontWeight: "bold", margin: "0px"}}>{title}</p>
          <div className={styles.filterButtons}>
            <div className={`${styles.LeftPart}`}>
              {/* <!-- Offcanvas Sidebar --> */}
              <div className="offcanvas offcanvas-start" id="demo" style={{width: "300px"}}>
                <div className="offcanvas-header">
                  <h6
                    style={{
                      borderBottom: "1px solid #e3e1e1",
                      padding: "15px  0px 10px 0px",
                      width: "104%",
                    }}
                  >
                    Filter Products
                  </h6>
                  <button
                    type="button"
                    className="btn-close text-reset"
                    data-bs-dismiss="offcanvas"
                    style={{ border: "1px black solid", borderRadius: "20px" }}
                  ></button>
                </div>
                <div className={`offcanvas-body`}>
                  <p
                    style={{
                      borderBottom: "1px solid #e3e1e1",
                      padding: "25px  0px 10px 0px",
                      width: "104%",
                    }}
                  >
                    Filter by price
                  </p>
                  <div className={styles.FilterPart}>
                    <p style={{ marginTop: "20px" }}>
                      <span style={{ color: "grey" }}>Price: </span>{minPrice} EGP — {maxPrice} EGP
                    </p>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className={styles.FilterSlider}
                  />

                  <div
                    style={{
                      borderBottom: "1px solid #e3e1e1",
                      marginBottom: "15px",
                      height: "35px",
                      width: "104%",
                    }}
                  >
                    <p style={{ marginTop: "70px" }}>Product Status</p>
                  </div>
                  <div>
                  <input type="checkbox" value={onStock} id="stockCanvas" onChange={(e) => setOnStock(e.target.checked)} />
                  <label htmlFor="stockCanvas" style={{ padding: "10px", fontSize: "15px" }}>
                    In Stock
                  </label>
                  <br />
                  <input type="checkbox" value={onSale} id="saleCanvas" onChange={(e) => setOnSale(e.target.checked)} />
                  <label
                    htmlFor="saleCanvas"
                    style={{ padding: " 0px 10px", fontSize: "15px" }}
                  >
                    On Sale
                  </label>
                    <br />
                  </div>
                </div>
              </div>

              {/* <!-- Button to open the offcanvas sidebar --> */}
              <button
                className={`btn btn-primary ${styles.SideFilters}`}
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#demo"
              >
                <FontAwesomeIcon
                  icon="fa-solid fa-filter"
                  style={{ color: "#000000" }}
                />{" "}
                Filter Products
              </button>
            </div>
            <div className={`${styles.RightPart}`}>
              <div>
                <select name="sort" id="sort" className={styles.SortIcon} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="latest" id="latest">Sort By Latest</option>
                  <option value="popularity">Sort By popularity </option>
                  <option value="price">Sort By price: low to high</option>
                  <option value="priceRev">Sort By price: high to low </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className={`row`}>
          <div className={`col-3 ${styles.RowTwoLeftSide}`}>
            <p
              style={{
                borderBottom: "1px solid #e3e1e1",
                padding: "25px  0px 10px 0px",
                width: "104%",
              }}
            >
              Filter by price
            </p>
            <div className={styles.FilterPart}>
                <span style={{ color: "grey" }}>Price: </span>{minPrice} EGP — {maxPrice} EGP
              <p style={{ marginTop: "20px" }}>
              </p>
            </div>

            <input
              type="range"
              min="0"
              max={maxPrice}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className={styles.FilterSlider}
            />

            <div
              style={{
                borderBottom: "1px solid #e3e1e1",
                marginBottom: "15px",
                height: "35px",
                width: "104%",
              }}
            >
              <p style={{ marginTop: "70px" }}>Product Status</p>
            </div>
            <div>
              <input type="checkbox" value={onStock} id="stock" onChange={(e) => setOnStock(e.target.checked)} />
              <label htmlFor="stock" style={{ padding: "10px", fontSize: "15px" }}>
                In Stock
              </label>
              <br />
              <input type="checkbox" value={onSale} id="sale" onChange={(e) => setOnSale(e.target.checked)} />
              <label
                htmlFor="sale"
                style={{ padding: " 0px 10px", fontSize: "15px" }}
              >
                On Sale
              </label>
              <br />
            </div>
          </div>
          <div className={`col-9 ${styles.ProductsList}`}>
            {
              current.slice(startInd * arrSize, Math.min(current.length, (startInd + 1) * arrSize)).map((product) => (
                checkSale(product) && checkStock(product) && product.price >= minPrice && product.price <= maxPrice && <Card key={product.id} product={product} />
              ))
            }
          </div>
        </div>
        <div className={` row ${styles.Pagination}`}>
          <nav aria-label="Page navigation example">
            <ul className="pagination justify-content-center" ref={paginationRef}>
              <li key={"prev"} className={`page-item ${startInd == 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setStartInd(Math.max(startInd - 1, 0))}>Previous</button>
              </li>
              {
                paginationLinks
              }
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
