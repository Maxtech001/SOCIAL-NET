import { useState } from "react";
import { Button } from "react-bootstrap";
import { json, useNavigate } from "react-router-dom";
import { sendNotification } from "./Notifications";

function PopupUserInvite({
    userId,
    firstName,
    lastName,
    onClose,
    profilePic,
    currentUserId,
    groupId,
}) {
    const navigateTo = useNavigate();
    const [invited, setInvited] = useState(false);

    const handleInvite = async () => {
        const payload = {
            groupId: parseInt(groupId),
            inviterId: parseInt(currentUserId),
            invitedUserId: userId,
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
                "http://localhost:8080/invite-user",
                options
            );
            if (response.ok) {
                sendNotification(parseInt(groupId), userId, "groupInvite");
                setInvited(true);
            } else {
                const statusMsg = await response.text();
                console.log(statusMsg);
            }
        } catch (error) {
            console.error(error);
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
                <Button
                    onClick={handleInvite}
                    variant={invited ? "secondary" : "primary"}
                    disabled={invited}
                >
                    {invited ? "Invited" : "Invite"}
                </Button>
            </div>
            <hr />
        </div>
    );
}

export default PopupUserInvite;
