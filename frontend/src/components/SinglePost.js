import { useEffect, useState, useRef } from "react";
import CreateComment from "./Comment";
import Popup from "./Popup";
import { useNavigate } from "react-router-dom";
import GetComments from "./GetComments";

function SinglePost({
    postId,
    userId,
    displayName,
    privacy,
    img,
    createdAt,
    content,
    comments,
    currentUserId,
    profilePic,
    showComments,
}) {
    const [likes, setLikes] = useState([]);
    const [currentUserLike, setCurrentUserLike] = useState(null);
    const [likeAmount, setLikeAmount] = useState(null);
    const [showLikesPopup, setShowLikesPopup] = useState(false);
    const [commentAmount, setCommentAmount] = useState(comments);
    const [expanded, setExpanded] = useState(false);
    const [isContentOverflowing, setIsContentOverflowing] = useState(null);
    const [userExpanded, setUserExpanded] = useState(false);
    const contentRef = useRef(null);

    const attachRef = (element) => {
        if (element) {
            const isOverflowing = element.clientHeight < element.scrollHeight;
            setIsContentOverflowing(isOverflowing);
        }
    };

    useEffect(() => {
        if (contentRef.current) {
            const isOverflowing =
                contentRef.current.clientHeight <
                contentRef.current.scrollHeight;
            setIsContentOverflowing(isOverflowing);
        }
    }, [content, expanded]);

    const handlePostClick = () => {
        setExpanded(!expanded);
        setUserExpanded(true);
    };

    const updateCommentAmount = () => {
        setCommentAmount((prevAmount) => prevAmount + 1);
    };

    const navigateTo = useNavigate();
    useEffect(() => {
        const getLikes = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-post-likes?userId=${currentUserId}&postId=${postId}`
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

    const handlePostLike = async () => {
        setCurrentUserLike(!currentUserLike);

        const payload = {
            postId: parseInt(postId),
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
                console.log("error liking post");
            }
        } catch (error) {
            console.error(error);
        }
    };

    if (currentUserLike !== null) {
        return (
            <div>
                <div className="col">
                    <div className="card shadow-sm post">
                        <div className="card">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex">
                                    <div className="m-2">
                                        <img
                                            src={`http://localhost:8080/get-image/users/${profilePic}`}
                                            width="60"
                                            height="60"
                                            onClick={() =>
                                                navigateTo(`/user/${userId}`)
                                            }
                                            style={{
                                                cursor: "pointer",
                                                borderRadius: "100%",
                                                objectFit: "cover",
                                            }}
                                        />
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <p
                                            style={{ cursor: "pointer" }}
                                            onClick={() =>
                                                navigateTo(`/user/${userId}`)
                                            }
                                            className="card-text"
                                        >
                                            {displayName}
                                        </p>
                                    </div>
                                </div>
                                <small
                                    className="text-body-secondary"
                                    style={{ marginRight: "20px" }}
                                >
                                    {privacy}
                                </small>
                            </div>
                        </div>
                        {img && (
                            <img
                                style={{
                                    width: "100%",
                                    maxWidth: "700px",
                                    margin: "auto",
                                }}
                                src={`http://localhost:8080/get-image/posts/${img}`}
                            />
                        )}
                        <div className="card-body">
                            <p
                                ref={attachRef}
                                style={{ whiteSpace: "pre-wrap" }}
                                className={`card-text ${
                                    expanded
                                        ? "expanded-content"
                                        : "posts-content-cut"
                                }`}
                            >
                                {content}
                            </p>
                            {isContentOverflowing === true && !expanded && (
                                <p
                                    className="expand-post-link expand-link-text clickable-text"
                                    onClick={handlePostClick}
                                >
                                    Show more
                                </p>
                            )}

                            {userExpanded && expanded && (
                                <p
                                    className="expand-post-link expand-link-text clickable-text"
                                    onClick={handlePostClick}
                                >
                                    Show less
                                </p>
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
                                        onClick={handlePostLike}
                                    ></div>{" "}
                                    <small
                                        style={{
                                            cursor:
                                                likes.length > 0
                                                    ? "pointer"
                                                    : "default",
                                        }}
                                        className="text-body-secondary"
                                        onClick={() =>
                                            setShowLikesPopup(
                                                likes.length ? true : false
                                            )
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
                                    <div
                                        className="comment-button"
                                        style={{
                                            cursor: commentAmount
                                                ? "pointer"
                                                : "default",
                                        }}
                                        onClick={() =>
                                            navigateTo(`/post/${postId}`)
                                        }
                                    ></div>
                                    <small>{commentAmount}</small>
                                </div>
                                <small className="text-body-secondary">
                                    {getTimeDiff(createdAt)}
                                </small>
                            </div>
                        </div>
                        <CreateComment
                            postCreatorId={userId}
                            currentUserId={currentUserId}
                            postId={postId}
                            updateCommentAmount={updateCommentAmount}
                        />
                    </div>
                    <GetComments
                        postId={postId}
                        currentUserId={currentUserId}
                        commentAmount={commentAmount}
                        showComments={showComments}
                    />
                </div>
            </div>
        );
    }
}

export const getTimeDiff = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();

    const timeDiffInMilliseconds = now - date;
    const timeDiffInSeconds = timeDiffInMilliseconds / 1000;

    if (timeDiffInSeconds < 60) {
        return "just now";
    } else if (timeDiffInSeconds < 60 * 60) {
        const minutesAgo = Math.floor(timeDiffInSeconds / 60);
        return `${minutesAgo} minute${minutesAgo !== 1 ? "s" : ""} ago`;
    } else if (timeDiffInSeconds < 24 * 60 * 60) {
        const hoursAgo = Math.floor(timeDiffInSeconds / (60 * 60));
        return `${hoursAgo} hour${hoursAgo !== 1 ? "s" : ""} ago`;
    } else if (timeDiffInSeconds < 7 * 24 * 60 * 60) {
        const daysAgo = Math.floor(timeDiffInSeconds / (24 * 60 * 60));
        return `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`;
    } else if (timeDiffInSeconds < 30 * 24 * 60 * 60) {
        const weeksAgo = Math.floor(timeDiffInSeconds / (7 * 24 * 60 * 60));
        return `${weeksAgo} week${weeksAgo !== 1 ? "s" : ""} ago`;
    } else if (timeDiffInSeconds < 12 * 30 * 24 * 60 * 60) {
        const monthsAgo = Math.floor(timeDiffInSeconds / (30 * 24 * 60 * 60));
        return `${monthsAgo} month${monthsAgo !== 1 ? "s" : ""} ago`;
    } else {
        const yearsAgo = Math.floor(timeDiffInSeconds / (365 * 24 * 60 * 60));
        return `${yearsAgo} year${yearsAgo !== 1 ? "s" : ""} ago`;
    }
};

export default SinglePost;
