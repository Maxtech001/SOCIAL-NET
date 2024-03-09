import React, { useState, useRef } from "react";
import PopupAddPrivacy from "./PopupPrivacy";

const CreatePost = ({ userId, isGroup, groupId, updatePostAmount }) => {
    const [formData, setFormData] = useState({
        userId,
        content: "",
    });
    const [selectedImg, setSelectedImg] = useState(null);
    const [isChecked, setIsChecked] = useState(false);
    const [showFollowersPopup, setShowFollowersPopup] = useState(false);
    const [selectedFollowers, setSelectedFollowers] = useState([]);
    const textAreaRef = useRef(null);
    const imgPicker = useRef(null);
    const imagePreviewRef = useRef(null);

    const handleFocus = () => {
        textAreaRef.current.style.height = `10rem`;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleChangeImg = (event) => {
        if (event.target.files.length > 0) {
            setSelectedImg(event.target.files[0]);
            showImagePreview(event.target.files[0]);
        } else {
            setSelectedImg(null);
            hideImagePreview();
        }
    };

    const showImagePreview = (file) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreviewRef.current.src = e.target.result;
            imagePreviewRef.current.style.display = "block";
        };
        reader.readAsDataURL(file);
    };

    const hideImagePreview = () => {
        imagePreviewRef.current.style.display = "none";
    };

    const handleImg = () => {
        imgPicker.current.click();
    };

    const handleFollowersSelection = (selectedIds) => {
        setSelectedFollowers(selectedIds);
    };

    const handlePrivacyClick = () => {
        setIsChecked(!isChecked);
        setShowFollowersPopup(!isChecked);

        if (!isChecked) {
            setSelectedFollowers([]); // Clear selected followers if switching to private
        }
    };

    const handleSubmit = async (event) => {
        if (event) {
            event.preventDefault();
        }

        if (!/\S/.test(formData.content) && !selectedImg) {
            alert("Please add either some text or an image to create a post.");
            textAreaRef.current.style.height = `2rem`;
            return;
        }

        if (!/\S/.test(formData.content) && selectedImg) {
            formData.content = "";
        }

        if (!formData.content && !selectedImg) {
            alert("Please add either some text or an image to create a post.");
            return;
        }

        let payload = new FormData();
        payload.append("userId", formData.userId);
        payload.append("content", formData.content);
        if (selectedImg) {
            payload.append("img", selectedImg || "");
        }

        if (!isGroup) {
            payload.append(
                "privacy",
                !isChecked
                    ? "Public"
                    : selectedFollowers.length === 0
                    ? "Private"
                    : "Specific"
            );
            payload.append(
                "selectedFollowers",
                JSON.stringify(selectedFollowers)
            );
        } else {
            payload.append("privacy", "Group");
            payload.append("groupId", groupId);
        }

        const options = {
            method: "POST",
            body: payload,
        };

        try {
            const response = await fetch(
                "http://localhost:8080/poster",
                options
            );
            if (response.ok) {
                const newPost = await response.json();
                setFormData({ userId, content: "" });
                setSelectedImg(null);
                updatePostAmount();
                hideImagePreview();
            } else {
                console.log("Error creating post:", response.status);
                const statusMsg = await response.text();
                console.log(statusMsg);
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
    };

    return (
        <div>
            <form>
                <div className=" card-header posts">
                    <div className="mb-3">
                        <textarea
                            style={{ resize: "vertical" }}
                            className="form-control textarea-resize"
                            rows="1"
                            placeholder="What do you want to say to this World?"
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            maxLength="2000"
                            ref={textAreaRef}
                            onFocus={handleFocus}
                        />
                    </div>

                    <div className="image-preview">
                        <img
                            ref={imagePreviewRef}
                            src=""
                            alt="Image preview"
                            style={{
                                maxWidth: "100%",
                                maxHeight: "80px",
                                display: "none",
                            }}
                        />
                    </div>

                    <div className="d-flex mb-2 align-items-center">
                        <div className="col-2 d-flex">
                            <button
                                className="btn image-button"
                                onClick={handleImg}
                                type="button"
                            />
                            <input
                                className="hidden"
                                type="file"
                                ref={imgPicker}
                                onChange={handleChangeImg}
                                accept="image/*, .png, .jpg, .gif"
                            />
                        </div>
                        <div className="col d-flex align-items-center">
                            {!isGroup ? (
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={handlePrivacyClick}
                                        className="custom-checkbox"
                                    />
                                    <span className="checkmark"></span>
                                    Only for followers
                                </label>
                            ) : null}
                        </div>

                        {isChecked && (
                            <PopupAddPrivacy
                                title="Show to individual followers?"
                                show={showFollowersPopup}
                                currentUserId={userId}
                                onClose={() => setShowFollowersPopup(false)}
                                onFollowersSelection={handleFollowersSelection}
                                selectedFollowers={selectedFollowers}
                            />
                        )}
                        <div className="d-flex">
                            <button
                                className="btn btn-danger"
                                onClick={handleSubmit}
                                type="submit"
                            >
                                Publish
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
