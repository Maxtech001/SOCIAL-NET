import { useNavigate } from "react-router-dom";

function GroupsSidebarGroup({ userId, groupId, title, groupPic, isOwner }) {
    const navigateTo = useNavigate();
    return (
        <div key={userId}>
            <div className="user-info">
                <div
                    className="d-flex"
                    style={{ cursor: "pointer", display: "flex" }}
                    onClick={() => {
                        navigateTo(`/group/${groupId}`);
                    }}
                >
                    <img
                        src={`http://localhost:8080/get-image/groups/${groupPic}`}
                        width="38"
                        height="38"
                    />
                    <div
                        className="d-flex align-items-center card-text"
                        style={{ marginLeft: "10px", alignItems: "center" }}
                    >
                        {title}
                    </div>
                </div>
                {isOwner ? (
                    <div className="d-flex align-items-center">
                        <img
                            src={`http://localhost:3000/icons/Star_72px.png`}
                            width="16"
                            height="16"
                            style={{ marginLeft: "20px" }}
                        />
                    </div>
                ) : null}
            </div>
            <hr />
        </div>
    );
}

export default GroupsSidebarGroup;
