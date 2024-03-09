import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function SingleGroup({ groupId, title, description, img, owner }) {
    const navigateTo = useNavigate();
    return (
        <Card style={{ marginTop: "20px" }}>
            <Card style={{ padding: "20px" }}>
                <div className="d-flex align-items-center">
                    <img
                        src={`http://localhost:8080/get-image/groups/${img}`}
                        width="50"
                        height="50"
                        onClick={() => navigateTo(`/group/${groupId}`)}
                        style={{
                            cursor: "pointer",
                            borderRadius: "100%",
                            objectFit: "cover",
                            marginRight: "10px",
                        }}
                    />
                    <Card.Title
                        style={{ cursor: "pointer" }}
                        onClick={() => navigateTo(`/group/${groupId}`)}
                    >
                        {title}
                    </Card.Title>
                </div>
            </Card>
            <Card.Body>
                <Card.Text>{description}</Card.Text>
            </Card.Body>
            <Card.Footer>
                <div className="user-info" style={{}}>
                    <div
                        style={{
                            cursor: "pointer",
                            marginLeft: "10px",
                        }}
                        className="d-flex align-items-center"
                    >
                        <img
                            src={`http://localhost:8080/get-image/users/${owner.profilePic}`}
                            width="38"
                            height="38"
                            onClick={() => navigateTo(`/user/${owner.userId}`)}
                            style={{
                                cursor: "pointer",
                                borderRadius: "100%",
                                objectFit: "cover",
                            }}
                        />
                        <div
                            className="d-flex align-items-center"
                            onClick={() => {
                                navigateTo(`/user/${owner.userId}`);
                            }}
                        >
                            <h5 style={{ marginLeft: "10px" }}>
                                {owner.firstName + " " + owner.lastName}
                            </h5>
                            <small style={{ marginLeft: "5px", color: "grey" }}>
                                (owner)
                            </small>
                        </div>
                    </div>
                </div>
            </Card.Footer>
        </Card>
    );
}

export default SingleGroup;
