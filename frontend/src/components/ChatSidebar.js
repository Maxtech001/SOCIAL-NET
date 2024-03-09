import { useOutletContext } from "react-router-dom";
import ChatSidebarUser from "./ChatSidebarUser";

function ChatSidebar() {
    const sessionData = useOutletContext();
    const chattableUsers = sessionData.userData.chattableUsers;

    if (chattableUsers) {
        return (
            <div style={{ position: "fixed", width: "100%" }}>
                <div className="d-flex align-items-center">
                    <div className="p-2 font-weight-bold">
                        <div className="btn chat-button"></div>
                        Users you can chat with:
                    </div>
                </div>
                {chattableUsers.length > 0 ? (
                    chattableUsers.map((user) => (
                        <ChatSidebarUser
                            key={user.userId}
                            userId={user.userId}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            nickname={user.nickname}
                            profilePic={user.profilePic}
                        />
                    ))
                ) : (
                    <div>Nothing to see here...</div>
                )}
            </div>
        );
    }
}

export default ChatSidebar;
