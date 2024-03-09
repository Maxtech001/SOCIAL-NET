import { Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getTimeDiff } from "./SinglePost";

function SingleNotification({
    notificationId,
    sourceId,
    notificationType,
    clickedOn,
    created,
    setShowNotifications,
}) {
    const navigateTo = useNavigate();

    const getNotificationMsg = () => {
        switch (notificationType) {
            case "comment":
                return "Someone left a comment on your post!";
            case "followRequest":
                return "You have a new follower request!";
            case "groupInvite":
                return "You have been invited to join a group!";
            case "groupJoinRequest":
                return "A user has requested to join one of your groups!";
            case "groupEvent":
                return "An event has been created in a group you are a part of!";
        }
    };

    const handleNotificationClick = () => {
        switch (notificationType) {
            case "comment":
                navigateTo(`/post/${sourceId}`);
                break;
            case "followRequest":
                navigateTo(`/user/${sourceId}`);
                break;
            case "groupInvite":
                navigateTo(`/group/${sourceId}`);
                break;
            case "groupJoinRequest":
                navigateTo(`/group/${sourceId}`);
                break;
            case "groupEvent":
                navigateTo(`/group/${sourceId}`);
                break;
        }

        updateNotificationStatus();
        setShowNotifications(false);
    };

    const updateNotificationStatus = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/update-notification-status?notificationId=${notificationId}`
            );
            if (response.ok) {
            } else {
                console.log("error updating notification status");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dropdown.Item key={notificationId} onClick={handleNotificationClick}>
            <div style={{ whiteSpace: "normal" }}>
                <p>{getNotificationMsg()}</p>
            </div>
            <div className="d-flex justify-content-between">
                <small style={{ color: "grey" }}>{getTimeDiff(created)}</small>
                <small style={{ color: "grey" }}>
                    {clickedOn ? "" : "new"}
                </small>
            </div>
        </Dropdown.Item>
    );
}

export default SingleNotification;
