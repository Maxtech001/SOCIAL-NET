import React from "react";
import { Modal, Button } from "react-bootstrap";
import PopupUser from "./PopupUser";

const Popup = ({ title, users, show, currentUserId, onClose }) => {
    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "50vh", overflowY: "auto" }}>
                {users.map((user) => (
                    <PopupUser
                        key={user.userId}
                        userId={user.userId}
                        firstName={user.firstName}
                        lastName={user.lastName}
                        currentUserId={currentUserId}
                        followStatus={user.currentUserFollowStatus}
                        isPublic={user.public}
                        onClose={onClose}
                        profilePic={user.profilePic}
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

export default Popup;
