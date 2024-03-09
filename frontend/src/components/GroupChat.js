import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { Card, ListGroup, Form, Button } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import ChatMsg, { formatDateWithRelativeTime } from "./ChatMsg";
import EmojiPicker from "emoji-picker-react";
import { throttle, waitForSocketConnection } from "./UserChat";
import ChatSidebarUser from "./ChatSidebarUser";

class Event {
    constructor(type, payload) {
        this.type = type;
        this.payload = payload;
    }
}

function GroupChat() {
    let { groupId } = useParams();
    const sessionData = useOutletContext();

    const formRef = useRef(null);
    const chatBoxRef = useRef(null);
    const ws = useRef(null);
    const scrollHeightBeforeLoad = useRef(null);
    const messageAmount = useRef(20);
    const messagesRendered = useRef(null);

    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [pageReady, setPageReady] = useState(false);
    const [groupChatName, setGroupChatName] = useState("");
    const [isValidChatter, setIsValidChatter] = useState(false);
    const [chatUsers, setChatUsers] = useState([]);
    const [showEmojis, setShowEmojis] = useState(false);
    const currentUserId = sessionData.sessionExists
        ? sessionData.userData.userId
        : null;

    const navigateTo = useNavigate();

    useEffect(() => {
        if (!sessionData.sessionExists) {
            navigateTo("/login");
            return;
        }
        const getChatData = async () => {
            const payload = {
                groupId: parseInt(groupId),
                currentUserId: currentUserId,
                amount: 20,
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
                    "http://localhost:8080/get-group-chat-data",
                    options
                );
                if (response.ok) {
                    const data = await response.json();
                    if (
                        data.groupData.currentUserMemberStatus === "owner" ||
                        data.groupData.currentUserMemberStatus ===
                            "group_members"
                    ) {
                        setIsValidChatter(true);
                    } else {
                        navigateTo("/");
                        return;
                    }

                    setChatUsers([
                        ...data.groupData.members,
                        data.groupData.owner,
                    ]);
                    setGroupChatName(data.groupData.groupTitle);
                    setMessages(data.messages ? data.messages : []);
                    messagesRendered.current = data.messages
                        ? data.messages.length
                        : 0;
                } else {
                    const statusMsg = await response.text();
                    console.log(statusMsg);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (sessionData.sessionExists) {
            getChatData();
            setPageReady(true);
        }
        messageAmount.current = 20;
    }, [groupId, currentUserId]);

    const submitMsgForm = (e) => {
        e.preventDefault();
        if (messageInput.trim()) {
            const msgBody = {
                senderId: currentUserId,
                groupId: parseInt(groupId),
                content: messageInput,
            };

            setMessageInput("");
            sendEvent("send_group_message", msgBody);
        }
    };

    const routeEvent = (event) => {
        if (event.type === undefined) {
            console.log("no type field in the event");
        }

        switch (event.type) {
            case "send_group_message":
                messageAmount.current = messageAmount.current + 1;
                getMessages(event.payload.groupId);
                break;
            case "new_group_message":
                if (
                    window.location.pathname ===
                    `/chat/group/${event.payload.groupId}`
                ) {
                    messageAmount.current = messageAmount.current + 1;
                    getMessages(event.payload.groupId);
                }
                break;
            case "get_group_messages":
                if (event.payload.messages) {
                    setMessages(event.payload.messages);
                    messagesRendered.current = event.payload.messages.length;
                }
                break;
            default:
                alert("unsupported message type");
                break;
        }
    };

    const sendEvent = (eventName, payload) => {
        const event = new Event(eventName, payload);

        waitForSocketConnection(
            ws.current,
            ws.current.send(JSON.stringify(event))
        );
        routeEvent(event);
    };

    const handleEmojiClick = (emoji) => {
        setMessageInput((prevMsg) => prevMsg + emoji.emoji);
    };

    const getMessages = (groupId) => {
        const payload = {
            groupId,
            amount: messageAmount.current,
        };

        sendEvent("get_group_messages", payload);
    };

    useEffect(() => {
        if (pageReady) {
            ws.current = new WebSocket(
                `ws://localhost:8080/ws?userId=${currentUserId}`
            );

            console.log("Attempting websocket connection");

            ws.current.onopen = () => {
                console.log("successfully connected");
            };

            ws.current.onclose = (event) => {
                console.log("socket closed connection", event);
            };

            ws.current.onerror = (err) => {
                console.log("Socket error: ", err);
            };

            ws.current.onmessage = (e) => {
                const eventData = JSON.parse(e.data);

                const event = Object.assign(new Event(), eventData);

                routeEvent(event);
            };

            const wsCurrent = ws.current;

            return () => {
                wsCurrent.close();
            };
        }
    }, [pageReady, currentUserId]);

    useEffect(() => {
        if (!isValidChatter) {
            return;
        }
        const divElement = chatBoxRef.current;
        const handleScroll = () => {
            throttle(loadAdditionalMessages(), 50);
        };

        divElement.scrollTop = divElement.scrollHeight;

        divElement.addEventListener("scroll", handleScroll);

        const loadAdditionalMessages = () => {
            if (
                divElement.scrollTop === 0 &&
                messagesRendered.current >= messageAmount.current
            ) {
                messageAmount.current += 10;
                scrollHeightBeforeLoad.current = divElement.scrollHeight;
                getMessages(parseInt(groupId));
            }
        };

        return () => {
            divElement.removeEventListener("scroll", handleScroll);
        };
    }, [chatBoxRef, groupId, currentUserId, isValidChatter]);

    useEffect(() => {
        if (!isValidChatter) {
            return;
        }
        if (chatBoxRef.current.scrollTop > 0) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        } else {
            chatBoxRef.current.scrollTop =
                chatBoxRef.current.scrollHeight -
                scrollHeightBeforeLoad.current;
        }
    }, [messages, isValidChatter]);

    const addTimeSeparator = (prevTime, nextTime) => {
        const prev = new Date(prevTime);
        const next = new Date(nextTime);
        const diffInMinutes = Math.abs((next - prev) / (1000 * 60));

        if (diffInMinutes > 15) {
            var dateText = formatDateWithRelativeTime(nextTime);
            return (
                <div className="text-center text-secondary mt-5">
                    {dateText.length === 5 ? `Today ${dateText}` : dateText}
                </div>
            );
        } else if (diffInMinutes > 5) {
            return <div className="my-2" />;
        }

        return null;
    };

    const getSenderDisplayname = (senderId) => {
        var displayName = "";
        chatUsers.forEach((user) => {
            if (user.userId === senderId) {
                displayName = `${user.firstName} ${user.lastName}`;
            }
        });
        return displayName;
    };

    if (Array.isArray(messages) && isValidChatter) {
        return (
            <div className="row">
                <div className="col-8">
                    <h1
                        style={{ textAlign: "center", marginTop: "5px" }}
                    >{`${groupChatName} chatroom`}</h1>
                    <Card style={{ margin: "10px", border: "3px grey solid" }}>
                        <div ref={chatBoxRef} className="chat-container">
                            <ListGroup variant="flush">
                                {messages.map((message, index) => {
                                    const prevTime =
                                        index > 0
                                            ? messages[index - 1].sent
                                            : null;
                                    const timeSeparator = addTimeSeparator(
                                        prevTime,
                                        message.sent
                                    );
                                    const isDifferentUser =
                                        index > 0
                                            ? messages[index - 1].senderId !==
                                              message.senderId
                                            : true;
                                    return (
                                        <ChatMsg
                                            key={message.messageId}
                                            messageId={message.messageId}
                                            content={message.content}
                                            sent={message.sent}
                                            timeSeparator={timeSeparator}
                                            senderDisplayname={getSenderDisplayname(
                                                message.senderId
                                            )}
                                            isSender={
                                                message.senderId ===
                                                currentUserId
                                            }
                                            isDifferentUser={isDifferentUser}
                                        />
                                    );
                                })}
                            </ListGroup>
                        </div>
                        <Card.Footer>
                            <Form
                                ref={formRef}
                                onSubmit={(e) => submitMsgForm(e)}
                            >
                                <Form.Group
                                    className="mb-3"
                                    controlId="messageInput"
                                >
                                    <Form.Control
                                        type="text"
                                        as={"textarea"}
                                        rows={"3"}
                                        placeholder="Enter your message"
                                        value={messageInput}
                                        onChange={(e) =>
                                            setMessageInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                !e.shiftKey &&
                                                e.key === "Enter"
                                            ) {
                                                submitMsgForm(e);
                                            }
                                        }}
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-between align-items-center">
                                    <Button variant="primary" type="submit">
                                        Send
                                    </Button>
                                    <div
                                        className="emoji-icon"
                                        onClick={() =>
                                            setShowEmojis(!showEmojis)
                                        }
                                    ></div>
                                </div>
                                <div
                                    style={{
                                        display: showEmojis ? "block" : "none",
                                    }}
                                >
                                    <EmojiPicker
                                        searchDisabled={true}
                                        skinTonesDisabled={true}
                                        previewConfig={{
                                            showPreview: false,
                                        }}
                                        width="100%"
                                        height={200}
                                        onEmojiClick={handleEmojiClick}
                                    />
                                </div>
                            </Form>
                        </Card.Footer>
                    </Card>
                </div>
                <div className="col-3">
                    <h1 style={{ marginTop: "5px" }}>Users in chat:</h1>
                    {chatUsers.map((user) => (
                        <ChatSidebarUser
                            key={user.userId}
                            userId={user.userId}
                            firstName={user.firstName}
                            lastName={user.lastName}
                            profilePic={user.profilePic}
                            isGroupChat={true}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

export default GroupChat;
