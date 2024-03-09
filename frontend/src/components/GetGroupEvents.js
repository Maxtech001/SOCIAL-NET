import { useEffect, useState } from "react";
import SingleEvent from "./SingleEvent";

function GetGroupEvents({
    groupId,
    eventAmount,
    currentUserId,
    updateEventAmount,
}) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-events?groupId=${groupId}&currentUserId=${currentUserId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setEvents(data);
                } else {
                    console.error("Failed to fetch events:", response.status);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };

        fetchEvents();
    }, [eventAmount]);

    if (!Array.isArray(events)) {
        return <div>Nothing to see here...</div>;
    }

    const getCurrentUserAttendance = (eventUsers) => {
        var result = "Invited";
        eventUsers.forEach((user) => {
            if (user.userId === parseInt(currentUserId)) {
                result = user.going ? "Going" : "Not going";
            }
        });
        return result;
    };

    return (
        <div>
            {events.length > 0 ? (
                <>
                    {events.filter((event) => {
                        const currentDate = new Date();
                        const startDate = new Date(event.startDate);
                        const endDate = new Date(event.endDate);

                        return (
                            currentDate >= startDate && currentDate <= endDate
                        );
                    }).length > 0 && (
                        <div style={{ marginTop: "50px" }}>
                            <h3>Active Events</h3>
                            {events
                                .filter((event) => {
                                    const currentDate = new Date();
                                    const startDate = new Date(event.startDate);
                                    const endDate = new Date(event.endDate);

                                    return (
                                        currentDate >= startDate &&
                                        currentDate <= endDate
                                    );
                                })
                                .map((event) => (
                                    <SingleEvent
                                        key={event.eventId}
                                        eventId={event.eventId}
                                        creator={event.creator}
                                        title={event.title}
                                        description={event.description}
                                        startDate={event.startDate}
                                        endDate={event.endDate}
                                        eventUsers={event.eventUsers}
                                        currentUserId={currentUserId}
                                        currentUserStatus={getCurrentUserAttendance(
                                            event.eventUsers
                                        )}
                                        updateEventAmount={updateEventAmount}
                                    />
                                ))}
                        </div>
                    )}

                    {events
                        .filter((event) => {
                            const currentDate = new Date();
                            const startDate = new Date(event.startDate);

                            return currentDate < startDate;
                        })
                        .sort(
                            (a, b) =>
                                new Date(a.startDate) - new Date(b.startDate)
                        ).length > 0 && ( // Sort by start date
                        <div style={{ marginTop: "50px" }}>
                            <h3>Upcoming Events</h3>
                            {events
                                .filter((event) => {
                                    const currentDate = new Date();
                                    const startDate = new Date(event.startDate);

                                    return currentDate < startDate;
                                })
                                .sort(
                                    (a, b) =>
                                        new Date(a.startDate) -
                                        new Date(b.startDate)
                                ) // Sort by start date
                                .map((event) => (
                                    <SingleEvent
                                        key={event.eventId}
                                        eventId={event.eventId}
                                        creator={event.creator}
                                        title={event.title}
                                        description={event.description}
                                        startDate={event.startDate}
                                        endDate={event.endDate}
                                        eventUsers={event.eventUsers}
                                        currentUserId={currentUserId}
                                        currentUserStatus={getCurrentUserAttendance(
                                            event.eventUsers
                                        )}
                                        updateEventAmount={updateEventAmount}
                                    />
                                ))}
                        </div>
                    )}

                    {events
                        .filter((event) => {
                            const currentDate = new Date();
                            const endDate = new Date(event.endDate);

                            return currentDate > endDate;
                        })
                        .sort(
                            (a, b) => new Date(b.endDate) - new Date(a.endDate)
                        ).length > 0 && ( // Sort by end date in descending order
                        <div style={{ marginTop: "50px" }}>
                            <h3>Past Events</h3>
                            {events
                                .filter((event) => {
                                    const currentDate = new Date();
                                    const endDate = new Date(event.endDate);

                                    return currentDate > endDate;
                                })
                                .sort(
                                    (a, b) =>
                                        new Date(b.endDate) -
                                        new Date(a.endDate)
                                ) // Sort by end date in descending order
                                .map((event) => (
                                    <SingleEvent
                                        key={event.eventId}
                                        eventId={event.eventId}
                                        creator={event.creator}
                                        title={event.title}
                                        description={event.description}
                                        startDate={event.startDate}
                                        endDate={event.endDate}
                                        eventUsers={event.eventUsers}
                                        currentUserId={currentUserId}
                                        currentUserStatus={getCurrentUserAttendance(
                                            event.eventUsers
                                        )}
                                        pastEvent={true}
                                    />
                                ))}
                        </div>
                    )}
                </>
            ) : (
                <div>Nothing to see here...</div>
            )}
        </div>
    );
}

export default GetGroupEvents;
