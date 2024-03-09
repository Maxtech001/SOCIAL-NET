import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import PopupGetChecked from "./PopupCheckBox";

const PopupAddPrivacy = ({
    title,
    show,
    currentUserId,
    onClose,
    onFollowersSelection,
    selectedFollowers,
}) => {
    const [followers, setFollowers] = useState([]);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/followers?userId=${currentUserId}`
                );
                if (response.ok) {
                    const followersData = await response.json();
                    setFollowers(followersData);
                } else {
                    console.log("Failed to fetch followers");
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (show) {
            fetchFollowers();
        }
    }, [currentUserId, show]);

    if (followers.length === 0) {
        return null;
    }

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header
                style={{
                    backgroundColor: "rgb(200, 236, 248)",
                    color: "rgb(41, 16, 93)",
                }}
            >
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {followers.map((follower) => (
                    <PopupGetChecked
                        key={follower.userId}
                        userId={follower.userId}
                        firstName={follower.firstName}
                        lastName={follower.lastName}
                        onClose={onClose}
                        profilePic={follower.profilePic}
                        onFollowersSelection={onFollowersSelection}
                        selectedFollowers={selectedFollowers}
                    />
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PopupAddPrivacy;
