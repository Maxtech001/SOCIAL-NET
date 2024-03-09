import { useEffect, useState } from "react";
import SingleJoinRequest from "./SingleJoinRequest";

function GroupJoinRequests({ groupId, setDataLoaded }) {
    const [joinRequests, setJoinRequests] = useState([]);
    const [updateRequests, setUpdateRequests] = useState(false);
    const [showRequests, setShowRequests] = useState(false);

    useEffect(() => {
        const fetchJoinRequests = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-group-join-requests?groupId=${groupId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setJoinRequests(data);
                } else {
                    console.error(
                        "Failed to fetch join requests:",
                        response.status
                    );
                }
            } catch (error) {
                console.error("Error fetching join requests:", error);
            }
        };

        fetchJoinRequests();
        setDataLoaded(false);
    }, [updateRequests]);

    return (
        <>
            <div className="d-flex align-items-center">
                <div
                    className="p-2 font-weight-bold"
                    style={{ cursor: joinRequests.length ? "pointer" : "" }}
                    onClick={() => setShowRequests(!showRequests)}
                >
                    <div className="btn follow-requests-icon"></div>
                    {`Join Requests (${joinRequests.length})`}
                </div>
            </div>
            <div style={{ marginLeft: "10px" }}>
                {showRequests &&
                    joinRequests.map((request) => (
                        <SingleJoinRequest
                            key={request.userId}
                            userId={request.userId}
                            firstName={request.firstName}
                            lastName={request.lastName}
                            groupId={groupId}
                            nickname={request.nickname}
                            profilePic={request.profilePic}
                            updateRequests={updateRequests}
                            setUpdateRequests={setUpdateRequests}
                        />
                    ))}
            </div>
        </>
    );
}

export default GroupJoinRequests;
