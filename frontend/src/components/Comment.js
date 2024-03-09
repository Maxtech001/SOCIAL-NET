import React, { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { sendNotification } from "./Notifications";

const CreateComment = ({
    currentUserId,
    postId,
    updateCommentAmount,
    postCreatorId,
}) => {
    const [formData, setFormData] = useState({
        currentUserId,
        postId,
        content: "",
    });
    const [selectedImg, setSelectedImg] = useState(null);
    const imgPicker = useRef(null);
    const imagePreviewRef = useRef(null);

    const sessionData = useOutletContext();

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

    const handleSubmit = async (event) => {
        if (event) {
            event.preventDefault();
        }

        if (!/\S/.test(formData.content) && !selectedImg) {
            alert(
                "Please add either some text or an image to create a comment."
            );
            return;
        }

        if (!/\S/.test(formData.content) && selectedImg) {
            formData.content = "";
        }

        if (!formData.content && !selectedImg) {
            alert(
                "Please add either some text or an image to create a comment."
            );
            return;
        }

        event.preventDefault();
        let payload = new FormData();
        payload.append("userId", formData.currentUserId);
        payload.append("postId", formData.postId);
        payload.append("content", formData.content);
        if (selectedImg) {
            payload.append("img", selectedImg);
        }

        setFormData({ currentUserId, postId, content: "" });

        const options = {
            method: "POST",
            body: payload,
        };

        try {
            const response = await fetch(
                "http://localhost:8080/create-comment",
                options
            );
            if (response.ok) {
                setFormData({ currentUserId, postId, content: "" });
                setSelectedImg(null);
                updateCommentAmount();
                hideImagePreview();
                if (postCreatorId != currentUserId) {
                    sendNotification(
                        parseInt(postId),
                        parseInt(postCreatorId),
                        "comment"
                    );
                }
            } else {
                const statusMsg = await response.text();
                console.log(statusMsg);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="card card-body">
                <form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center">
                        <img
                            src={`http://localhost:8080/get-image/users/${sessionData.userData.profilePic}`}
                            width="30"
                            height="30"
                            style={{ borderRadius: "100%", objectFit: "cover" }}
                        />
                        <div className="col d-flex">
                            <textarea
                                className="form-control"
                                rows="1"
                                placeholder="Leave comment..."
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                            ></textarea>
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
                        <div>
                            <button
                                className="btn image-comment-button"
                                onClick={handleImg}
                                type="button"
                            ></button>
                            <input
                                className="hidden"
                                type="file"
                                ref={imgPicker}
                                onChange={handleChangeImg}
                                accept="image/*, .png, .jpg, .gif"
                            />
                        </div>
                        <div>
                            <button
                                className="btn send-comment-button"
                                type="submit"
                            ></button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateComment;
