import { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import SingleNotification from "./SingleNotification";

function Notifications({ notifications, userId }) {
    const [notificationCount, setNotificationCount] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);

    const notificationContainerRef = useRef(null);

    useEffect(() => {
        const getUnseenNotificationAmount = () => {
            var amount = 0;
            notifications.forEach((notification) => {
                if (!notification.seen) {
                    amount++;
                }
            });
            setNotificationCount(amount < 10 ? amount : "9+");
        };

        getUnseenNotificationAmount();
    }, [notifications]);

    useEffect(() => {
        const handleBodyClick = (e) => {
            if (
                notificationContainerRef.current &&
                !notificationContainerRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
            }
        };

        document.body.addEventListener("click", handleBodyClick);

        return () => {
            document.body.removeEventListener("click", handleBodyClick);
        };
    }, []);

    const showNotificationDropdown = () => {
        setNotificationCount("");
        setShowNotifications(!showNotifications);
        setAllNotificationsToSeen();
    };

    const setAllNotificationsToSeen = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/set-notifications-to-seen?userId=${userId}`
            );
            if (!response.ok) {
                console.log("error setting notifications to seen");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div ref={notificationContainerRef}>
            <div
                className="notification-container"
                onClick={showNotificationDropdown}
            >
                <div className="notification-button"></div>
                <div
                    style={{
                        visibility: notificationCount ? "visible" : "hidden",
                    }}
                    className="notification-count"
                >
                    {notificationCount}
                </div>
            </div>
            <Dropdown show={showNotifications}>
                <Dropdown.Menu
                    style={{
                        width: "250px",
                        maxHeight: "300px",
                        overflowY: "auto",
                    }}
                >
                    {notifications.length ? (
                        notifications.map((notification) => (
                            <SingleNotification
                                key={notification.notificationId}
                                notificationId={notification.notificationId}
                                sourceId={notification.sourceId}
                                notificationType={notification.notificationType}
                                clickedOn={notification.clickedOn}
                                created={notification.created}
                                setShowNotifications={setShowNotifications}
                            />
                        ))
                    ) : (
                        <div
                            style={{
                                textAlign: "center",
                                alignItems: "center",
                            }}
                        >
                            <small style={{ color: "grey" }}>
                                No notifications to show here
                            </small>
                        </div>
                    )}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

export const sendNotification = async (
    sourceId,
    receiverId,
    notificationType
) => {
    const payload = {
        sourceId,
        receiverId,
        notificationType,
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
            "http://localhost:8080/add-notification",
            options
        );
        if (!response.ok) {
            console.log("error sending notification");
        }
    } catch (error) {
        console.error(error);
    }
};

export default Notifications;
