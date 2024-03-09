import { useState } from "react";
import { Button, Card, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AttendancePopup from "./AttendancePopup";

function SingleEvent({
    eventId,
    creator,
    title,
    description,
    startDate,
    endDate,
    eventUsers,
    currentUserId,
    currentUserStatus,
    pastEvent,
    updateEventAmount,
}) {
    const navigateTo = useNavigate();
    const [currentUserAttendance, setCurrentUserAttendance] =
        useState(currentUserStatus);
    const [showAttendancePopup, setShowAttendancePopup] = useState(false);

    const formatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };

    const formattedStartDate = new Date(startDate).toLocaleString(
        undefined,
        formatOptions
    );

    const formattedEndDate = new Date(endDate).toLocaleString(
        undefined,
        formatOptions
    );

    const handleSelect = (option) => {
        setCurrentUserAttendance(option);
        if (option !== currentUserAttendance) {
            updateAttendance(option);
        }
    };

    const updateAttendance = async (status) => {
        const payload = {
            eventId: eventId,
            userId: currentUserId,
            status,
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
                `http://localhost:8080/update-attendance`,
                options
            );
            if (response.ok) {
                updateEventAmount();
            } else {
                console.log("Attendance update failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Card style={{ marginTop: "20px" }}>
            <Card style={{ padding: "20px" }}>
                <Card.Title>{title}</Card.Title>
            </Card>
            <Card.Body>
                <Card.Text>{description}</Card.Text>
                <br></br>
                <div className="d-flex justify-content-between">
                    <Card.Text style={{ fontWeight: "bold" }}>
                        {formattedStartDate} - {formattedEndDate}
                    </Card.Text>
                </div>
                <br></br>
                <div className="d-flex justify-content-between">
                    <Dropdown onSelect={handleSelect}>
                        <Dropdown.Toggle
                            variant={
                                pastEvent
                                    ? "secondary"
                                    : currentUserAttendance === "Going"
                                    ? "success"
                                    : currentUserAttendance === "Invited"
                                    ? "secondary"
                                    : "danger"
                            }
                            disabled={pastEvent}
                            id="attendance-dropdown"
                        >
                            {pastEvent
                                ? currentUserAttendance === "Going"
                                    ? "Went"
                                    : "Didn't go"
                                : currentUserAttendance}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="Going">
                                Going
                            </Dropdown.Item>
                            <Dropdown.Item eventKey="Not going">
                                Not going
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button
                        disabled={eventUsers.length < 1}
                        onClick={() => setShowAttendancePopup(true)}
                    >
                        Attendance
                    </Button>
                    <AttendancePopup
                        title={"Attendance"}
                        users={eventUsers}
                        show={showAttendancePopup}
                        currentUserId={currentUserId}
                        onClose={() => setShowAttendancePopup(false)}
                        pastEvent={pastEvent}
                    />
                </div>
            </Card.Body>
            <Card.Footer>
                <div className="user-info" style={{}}>
                    <div
                        style={{
                            cursor: "pointer",
                            marginLeft: "10px",
                        }}
                        className="d-flex align-items-center"
                    >
                        <img
                            src={`http://localhost:8080/get-image/users/${creator.profilePic}`}
                            width="38"
                            height="38"
                            onClick={() =>
                                navigateTo(`/user/${creator.userId}`)
                            }
                            style={{
                                cursor: "pointer",
                                borderRadius: "100%",
                                objectFit: "cover",
                            }}
                        />
                        <div
                            className="d-flex align-items-center"
                            onClick={() => {
                                navigateTo(`/user/${creator.userId}`);
                            }}
                        >
                            <h5 style={{ marginLeft: "10px" }}>
                                {creator.firstName + " " + creator.lastName}
                            </h5>
                        </div>
                    </div>
                </div>
            </Card.Footer>
        </Card>
    );
}

export default SingleEvent;
