import React, { useState, useEffect } from "react";
import GroupsSidebarGroup from "./GroupsSidebarGroup";

function GroupsSidebar({ userId }) {
    const [groups, setGroups] = useState([]);
    const [showGroups, setShowGroups] = useState(false);
    const [groupAmount, setGroupAmount] = useState(0);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-groups?userId=${userId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setGroups(data);
                    setGroupAmount(
                        (data.memberGroups ? data.memberGroups.length : 0) +
                            (data.userGroups ? data.userGroups.length : 0)
                    );
                } else {
                    console.error("Failed to fetch groups:", response.status);
                }
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };

        fetchGroups();
    }, []);

    return (
        <>
            <div
                className="d-flex align-items-center"
                style={{
                    cursor:
                        groups.userGroups || groups.memberGroups
                            ? "pointer"
                            : "",
                }}
                onClick={() => setShowGroups(!showGroups)}
            >
                <div className="p-2 font-weight-bold">
                    <div className="btn goups-icon"></div>
                    {`Groups (${groupAmount})`}
                </div>
            </div>
            <div style={{ marginLeft: "10px" }}>
                {groups.userGroups != null && showGroups
                    ? groups.userGroups.map((group) => (
                          <GroupsSidebarGroup
                              key={group.groupId}
                              groupId={group.groupId}
                              userId={group.userId}
                              title={group.groupTitle}
                              groupPic={group.groupPic}
                              isOwner={true}
                          />
                      ))
                    : null}
                {groups.memberGroups != null && showGroups
                    ? groups.memberGroups.map((group) => (
                          <GroupsSidebarGroup
                              key={group.groupId}
                              groupId={group.groupId}
                              userId={group.userId}
                              title={group.groupTitle}
                              groupPic={group.groupPic}
                              isOwner={false}
                          />
                      ))
                    : null}
            </div>
        </>
    );
}

export default GroupsSidebar;
