import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SingleGroupInvite({
    groupId,
    groupTitle,
    img,
    currentUserId,
    updateInvites,
    setUpdateInvites,
}) {
    const navigateTo = useNavigate();

    const handleInvite = async (accepted) => {
        const payload = {
            groupId: parseInt(groupId),
            userId: parseInt(currentUserId),
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
                "http://localhost:8080/handle-group-invite",
                options
            );
            if (response.ok) {
                setUpdateInvites(!updateInvites);
            } else {
                console.log("error handling group invite");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <div
                key={groupId}
                className="d-flex justify-content-between align-items-center"
            >
                <div className="user-info">
                    <div
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                        className="d-flex align-items-center"
                    >
                        <img
                            src={`http://localhost:8080/get-image/groups/${img}`}
                            width="38"
                            height="38"
                            onClick={() => navigateTo(`/group/${groupId}`)}
                            style={{
                                cursor: "pointer",
                                borderRadius: "100%",
                                objectFit: "cover",
                            }}
                        />
                        <div
                            className="d-flex align-items-center"
                            onClick={() => {
                                navigateTo(`/group/${groupId}`);
                            }}
                        >
                            <h5 style={{ marginLeft: "10px" }}>{groupTitle}</h5>
                        </div>
                    </div>
                </div>
                <div>
                    <Button
                        onClick={() => handleInvite(true)}
                        style={{ marginRight: "3px", borderRadius: "100px" }}
                        variant="success"
                    >
                        ✓
                    </Button>
                    <Button
                        onClick={() => handleInvite(false)}
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

export default SingleGroupInvite;
