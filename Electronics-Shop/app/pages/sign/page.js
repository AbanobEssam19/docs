'use client'
import styles from "./page.module.css"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Link from "next/link";

import { useEffect, useRef, useState } from 'react';

const usernameRegex = /^[a-zA-Z0-9]{5,20}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#]{8,}$/;

function Register() {

    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");

    function checkUsername() {
    
        if (!username) {
            document.getElementById("emptyUsername").style.display = "block";
            return false;
        }
        else if (!usernameRegex.test(username)) {
            document.getElementById("usernameError").style.display = "block";
            return false;
        }
        return true;
    }

    function checkEmail() {

        if (!email) {
            document.getElementById("emptyEmail").style.display = "block";
            return false;
        }
        else if (!emailRegex.test(email)) {
            document.getElementById("emailError").style.display = "block";
            return false;
        }
        return true;
    }

    function checkPhone() {

        if (!phone) {
            document.getElementById("emptyPhone").style.display = "block";
            return false;
        }
        else if (!phoneRegex.test(phone)) {
            document.getElementById("phoneError").style.display = "block";
            return false;
        }
        return true;
    }

    function checkPassword() {
    
        if (!password) {
            document.getElementById("emptyPassword").style.display = "block";
            return false;
        }
        else if (!passwordRegex.test(password)) {
            document.getElementById("passwordError").style.display = "block";
            return false;
        }
        return true;
    }

    function clearErorrs() {
        document.getElementById("duplicatedUsername").style.display = "none";
        document.getElementById("passwordError").style.display = "none";
        document.getElementById("emptyPassword").style.display = "none";
        document.getElementById("phoneError").style.display = "none";
        document.getElementById("emptyPhone").style.display = "none";
        document.getElementById("emailError").style.display = "none";
        document.getElementById("emptyEmail").style.display = "none";
        document.getElementById("usernameError").style.display = "none";
        document.getElementById("emptyUsername").style.display = "none";
    }

    async function Sign(e) {
        e.preventDefault();

        clearErorrs();

        if (!checkUsername()) {
            return;
        }
        
        if (!checkEmail()) {
            return;
        }
        
        if (!checkPhone()) {
            return;
        }

        if (!checkPassword()) {
            return;
        }

        let userData = {
            username: username,
            password: password,
            email: email,
            phone: phone
        };

        const res = await fetch('/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        if (data.success) {
            localStorage.setItem('token', data.token);
            window.location.href = "/";
        } else {
            document.getElementById("duplicatedUsername").style.display = "block";
            return;
        }

    }
    

    return (
        <form method="post" action="" className={styles.register}>
            <div className={styles.profile__img__blog}>
                <FontAwesomeIcon icon="fa-solid fa-circle-user fa-9x" style={{color: "#eea004"}} />
            </div>
            
            <h2 className={styles.title}>Register</h2>        

            <div className={styles.input__blog}>
                <div className={styles.iconContainer}>
                    <FontAwesomeIcon icon="fas fa-user" />
                </div>
                <input type="text" placeholder="Username" onChange={(e) => {setUsername(e.target.value)}} />
            </div>               

            <p className={styles.erorrText} id='usernameError'>Username must be 5-20 characters long and contain only letters and numbers.</p>
            <p className={styles.erorrText} id='duplicatedUsername'>The entered username already exist!</p>
            <p className={styles.erorrText} id='emptyUsername'>username cannot be empty!</p>

            <div className={styles.input__blog}>
                <div className={styles.iconContainer}>
                    <FontAwesomeIcon icon="fas fa-envelope" />
                </div>
                <input type="text" placeholder="e-mail" onChange={(e) => {setEmail(e.target.value)}} />
            </div>

            <p className={styles.erorrText} id='emailError'>Entered email is not valid!</p>
            <p className={styles.erorrText} id='emptyEmail'>Email cannot be empty!</p>

            <div className={styles.input__blog}>
                <div className={styles.iconContainer}>
                    <FontAwesomeIcon icon="fas fa-phone" />
                </div>
                <input type="text" placeholder="Phone number" onChange={(e) => {setPhone(e.target.value)}} />
            </div>                   

            <p className={styles.erorrText} id='phoneError'>Entered phone number is not valid!</p>
            <p className={styles.erorrText} id='emptyPhone'>Phone number cannot be empty!</p>

            <div className={styles.input__blog}>
                <div className={styles.iconContainer}>
                    <FontAwesomeIcon icon="fas fa-lock" />
                </div>
                <input type="password" placeholder="Password" onChange={(e) => {setPassword(e.target.value)}} />
            </div>

            <p className={styles.erorrText} id='passwordError'>Password must be at least 8 characters, include one uppercase letter, lowercase letter, and digit.</p>
            <p className={styles.erorrText} id='emptyPassword'>Password cannot be empty!</p>

            <input type="submit" value="Register" className={`${styles.formBtn} ${styles.login}`} onClick={Sign} />

        </form>
    )
}

