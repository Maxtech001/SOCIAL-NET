import React, { useState } from "react";
import { Dropdown, Form, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SearchBar() {
    const [searchText, setSearchText] = useState("");
    const [showOptions, setShowOptions] = useState(false);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);

    const navigateTo = useNavigate();

    const handleSearchChange = async (event) => {
        setSearchText(event.target.value.trimStart());

        if (event.target.value.trimStart()) {
            try {
                const response = await fetch(
                    `http://localhost:8080/search?value=${event.target.value}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setShowOptions(
                        data.users.length + data.groups.length ? true : false
                    );
                    setUsers(data.users);
                    setGroups(data.groups);
                } else {
                    console.log(response.statusText);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            setShowOptions(false);
        }
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
    };

    const handleOptionSelect = (option) => {
        if (option.groupId) {
            navigateTo(`/group/${option.groupId}`);
        } else {
            navigateTo(`/user/${option.userId}`);
        }
        setSearchText("");
        setShowOptions(false);
    };

    return (
        <Form onSubmit={handleSearchSubmit}>
            <div style={{ alignItems: "center" }}>
                <FormControl
                    type="text"
                    placeholder="Search"
                    value={searchText}
                    onChange={handleSearchChange}
                    style={{ marginRight: "20px", width: "500px" }}
                />
                <Dropdown show={showOptions}>
                    <Dropdown.Menu
                        style={{
                            maxHeight: "300px",
                            overflowY: "auto",
                            width: "500px",
                        }}
                    >
                        {users.map((user) => (
                            <Dropdown.Item
                                key={user.userId}
                                onClick={() => handleOptionSelect(user)}
                            >
                                <div className="user-info">
                                    <div
                                        style={{
                                            marginLeft: "10px",
                                        }}
                                        className="d-flex align-items-center"
                                    >
                                        <img
                                            src={`http://localhost:8080/get-image/users/${user.profilePic}`}
                                            width="40"
                                            height="40"
                                        />
                                        <div className="d-flex align-items-center">
                                            <h5 style={{ marginLeft: "10px" }}>
                                                {(
                                                    user.firstName +
                                                    " " +
                                                    user.lastName
                                                ).slice(0, 15) +
                                                    ((
                                                        user.firstName +
                                                        " " +
                                                        user.lastName
                                                    ).length > 16
                                                        ? "..."
                                                        : "")}
                                            </h5>
                                            <h5 style={{ marginLeft: "5px" }}>
                                                {user.nickname && (
                                                    <small className="text-muted">
                                                        ({user.nickname})
                                                    </small>
                                                )}
                                            </h5>
                                        </div>
                                    </div>
                                    <div className="user-icon"></div>
                                </div>
                            </Dropdown.Item>
                        ))}
                        {groups.map((group) => (
                            <Dropdown.Item
                                key={group.groupId}
                                onClick={() => handleOptionSelect(group)}
                            >
                                <div className="user-info">
                                    <div
                                        style={{
                                            marginLeft: "10px",
                                        }}
                                        className="d-flex align-items-center"
                                    >
                                        <img
                                            src={`http://localhost:8080/get-image/groups/${group.groupPic}`}
                                            width="40"
                                            height="40"
                                        />
                                        <div className="d-flex align-items-center">
                                            <h5 style={{ marginLeft: "10px" }}>
                                                {group.groupTitle.slice(0, 15) +
                                                    (group.groupTitle.length >
                                                    16
                                                        ? "..."
                                                        : "")}
                                            </h5>
                                        </div>
                                    </div>
                                    <div className="group-icon"></div>
                                </div>
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </Form>
    );
}

export default SearchBar;
