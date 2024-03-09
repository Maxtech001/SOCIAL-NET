import { useEffect, useState } from "react";
import { getTimeDiff } from "./SinglePost";
import { useNavigate } from "react-router-dom";
import Popup from "./Popup";

function SingleComment({
    commentId,
    userId,
    displayName,
    img,
    createdAt,
    content,
    currentUserId,
    profilePic,
}) {
    const [likes, setLikes] = useState([]);
    const [currentUserLike, setCurrentUserLike] = useState(null);
    const [likeAmount, setLikeAmount] = useState(null);
    const [showLikesPopup, setShowLikesPopup] = useState(false);

    const navigateTo = useNavigate();
    useEffect(() => {
        const getLikes = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-comment-likes?userId=${currentUserId}&commentId=${commentId}`
                );
                if (response.ok) {
                    const data = await response.json();

                    var hasLiked = false;
                    data.forEach((like) => {
                        if (like.userId === currentUserId) {
                            hasLiked = true;
                        }
                    });

                    setLikeAmount(data.length);
                    setCurrentUserLike(hasLiked);
                    setLikes(data);
                } else {
                    console.log(response.statusText);
                }
            } catch (error) {
                console.error(error);
            }
        };

        getLikes();
    }, [currentUserLike]);

    const handleCommentLike = async () => {
        setCurrentUserLike(!currentUserLike);

        const payload = {
            commentId: parseInt(commentId),
            userId: currentUserId,
        };
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        };

        try {
            const response = await fetch(
                "http://localhost:8080/post-like",
                options
            );
            if (response.ok) {
            } else {
                console.log("Error liking post");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <img
                        src={`http://localhost:8080/get-image/users/${profilePic}`}
                        alt="Profile Pic"
                        width="30"
                        height="30"
                        className="rounded-circle mr-2"
                        onClick={() => navigateTo(`/user/${userId}`)}
                        style={{ cursor: "pointer", borderRadius: "100%" }}
                    />
                    <div>
                        <small
                            onClick={() => navigateTo(`/user/${userId}`)}
                            className="text-muted"
                            style={{ cursor: "pointer" }}
                        >
                            {displayName}
                        </small>
                        <p style={{ whiteSpace: "pre-wrap" }}>{content}</p>
                    </div>
                </div>
                {img && (
                    <div className="d-flex mt-3">
                        <img
                            src={`http://localhost:8080/get-image/comments/${img}`}
                            style={{ maxWidth: "100%", maxHeight: "150px" }}
                        />
                    </div>
                )}
                <div className="d-flex justify-content-between align-items-center">
                    <div className="btn-group">
                        <div
                            style={{
                                backgroundImage: `url(http://localhost:3000/icons/Like${
                                    currentUserLike ? "" : "1"
                                }_72px.png)`,
                                backgroundSize: "cover",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "center center",
                                width: "22px",
                                height: "22px",
                                marginRight: "8px",
                                cursor: "pointer",
                            }}
                            onClick={handleCommentLike}
                        ></div>
                        <small
                            style={{
                                cursor:
                                    likes.length > 0 ? "pointer" : "default",
                            }}
                            className="text-body-secondary"
                            onClick={() =>
                                setShowLikesPopup(likes.length ? true : false)
                            }
                        >
                            {likeAmount}
                        </small>
                        <Popup
                            title="Liked by"
                            users={likes}
                            show={showLikesPopup}
                            currentUserId={currentUserId}
                            onClose={() => setShowLikesPopup(false)}
                        />
                    </div>
                    <small className="text-body-secondary">
                        {getTimeDiff(createdAt)}
                    </small>
                </div>
            </div>
        </div>
    );
}

export default SingleComment;