function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const remember = useRef(null);

    async function LogIn(e) {
        e.preventDefault();

        document.getElementById("wrongPassword").style.display = "none";

        let check = true;

        check &= usernameRegex.test(username);
        
        check &= passwordRegex.test(password);
        
        if (!check) {
            document.getElementById("wrongPassword").style.display = "block";
            return;
        }

        let userData = {
            username: username,
            password: password
        };

        const res = await fetch('/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await res.json();
        if (data.success) {
            if (remember.current.checked) {
                localStorage.setItem('token', data.token);
            }
            else {
                sessionStorage.setItem('token', data.token);
            }
            window.location.href = "/";
        } else {
            document.getElementById("wrongPassword").style.display = "block";
            return;
        }

    }
    

    return (
        <form method="post" action="" className={styles.signin}>

            <div className={styles.profile__img__blog}>
                <FontAwesomeIcon icon="fa-solid fa-circle-user fa-9x" style={{color: "#eea004"}} />
            </div>

            <h2 className={styles.title}>Sign in</h2>

            <div className={styles.input__blog}>
                <div className={styles.iconContainer}>
                    <FontAwesomeIcon icon="fas fa-user" />
                </div>
                <input type="text" placeholder="Username" onChange={(e) => {setUsername(e.target.value)}} />
            </div>

            <div className={styles.input__blog}>
                <div className={styles.iconContainer}>
                    <FontAwesomeIcon icon="fas fa-lock" />
                </div>
                <input type="password" placeholder="Password" onChange={(e) => {setPassword(e.target.value)}} />
            </div>

            <div className={styles.remember__blog}>
                <input type="checkbox" name="remember" id="remember" ref={remember} />
                <label htmlFor="remember">Remember me</label>
            </div>

            <p className={styles.erorrText} id='wrongPassword'>Wrong username or password!</p>

            <input type="submit" value="Login" className={`${styles.formBtn} ${styles.login}`} onClick={LogIn} />

        </form>
    )
}


function Forms() {

    return (
        <div className={styles.forms}>
            <div className={styles.sign__blog}>
                <Login />
                <Register />
            </div>
        </div>
    )
}


export default function Page() {

    const container = useRef();
    const registerBtn = useRef();

    function changeToSignIn() {
        container.current.classList.remove(styles.signupMode);
    }

    function changeToRegister(e) {
        container.current.classList.add(styles.signupMode);

        const button = registerBtn.current;
        const rect = button.getBoundingClientRect(); // to get element's position
    
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
    
        const ripple = document.createElement('span');
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        button.appendChild(ripple);
    
        setTimeout(() => {
          ripple.remove();
        }, 750);
    }

    return (
        <>
            <div className={styles.mainContainer} ref={container} > 
                <Forms />
                <div className={styles.panels__blog}>
                    <div className={`${styles.panel} ${styles.left__panel}`}>
                        <div className={styles.content}>
                            <h3 className={styles.panel__title}>New here ?</h3>
                            <p className={styles.panel__text}></p>
                            <button className={`${styles.formBtn} ${styles.transparent}`} id="register__btn" onClick={changeToRegister} ref={registerBtn} >Register</button>
                        </div>

                        <img src="https://www.boltkargo.com.tr/img/icon-2.svg" alt="" className={styles.panel__img} />
                    </div>

                    <div className={`${styles.panel} ${styles.right__panel}`}>
                        <div className={styles.content}>
                            <h3 className={styles.panel__title}>Already have account</h3>
                            <p className={styles.panel__text}></p>
                            <button className={`${styles.formBtn} ${styles.transparent}`} id="signin__btn" onClick={changeToSignIn} >Sign in</button>
                        </div>

                        <img src="https://res.cloudinary.com/dckocjoan/image/upload/v1728144483/img_hwhcer.png" alt="" className={styles.panel__img} />
                    </div>
                </div>
            </div>
        </>
    )
}