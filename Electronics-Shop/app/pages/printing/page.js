"use client";
import { useDispatch, useSelector } from "react-redux";
import styles from "./3d.module.css";
import { useState, useEffect } from "react";
import { updateUser } from "@/app/states/reducers/userSlice";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

const materials = [
  "LEDO 6060 Resin",
  "Black Resin",
  "Imagine Black",
  "8228 Resin",
  "9600 Resin",
  "8001 Resin",
  "CBY Resin",
  "X Resin",
  "Full Color Resin",
  "JLC Black Resin",
];

const technologies = [
  "SLA(Resin)",
  "MJF(Nylon)",
  "SLM(Metal)",
  "FDM(Plastic)",
  "SLS(Nylon)",
];

const Printing = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userData.data);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [grams, setGrams] = useState("");
  const [color, setColor] = useState("");
  const [quality, setQuality] = useState("");
  const [file, setFile] = useState(null);

  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedTechnology, setSelectedTechnology] = useState("");
  const [surfaceFinish, setSurfaceFinish] = useState(false);
  const [buildTime, setBuildTime] = useState("48 hours");
  const [quantity, setQuantity] = useState();

  useEffect(() => {
    if (user) {
      setPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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

    const orderData = {
      name,
      phone,
      grams,
      color,
      quality,
      selectedMaterial,
      selectedTechnology,
      surfaceFinish,
      buildTime,
      quantity
    };
    const res = await fetch(`/api/printingorder/${user._id}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (data.success) {
      dispatch(updateUser(data.user));
      window.location.href = "/pages/myaccount/orders";
    }
  };

  return (
    <div className={styles.form_container}>
      <h1>3D Printing Service Reservation</h1>

      {/* 3D Printing Options Panel */}
      <div className={styles.options_panel}>
        <h3>3D Technology</h3>
        <div className="technology-options">
          {technologies.map((tech, index) => (
            <button
              key={index}
              onClick={() => setSelectedTechnology(tech)}
              className={`${styles.button} ${
                selectedTechnology === tech ? styles.selected : ""
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        <h3>Material</h3>
        <div className="material-options">
          {materials.map((material, index) => (
            <button
              key={index}
              onClick={() => setSelectedMaterial(material)}
              className={`${styles.button} ${
                selectedMaterial === material ? styles.selected : ""
              }`}
            >
              {material}
            </button>
          ))}
        </div>

        <h3>Color</h3>
        <input
          type="text"
          className={styles.inputfield}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />

        <h3>Surface Finish</h3>
        <div className={styles.checkboxContainer}>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={surfaceFinish}
              onChange={() => setSurfaceFinish(true)}
            />
            Yes
          </label>
          <label className={styles.label}>
            <input
              type="checkbox"
              checked={!surfaceFinish}
              onChange={() => setSurfaceFinish(false)}
            />
            No
          </label>
        </div>

        <h3>Build Time</h3>
        <select
          className={styles.inputfield}
          value={buildTime}
          onChange={(e) => setBuildTime(e.target.value)}
        >
          <option value="48 hours">48 hours</option>
          <option value="24 hours">24 hours</option>
        </select>

        <h3>Quantity</h3>
        <input
          type="number"
          className={styles.inputfield}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <h3>Price</h3>
        <p className={styles.price}>From 2.5 LE</p>
      </div>

      {/* Form for Customer Details */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className={styles.label}>
            Your Name
          </label>
          <input
            type="text"
            id="name"
            className={styles.inputfield}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className={styles.label}>
            Phone Number
          </label>
          <input
            type="number"
            id="phone"
            className={styles.inputfield}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="grams" className={styles.label}>
            Grams of Parts
          </label>
          <input
            type="number"
            id="grams"
            className={styles.inputfield}
            value={grams}
            onChange={(e) => setGrams(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="quality" className={styles.label}>
            Quality of Filament Needed
          </label>
          <input
            type="text"
            id="quality"
            className={styles.inputfield}
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="file" className={styles.label}>
            Part File (STL)
          </label>
          <input
            type="file"
            id="file"
            className={styles.inputfield}
            accept=".stl"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <button type="submit" className={styles.submitbutton}>
          Send Order
        </button>
      </form>
    </div>
  );
};

export default Printing;
