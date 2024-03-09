import { useState } from "react";
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import { sendNotification } from "./Notifications";

function PopupCreateEvent({
    title,
    show,
    onClose,
    groupId,
    currentUserId,
    updateEventAmount,
    groupMembers,
}) {
    const [eventTitle, setEventTitle] = useState("");
    const [eventDescription, setEventDescription] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    const isFutureDate = (date) => date > new Date();
    const isFurtherThanStartDate = (date) => date > startDate;

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        const payload = {
            groupId: parseInt(groupId),
            userId: currentUserId,
            title: eventTitle,
            description: eventDescription,
            startDate,
            endDate,
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
                "http://localhost:8080/create-event",
                options
            );
            if (response.ok) {
                setEventTitle("");
                setEventDescription("");
                updateEventAmount();
                sendEventNotifications();
            } else {
                console.log("Error creating group:", response.status);
                const statusMsg = await response.text();
                console.log(statusMsg);
            }
        } catch (error) {
            console.error("An error occurred:", error);
        }
        onClose();
    };

    const sendEventNotifications = () => {
        groupMembers.forEach((member) => {
            if (member.userId !== parseInt(currentUserId)) {
                sendNotification(
                    parseInt(groupId),
                    member.userId,
                    "groupEvent"
                );
            }
        });
    };

    return (
        <Modal show={show} onHide={onClose} centered>
            <Modal.Header
                style={{
                    backgroundColor: "lightgray",
                    color: "rgb(41, 16, 93)",
                }}
            >
                <Modal.Title>{title}</Modal.Title>
                <button
                    type="button"
                    className="close"
                    aria-label="Close"
                    onClick={onClose}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleCreateEvent}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            placeholder="Max 30 symbols"
                            value={eventTitle}
                            onChange={(e) => setEventTitle(e.target.value)}
                            maxLength={30}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            className="form-control"
                            id="description"
                            rows="3"
                            placeholder="Max 200 symbols"
                            value={eventDescription}
                            onChange={(e) =>
                                setEventDescription(e.target.value)
                            }
                            maxLength={200}
                            required
                        ></textarea>
                    </div>
                    <div className="d-flex justify-content-between">
                        <div className="form-group">
                            <label htmlFor="startDate">Beginning </label>
                            <br></br>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => {
                                    if (isFutureDate(date)) {
                                        setStartDate(date);
                                    }
                                }}
                                showTimeSelect
                                minDate={new Date()}
                                dateFormat="dd-MM-yyyy HH:mm"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="endDate">End </label>
                            <br></br>
                            <DatePicker
                                selected={
                                    isFurtherThanStartDate(endDate)
                                        ? endDate
                                        : startDate
                                }
                                onChange={(date) => {
                                    if (isFurtherThanStartDate(date)) {
                                        setEndDate(date);
                                    }
                                }}
                                showTimeSelect
                                minDate={startDate}
                                dateFormat="dd-MM-yyyy HH:mm"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-danger">
                        Create Event
                    </button>
                </form>
            </Modal.Body>
        </Modal>
    );
}

export default PopupCreateEvent;
