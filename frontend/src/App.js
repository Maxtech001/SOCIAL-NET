import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom"; // Import useNavigate
import { hasSession } from "./components/Auth";
import Header from "./components/Header";

function App() {
    const [sessionExists, setSessionExists] = useState(null);
    const [userData, setUserData] = useState({});
    const location = useLocation();

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                const result = await hasSession();
                setSessionExists(result.isAuthorized);
                setUserData(result.user);
            } catch (error) {
                console.log(error);
            }
        };

        fetchSessionData();
    }, [location]);

    if (sessionExists === null) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {sessionExists ? (
                <Header
                    userId={userData.userId}
                    firstName={userData.firstName}
                    lastName={userData.lastName}
                    profilePic={userData.profilePic}
                    notifications={userData.notifications}
                />
            ) : null}
            <div style={{ marginTop: sessionExists ? "55px" : "0" }}>
                <Outlet context={{ sessionExists, userData }} />
            </div>
        </>
    );
}

export default App;
