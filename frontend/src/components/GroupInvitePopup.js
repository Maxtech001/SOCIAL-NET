import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import PopupUserInvite from "./PopupUserInvite";

const GroupInvitePopup = ({ title, show, currentUserId, onClose, groupId }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const getInvitableUsers = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-invitable-users?userId=${currentUserId}&groupId=${groupId}`
                );
                if (response.ok) {
                    const followersData = await response.json();
                    setUsers(followersData);
                } else {
                    console.log("Failed to fetch followers");
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (show) {
            getInvitableUsers();
        }
    }, [currentUserId, show, groupId]);

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {users.length ? (
                    users.map((user) => (
                        <PopupUserInvite
                            key={user.userId}
                            userId={user.userId}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            currentUserId={currentUserId}
                            onClose={onClose}
                            profilePic={user.profilePic}
                            groupId={groupId}
                        />
                    ))
                ) : (
                    <div>No users to invite</div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GroupInvitePopup;
