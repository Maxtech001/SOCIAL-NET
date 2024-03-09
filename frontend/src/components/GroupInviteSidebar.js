import { useEffect, useState } from "react";
import SingleGroupInvite from "./SingleGroupInvite";

function GroupInviteSidebar({ userId }) {
    const [groupInvites, setGroupInvites] = useState([]);
    const [updateInvites, setUpdateInvites] = useState(false);
    const [showInvites, setShowInvites] = useState(false);

    useEffect(() => {
        const fetchGroupInvites = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-group-invites?userId=${userId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setGroupInvites(data);
                } else {
                    console.error(
                        "Failed to fetch group invites:",
                        response.status
                    );
                }
            } catch (error) {
                console.error("Error fetching group invites:", error);
            }
        };

        fetchGroupInvites();
    }, [updateInvites]);

    return (
        <>
            <div className="d-flex align-items-center">
                <div
                    className="p-2 font-weight-bold"
                    style={{ cursor: groupInvites.length ? "pointer" : "" }}
                    onClick={() => setShowInvites(!showInvites)}
                >
                    <div className="btn goups-icon"></div>
                    {`Group Invites (${groupInvites.length})`}
                </div>
            </div>
            <div style={{ marginLeft: "10px" }}>
                {showInvites &&
                    groupInvites.map((invite) => (
                        <SingleGroupInvite
                            key={invite.groupId}
                            groupId={invite.groupId}
                            groupTitle={invite.groupTitle}
                            currentUserId={userId}
                            img={invite.groupPic}
                            updateInvites={updateInvites}
                            setUpdateInvites={setUpdateInvites}
                        />
                    ))}
            </div>
        </>
    );
}

export default GroupInviteSidebar;
