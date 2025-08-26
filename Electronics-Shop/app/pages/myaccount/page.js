"use client";
import MyaccountSidebar from "@/app/components/MyaccountSidebar/sidebar";

import styles from "./page.module.css";
import Error from "../Error/page";
import { useEffect, useState } from "react";
import { updateUser } from "@/app/states/reducers/userSlice";
import { useDispatch, useSelector } from "react-redux";

import alertStyles from "@/app/components/Alerts/alerts.module.css";

export default function AccountDetails() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userData.data);
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    address: "",
    city: "",
    region: "",
    curPass: "",
    newPass: "",
    confirmPass: "",
  });

  function updateData(e) {
    const { id, value } = e.target;
    setUserData({
      ...userData,
      [id]: value,
    });
  }

  useEffect(() => {
    if (!user) return;
    setUserData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      address: user.address || "",
      city: user.city || "",
      region: user.region || "",
      curPass: "",
      newPass: "",
      confirmPass: ""
    });
  }, [user]);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{8,}$/;

  const handleSubmit = async () => {
    const alert = document.getElementById("alertContainer");

    if (!userData.curPass) {
      alert.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          Please enter your current password.
        </div>
      `;
      return;
    }
    if (userData.newPass) {
      if (!passwordRegex.test(userData.newPass)) {
        alert.innerHTML = `
          <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.
          </div>
        `;
        return;
      }
      if (userData.newPass !== userData.confirmPass) {
        alert.innerHTML = `
          <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            Passwords do not match.
          </div>
        `;
        return;
      }
    }

    let token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    try {
      const res = await fetch("/api/edituserdata", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: `${token}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!data.success) {
        alert.innerHTML = `
          <div class="alert alert-danger alert-dismissible fade show ${alertStyles.alert}">
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            Entered current password is incorrect.
          </div>
        `;
        return;
      }

      
      dispatch(updateUser(data.user));

      alert.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show ${alertStyles.alert}">
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          User data updated successfully.
        </div>
      `;
    } catch (error) {
      console.error("Error during fetch:", error);
    }
  };

  if (!user) {
    return <Error />;
  }

  return (
    <div
      className={`container ${styles.AccountDetails}`}
      style={{ minHeight: "500px" }}
    >
      <MyaccountSidebar num={1} />
      <div className={styles.form}>
        <label>First name</label>
        <input
          id="firstname"
          type="text"
          value={userData.firstname}
          onChange={updateData}
        />{" "}
        <br />
        <label>Last name</label>
        <input
          id="lastname"
          type="text"
          value={userData.lastname}
          onChange={updateData}
        />{" "}
        <br />
        <label>Street address</label>
        <input
          id="address"
          type="text"
          value={userData.address}
          onChange={updateData}
        />{" "}
        <br />
        <label>Town / City</label>
        <input
          id="city"
          type="text"
          value={userData.city}
          onChange={updateData}
        />{" "}
        <br />
        <label>Region</label>
        <input
          id="region"
          type="text"
          value={userData.region}
          onChange={updateData}
        />{" "}
        <br />
        <label>User name</label>
        <input type="text" value={user.username} disabled /> <br />
        <label>Email address</label>
        <input type="text" value={user.email} disabled /> <br />
        <label>Current password (leave blank to leave unchanged)</label>
        <input
          id="curPass"
          type="password"
          value={userData.curPass}
          onChange={updateData}
        />{" "}
        <br />
        <label>New password (leave blank to leave unchanged)</label>
        <input
          id="newPass"
          type="password"
          value={userData.newPass}
          onChange={updateData}
        />{" "}
        <br />
        <label>Confirm new password</label>
        <input
          id="confirmPass"
          type="password"
          value={userData.confirmPass}
          onChange={updateData}
        />{" "}
        <br />
        <button onClick={handleSubmit} className={styles.sumbit}>
          Save Changes
        </button>
      </div>
      
    </div>
  );
}
