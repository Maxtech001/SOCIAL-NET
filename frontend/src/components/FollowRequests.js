import { useEffect, useState } from "react";
import SingleFollowRequest from "./SingleFollowRequest";

function FollowRequests({ userId }) {
    const [followRequests, setFollowRequests] = useState([]);
    const [updateRequests, setUpdateRequests] = useState(false);
    const [showRequests, setShowRequests] = useState(false);

    useEffect(() => {
        const fetchFollowRequests = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-follow-requests?userId=${userId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setFollowRequests(data);
                } else {
                    console.error(
                        "Failed to fetch follow requests:",
                        response.status
                    );
                }
            } catch (error) {
                console.error("Error fetching follow requests:", error);
            }
        };

        fetchFollowRequests();
    }, [updateRequests]);

    return (
        <>
            <div className="d-flex align-items-center">
                <div
                    className="p-2 font-weight-bold"
                    style={{ cursor: followRequests.length ? "pointer" : "" }}
                    onClick={() => setShowRequests(!showRequests)}
                    
                >
                    <div className="btn follow-requests-icon"></div>
                    {`Follow Requests (${followRequests.length})`}
                </div>
            </div>
            <div style={{ marginLeft: "10px" }}>
                {showRequests &&
                    followRequests.map((request) => (
                        <SingleFollowRequest
                            key={request.userId}
                            currentUserId={userId}
                            userId={request.userId}
                            firstName={request.firstName}
                            lastName={request.lastName}
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

export default FollowRequests;
