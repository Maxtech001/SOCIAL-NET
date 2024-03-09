import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import ChatSidebar from "./ChatSidebar";
import { Card, ListGroup, Form, Button } from "react-bootstrap";
import React, { useEffect, useRef, useState } from "react";
import ChatMsg, { formatDateWithRelativeTime } from "./ChatMsg";
import EmojiPicker from "emoji-picker-react";

class Event {
    constructor(type, payload) {
        this.type = type;
        this.payload = payload;
    }
}

function UserChat() {
    let { userId } = useParams();
    const sessionData = useOutletContext();

    const formRef = useRef(null);
    const chatBoxRef = useRef(null);
    const ws = useRef(null);
    const scrollHeightBeforeLoad = useRef(null);
    const messageAmount = useRef(20);
    const messagesRendered = useRef(null);
    const currentUserId = sessionData.sessionExists
        ? sessionData.userData.userId
        : null;

    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [pageReady, setPageReady] = useState(false);
    const [otherChatterName, setOtherChatterName] = useState("");
    const [isValidChatRecipient, setIsValidChatRecipient] = useState(false);
    const [showEmojis, setShowEmojis] = useState(false);

    const navigateTo = useNavigate();

    useEffect(() => {
        if (!sessionData.sessionExists) {
            navigateTo("/login");
            return;
        }

        const validateRecipient = () => {
            var isValid = false;
            sessionData.userData.chattableUsers.forEach((user) => {
                if (parseInt(userId) === user.userId) {
                    isValid = true;
                    return;
                }
            });
            if (!isValid) {
                navigateTo("/");
            }
            setIsValidChatRecipient(isValid);
        };

        if (sessionData.sessionExists) {
            validateRecipient();
        }
    });

    const submitMsgForm = (e) => {
        e.preventDefault();
        if (messageInput.trim()) {
            const msgBody = {
                senderId: currentUserId,
                receiverId: parseInt(userId),
                content: messageInput,
            };

            setMessageInput("");
            sendEvent("send_message", msgBody);
        }
    };

    const routeEvent = (event) => {
        if (event.type === undefined) {
            console.log("no type field in the event");
        }

        switch (event.type) {
            case "send_message":
                messageAmount.current = messageAmount.current + 1;
                getMessages(event.payload.senderId, event.payload.receiverId);
                break;
            case "new_message":
                if (
                    window.location.pathname ===
                    `/chat/user/${event.payload.senderId}`
                ) {
                    messageAmount.current = messageAmount.current + 1;
                    getMessages(
                        event.payload.senderId,
                        event.payload.receiverId
                    );
                }
                break;
            case "get_messages":
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

    const getMessages = (currentChatterId, otherChatterId) => {
        const payload = {
            currentChatterId,
            otherChatterId,
            amount: messageAmount.current,
        };

        sendEvent("get_messages", payload);
    };

    useEffect(() => {
        const getChatData = async () => {
            const payload = {
                currentChatterId: currentUserId,
                otherChatterId: parseInt(userId),
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
                    "http://localhost:8080/get-chat-data",
                    options
                );
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data.messages ? data.messages : []);
                    setOtherChatterName(data.otherChatterDisplayname);
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

        getChatData();
        setPageReady(true);
        messageAmount.current = 20;
    }, [userId, currentUserId]);

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
        if (!isValidChatRecipient) {
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
                getMessages(currentUserId, parseInt(userId));
            }
        };

        return () => {
            divElement.removeEventListener("scroll", handleScroll);
        };
    }, [chatBoxRef, userId, currentUserId, isValidChatRecipient]);

    useEffect(() => {
        if (!isValidChatRecipient) {
            return;
        }
        if (chatBoxRef.current.scrollTop > 0) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        } else {
            chatBoxRef.current.scrollTop =
                chatBoxRef.current.scrollHeight -
                scrollHeightBeforeLoad.current;
        }
    }, [messages, isValidChatRecipient]);

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

    if (
        Array.isArray(messages) &&
        isValidChatRecipient &&
        sessionData.sessionExists
    ) {
        return (
            <div className="row">
                <div className="col-8">
                    <h1
                        style={{ textAlign: "center", marginTop: "5px" }}
                    >{`Chatting with ${otherChatterName}`}</h1>
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
                                    return (
                                        <ChatMsg
                                            key={message.messageId}
                                            messageId={message.messageId}
                                            content={message.content}
                                            sent={message.sent}
                                            timeSeparator={timeSeparator}
                                            isSender={
                                                message.senderId ===
                                                currentUserId
                                            }
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
                    <ChatSidebar />
                </div>
            </div>
        );
    }
}

export function waitForSocketConnection(socket, callback) {
    setTimeout(function () {
        if (socket && socket.readyState === 1) {
            console.log("Connection is made");
            if (callback != null) {
                callback();
            }
        } else {
            console.log("wait for connection...");
            waitForSocketConnection(socket, callback);
        }
    }, 5);
}

export function throttle(func, wait) {
    var lastEvent = 0;
    return function () {
        var currentTime = new Date();
        if (currentTime - lastEvent > wait) {
            func.apply(this, arguments);
            lastEvent = currentTime;
        }
    };
}

export default UserChat;
