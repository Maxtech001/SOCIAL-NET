import { useNavigate } from "react-router-dom";

function ChatSidebarUser({
    userId,
    firstName,
    lastName,
    nickname,
    profilePic,
    isGroupChat,
}) {
    const navigateTo = useNavigate();
    return (
        <div key={userId}>
            <div className="user-info">
                <div
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                    className="d-flex align-items-center"
                >
                    <img
                        src={`http://localhost:8080/get-image/users/${profilePic}`}
                        width="38"
                        height="38"
                        onClick={() =>
                            navigateTo(
                                isGroupChat
                                    ? `/user/${userId}`
                                    : `/chat/user/${userId}`
                            )
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
                            navigateTo(
                                isGroupChat
                                    ? `/user/${userId}`
                                    : `/chat/user/${userId}`
                            );
                        }}
                    >
                        <h5 style={{ marginLeft: "10px" }}>
                            {(firstName + " " + lastName).slice(0, 15) +
                                ((firstName + " " + lastName).length > 16
                                    ? "..."
                                    : "")}
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
            <hr />
        </div>
    );
}

export default ChatSidebarUser;
