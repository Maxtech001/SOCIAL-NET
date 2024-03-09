import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SingleJoinRequest({
    userId,
    firstName,
    lastName,
    nickname,
    profilePic,
    groupId,
    updateRequests,
    setUpdateRequests,
}) {
    const navigateTo = useNavigate();

    const handleRequest = async (accepted) => {
        const payload = {
            groupId: parseInt(groupId),
            userId,
            accepted,
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
                "http://localhost:8080/handle-group-join-request",
                options
            );
            if (response.ok) {
                setUpdateRequests(!updateRequests);
            } else {
                console.log("error handling follow request");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div
                key={userId}
                className="d-flex justify-content-between align-items-center"
            >
                <div className="user-info">
                    <div
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                        className="d-flex align-items-center"
                    >
                        <img
                            src={`http://localhost:8080/get-image/users/${profilePic}`}
                            width="38"
                            height="38"
                            onClick={() => navigateTo(`/user/${userId}`)}
                            style={{
                                cursor: "pointer",
                                borderRadius: "100%",
                                objectFit: "cover",
                            }}
                        />
                        <div
                            className="d-flex align-items-center"
                            onClick={() => {
                                navigateTo(`/user/${userId}`);
                            }}
                        >
                            <h5 style={{ marginLeft: "10px" }}>
                                {firstName + " " + lastName}
                            </h5>
                            <h5 style={{ marginLeft: "5px" }}>
                                {nickname && (
                                    <small className="text-muted">
                                        ({nickname})
                                    </small>
                                )}
                            </h5>
                        </div>
                    </div>
                </div>
                <div>
                    <Button
                        onClick={() => handleRequest(true)}
                        style={{ marginRight: "3px", borderRadius: "100px" }}
                        variant="success"
                    >
                        ✓
                    </Button>
                    <Button
                        onClick={() => handleRequest(false)}
                        style={{ borderRadius: "100px" }}
                        variant="danger"
                    >
                        X
                    </Button>
                </div>
            </div>
            <hr />
        </>
    );
}

export default SingleJoinRequest;
