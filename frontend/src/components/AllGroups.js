import { useEffect, useState } from "react";
import SingleGroup from "./SingleGroup";
import { useNavigate, useOutletContext } from "react-router-dom";

function AllGroups() {
    const [groups, setGroups] = useState(null);
    const navigateTo = useNavigate();
    const sessionData = useOutletContext();

    useEffect(() => {
        if (!sessionData.sessionExists) {
            navigateTo("/login");
            return;
        }

        const fetchAllGroups = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-all-groups`
                );
                if (response.ok) {
                    const data = await response.json();
                    setGroups(data);
                } else {
                    console.error("Failed to fetch groups:", response.status);
                }
            } catch (error) {
                console.error("Error fetching groups:", error);
            }
        };

        fetchAllGroups();
    }, []);

    if (groups && sessionData.sessionExists) {
        return (
            <div style={{ width: "80%", margin: "auto" }}>
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <SingleGroup
                            key={group.groupId}
                            groupId={group.groupId}
                            title={group.groupTitle}
                            description={group.groupDescription}
                            img={group.groupPic}
                            owner={group.owner}
                        />
                    ))
                ) : (
                    <div>There are no groups to be found</div>
                )}
            </div>
        );
    }
}

export default AllGroups;
