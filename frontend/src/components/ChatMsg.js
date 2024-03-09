import React, { useState } from "react";
import { ListGroup } from "react-bootstrap";

function ChatMsg({
    messageId,
    content,
    sent,
    timeSeparator,
    isSender,
    senderDisplayname,
    isDifferentUser,
}) {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <React.Fragment>
            {timeSeparator}
            {senderDisplayname && isDifferentUser ? (
                <small
                    className={`senderName${isSender ? "Sent" : "Received"}`}
                >
                    {senderDisplayname}
                </small>
            ) : null}
            <ListGroup.Item
                key={messageId}
                className="list-group-item-no-border"
                style={{
                    textAlign: isSender ? "right" : "left",
                    marginTop: "5px",
                }}
            >
                <div
                    className={`messageContainer${
                        isSender ? "Sent" : "Received"
                    }`}
                >
                    <div
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className={`msgBox${isSender ? "Sent" : "Received"}`}
                    >
                        <span style={{ whiteSpace: "pre-wrap" }}>
                            {content}
                        </span>
                    </div>
                    <div
                        style={{
                            visibility: isHovering ? "visible" : "hidden",
                            color: "gray",
                            fontSize: "12px",
                            display: "block",
                            marginTop: "4px",
                        }}
                    >
                        <span>{formatDateWithRelativeTime(sent)}</span>
                    </div>
                </div>
            </ListGroup.Item>
        </React.Fragment>
    );
}

function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

export function formatDateWithRelativeTime(inputDate) {
    const date = new Date(inputDate);
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const diffInDays = Math.floor((today - date) / oneDay);

    const daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    if (diffInDays === 0) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    } else if (diffInDays === 1) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `yesterday ${hours}:${minutes}`;
    } else if (diffInDays < 7) {
        const dayOfWeek = daysOfWeek[date.getDay()];
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${dayOfWeek} ${hours}:${minutes}`;
    } else {
        return formatDate(inputDate);
    }
}

export default ChatMsg;
