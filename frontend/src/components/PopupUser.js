import { useState } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { sendFollowRequest } from "./User";

function PopupUser({
    userId,
    firstName,
    lastName,
    currentUserId,
    followStatus,
    isPublic,
    onClose,
    profilePic,
}) {
    const getBtnVariant = (currentUserFollowStatus) => {
        switch (currentUserFollowStatus) {
            case "Follow":
                return "primary";
            case "Following":
                return "success";
            case "Requested":
                return "secondary";
        }
    };

    const [currentUserFollowStatus, setCurrentUserFollowStatus] =
        useState(followStatus);
    const [followBtnVariant, setFollowBtnVariant] = useState(
        getBtnVariant(followStatus)
    );

    const navigateTo = useNavigate();

    const handleFollow = () => {
        if (currentUserFollowStatus === "Follow") {
            sendFollowRequest(
                isPublic ? "Follow" : "RequestFollow",
                parseInt(userId),
                parseInt(currentUserId)
            );
            setCurrentUserFollowStatus(isPublic ? "Following" : "Requested");
            setFollowBtnVariant(
                getBtnVariant(isPublic ? "Following" : "Requested")
            );
        } else {
            sendFollowRequest(
                "Unfollow",
                parseInt(userId),
                parseInt(currentUserId)
            );
            setCurrentUserFollowStatus("Follow");
            setFollowBtnVariant(getBtnVariant("Follow"));
        }
    };

    return (
        <div key={userId}>
            <div className="user-info">
                <div className="d-flex align-items-center">
                    <img
                        src={`http://localhost:8080/get-image/users/${profilePic}`}
                        width="50"
                        height="50"
                        style={{
                            objectFit: "cover",
                        }}
                    />
                    <div
                        onClick={() => {
                            navigateTo(`/user/${userId}`);
                            onClose();
                        }}
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                    >
                        <h5>{firstName + " " + lastName}</h5>
                    </div>
                </div>
                {userId != currentUserId && (
                    <Button
                        onClick={() => handleFollow(userId)}
                        variant={followBtnVariant}
                        disabled={currentUserFollowStatus === "Requested"}
                        onMouseEnter={() =>
                            setFollowBtnVariant(
                                currentUserFollowStatus === "Following"
                                    ? "danger"
                                    : followBtnVariant
                            )
                        }
                        onMouseLeave={() =>
                            setFollowBtnVariant(
                                currentUserFollowStatus === "Following"
                                    ? "success"
                                    : followBtnVariant
                            )
                        }
                    >
                        {followBtnVariant === "danger"
                            ? "Unfollow"
                            : currentUserFollowStatus}
                    </Button>
                )}
            </div>
            <hr />
        </div>
    );
}

export default PopupUser;
