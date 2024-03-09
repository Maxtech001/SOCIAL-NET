import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        nickname: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
        aboutMe: "",
    });

    const [formErrors, setFormErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
    });

    const [selectedImg, setSelectedImg] = useState(null);
    const [imgPreviewUrl, setImgPreviewUrl] = useState(
        "http://localhost:8080/get-image/users/defaultProfilePic.png"
    );
    const imgPicker = useRef(null);

    const handleImg = () => {
        imgPicker.current.click();
    };

    const handleChangeImg = (event) => {
        if (event.target.files.length > 0) {
            setSelectedImg(event.target.files[0]);
            setImgPreviewUrl(URL.createObjectURL(event.target.files[0]));
        } else {
            setSelectedImg(null);
            setImgPreviewUrl(
                "http://localhost:8080/get-image/users/defaultProfilePic.png"
            );
        }
    };

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
        switch (name) {
            case "firstName":
                if (!value.trim()) {
                    return "This field is required";
                }
                break;
            case "lastName":
                if (!value.trim()) {
                    return "This field is required";
                }
                break;
            case "email":
                if (
                    !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value)
                ) {
                    return "Not a valid email address";
                }
                break;
            case "dateOfBirth":
                if (validateDateOfBirth(value)) {
                    return validateDateOfBirth(value);
                }
                break;
            case "password":
                if (value.length < 6) {
                    return "Password is too short";
                }
                break;
            case "confirmPassword":
                if (formData.password !== value) {
                    return "Passwords don't match";
                }
                break;
        }
        return "";
    };

    const navigateTo = useNavigate();
    const sessionData = useOutletContext();

    useEffect(() => {
        if (sessionData.sessionExists) {
            navigateTo("/");
        }
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        for (const key in formData) {
            if (
                formData[key] === "" &&
                key !== "aboutMe" &&
                key !== "nickname"
            ) {
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

        const payload = new FormData();

        for (const key in formData) {
            payload.append(key, formData[key]);
        }

        payload.append("img", selectedImg ? selectedImg : "");

        const options = {
            method: "POST",
            body: payload,
        };

        try {
            const response = await fetch(
                "http://localhost:8080/register",
                options
            );
            if (response.ok) {
                navigateTo("/login");
            } else {
                const statusMsg = await response.text();
                console.log(statusMsg);
                if (statusMsg.includes("email")) {
                    setFormErrors((prevErrs) => ({
                        ...prevErrs,
                        email: "This email address is already in use",
                    }));
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (!sessionData.sessionExists) {
        return (
            <div className="container p-4 rounded">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <h2 className="mb-4">Registration</h2>
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="mb-3">
                                <label
                                    htmlFor="firstName"
                                    className="form-label"
                                >
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${
                                        formErrors.firstName ? "is-invalid" : ""
                                    }`}
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="invalid-feedback">
                                    {formErrors.firstName}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label
                                    htmlFor="lastName"
                                    className="form-label"
                                >
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    className={`form-control ${
                                        formErrors.lastName ? "is-invalid" : ""
                                    }`}
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="invalid-feedback">
                                    {formErrors.lastName}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label">
                                    Email
                                </label>
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
                                />
                                <div className="invalid-feedback">
                                    {formErrors.email}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label
                                    htmlFor="nickname"
                                    className="form-label"
                                >
                                    Nickname (optional)
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="nickname"
                                    name="nickname"
                                    value={formData.nickname}
                                    onChange={handleChange}
                                    maxLength="14"
                                />
                            </div>
                            <div className="mb-3">
                                <label
                                    htmlFor="dateOfBirth"
                                    className="form-label"
                                >
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    className={`form-control ${
                                        formErrors.dateOfBirth
                                            ? "is-invalid"
                                            : ""
                                    }`}
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                />
                                <div className="invalid-feedback">
                                    {formErrors.dateOfBirth}
                                </div>
                            </div>
                            <div className="mb-3 d-flex">
                                <div
                                    style={{
                                        marginRight: "10px",
                                        width: "100%",
                                    }}
                                >
                                    <div className="mb-3">
                                        <label
                                            htmlFor="password"
                                            className="form-label"
                                        >
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${
                                                formErrors.password
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="invalid-feedback">
                                            {formErrors.password}
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="confirmPassword"
                                            className="form-label"
                                        >
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control ${
                                                formErrors.confirmPassword
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="invalid-feedback">
                                            {formErrors.confirmPassword}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ width: "40%" }}>
                                    <div
                                        className="d-flex align-items-center justify-content-center"
                                        style={{
                                            height: "156px",
                                            width: "156px",
                                            border: "1px dashed #ccc",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            backgroundImage: `url(${imgPreviewUrl})`,
                                            backgroundSize: "cover",
                                        }}
                                        onClick={handleImg}
                                    >
                                        <input
                                            className="hidden"
                                            type="file"
                                            ref={imgPicker}
                                            onChange={handleChangeImg}
                                            accept=".png, .jpg, .jpeg"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="aboutMe" className="form-label">
                                    About Me (optional, max 100 characters)
                                </label>
                                <textarea
                                    className="form-control"
                                    id="aboutMe"
                                    name="aboutMe"
                                    value={formData.aboutMe}
                                    onChange={handleChange}
                                    maxLength="100"
                                    style={{ minHeight: "100px" }}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-block"
                            >
                                Register
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

function validateDateOfBirth(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);

    const age = calculateAge(dateString);

    if (age < 13 && age >= 0) {
        return "You have to be at least 13 years old to register";
    }

    const isValid =
        !isNaN(birthDate.getTime()) &&
        birthDate.getFullYear() > 1900 &&
        birthDate <= today;

    if (isValid) {
        return "";
    } else {
        return "Please enter a valid date of birth";
    }
}

const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const currentDate = new Date();

    let age = currentDate.getFullYear() - dob.getFullYear();

    if (
        currentDate.getMonth() < dob.getMonth() ||
        (currentDate.getMonth() === dob.getMonth() &&
            currentDate.getDate() < dob.getDate())
    ) {
        age--;
    }

    return age;
};

export default Register;
