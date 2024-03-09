import React, { useState } from "react";
import { Modal, Button, Tab } from "react-bootstrap";
import PopupUser from "./PopupUser";

function AttendancePopup({ users, show, currentUserId, onClose, pastEvent }) {
    const [activeTab, setActiveTab] = useState("going");

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header>
                <div className="tab-container">
                    <button
                        onClick={() => setActiveTab("going")}
                        className={`tab-button ${
                            activeTab === "going" ? "active" : ""
                        }`}
                    >
                        {pastEvent ? "Went" : "Going"}
                    </button>
                    <button
                        onClick={() => setActiveTab("notgoing")}
                        className={`tab-button ${
                            activeTab === "notgoing" ? "active" : ""
                        }`}
                    >
                        {pastEvent ? "Didn't go" : "Not going"}
                    </button>
                </div>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: "50vh", overflowY: "auto" }}>
                <Tab.Container activeKey={activeTab}>
                    <Tab.Content>
                        <Tab.Pane eventKey="going">
                            {users
                                .filter((user) => user.going)
                                .map((user) => (
                                    <PopupUser
                                        key={user.userId}
                                        userId={user.userId}
                                        firstName={user.firstName}
                                        lastName={user.lastName}
                                        currentUserId={currentUserId}
                                        followStatus={
                                            user.currentUserFollowStatus
                                        }
                                        isPublic={user.public}
                                        onClose={onClose}
                                        profilePic={user.profilePic}
                                    />
                                ))}
                        </Tab.Pane>
                        <Tab.Pane eventKey="notgoing">
                            {users
                                .filter((user) => !user.going)
                                .map((user) => (
                                    <PopupUser
                                        key={user.userId}
                                        userId={user.userId}
                                        firstName={user.firstName}
                                        lastName={user.lastName}
                                        currentUserId={currentUserId}
                                        followStatus={
                                            user.currentUserFollowStatus
                                        }
                                        isPublic={user.public}
                                        onClose={onClose}
                                        profilePic={user.profilePic}
                                    />
                                ))}
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AttendancePopup;
