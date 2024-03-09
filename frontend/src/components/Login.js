import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [formErrors, setFormErrors] = useState({
        email: "",
        password: "",
    });

    const navigateTo = useNavigate();
    const sessionData = useOutletContext();

    useEffect(() => {
        if (sessionData.sessionExists) {
            navigateTo("/");
        }
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));

        const err = getErr(name, value);
        setFormErrors((prevErrs) => ({
            ...prevErrs,
            [name]: err,
        }));
    };

    const getErr = (name, value) => {
        if (
            name === "email" &&
            !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value)
        ) {
            return "Not a valid email address";
        }
        if (name === "password" && value.length < 6) {
            return "Password is too short";
        }
        return "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        for (const key in formData) {
            if (formData[key] === "") {
                setFormErrors((prevErrs) => ({
                    ...prevErrs,
                    [key]: "This field is required",
                }));
            }
        }

        for (const key in formErrors) {
            if (formErrors[key] !== "" || formData[key] === "") {
                return;
            }
        }

        const payload = formData;

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        };

        try {
            const response = await fetch(
                "http://localhost:8080/login",
                options
            );
            if (response.ok) {
                const data = await response.json();
                const expirationDate = new Date();
                expirationDate.setDate(expirationDate.getDate() + 7);

                document.cookie = `session=${
                    data.cookieId
                }; expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`;

                window.location.href = "/";
            } else {
                const statusMsg = await response.text();
                if (statusMsg.includes("password")) {
                    setFormErrors({
                        email: "",
                        password: statusMsg,
                    });
                } else {
                    setFormErrors({
                        email: statusMsg,
                        password: "",
                    });
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!sessionData.sessionExists) {
        return (
            <div className="container mt-5 p-4 rounded">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <h2 className="mb-4">Login</h2>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-3">
                                <input
                                    type="email"
                                    className={`form-control ${
                                        formErrors.email ? "is-invalid" : ""
                                    }`}
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        border: 'none',
                                        borderBottom: '1px solid lightgray',
                                        padding: '20px 10px',
                                    }}
                                    placeholder="Email"
                                />
                                <div className="invalid-feedback">
                                    {formErrors.email}
                                </div>
                            </div>
                            <div className="mb-3">
                                <input
                                    type="password"
                                    className={`form-control ${
                                        formErrors.password ? "is-invalid" : ""
                                    }`}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        border: 'none',
                                        borderBottom: '1px solid lightgray',
                                        padding: '20px 10px',
                                    }}
                                    placeholder="Password"
                                />
                                <div className="invalid-feedback">
                                    {formErrors.password}
                                </div>
                            </div>
                            <div className="d-grid">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                >
                                    Login
                                </button>
                            </div>
                        </form>
                        <br></br>
                        <div className="d-grid">
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                                onClick={() => navigateTo("/register")}
                            >
                                Don't have an account? Register here!
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Login;
