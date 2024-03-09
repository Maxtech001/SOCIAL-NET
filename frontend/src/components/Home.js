import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import GetPosts from "./Posts";
import CreatePost from "./Poster";
import ChatSidebar from "./ChatSidebar";
import GroupsSidebar from "./GroupsSidebar";
import FollowRequests from "./FollowRequests";
import GroupInviteSidebar from "./GroupInviteSidebar";

function Home() {
    const navigateTo = useNavigate();
    const sessionData = useOutletContext();
    const [postAmount, setPostAmount] = useState(null);

    useEffect(() => {
        if (!sessionData.sessionExists) {
            navigateTo("/login");
        }
    });

    const updatePostAmount = () => {
        setPostAmount((prevAmount) => prevAmount + 1);
    };

    if (sessionData.sessionExists) {
        return (
            <>
                <div className="row" style={{ margin: "auto" }}>
                    <div className="col-3" style={{ paddingLeft: "0px" }}>
                        <div
                            className="col-3"
                            style={{ position: "fixed", paddingLeft: "0px" }}
                        >
                            <div className="scrollable-element">
                                <div
                                    style={{
                                        direction: "ltr",
                                        marginTop: "10px",
                                    }}
                                >
                                    <GroupsSidebar
                                        userId={sessionData.userData.userId}
                                    />
                                    <FollowRequests
                                        userId={sessionData.userData.userId}
                                    />
                                    <GroupInviteSidebar
                                        userId={sessionData.userData.userId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-5 posts">
                        <CreatePost
                            userId={sessionData.userData.userId}
                            isGroup={false}
                            groupId={null}
                            updatePostAmount={updatePostAmount}
                        />
                        <GetPosts
                            userId={sessionData.userData.userId}
                            postAmount={postAmount}
                        />
                    </div>
                    <div className="col-3">
                        <ChatSidebar userId={sessionData.userData.userId} />
                    </div>
                </div>
            </>
        );
    }
}

export default Home;
