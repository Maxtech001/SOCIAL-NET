import { useNavigate } from "react-router-dom";

function PopupGetChecked({
    userId,
    firstName,
    lastName,
    onClose,
    profilePic,
    onFollowersSelection,
    selectedFollowers,
}) {
    const navigateTo = useNavigate();

    const handleFollow = (isChecked) => {
        if (isChecked) {
            onFollowersSelection((prevSelected) => [...prevSelected, userId]);
        } else {
            onFollowersSelection((prevSelected) =>
                prevSelected.filter((id) => id !== userId)
            );
        }
    };

    return (
        <div key={userId}>
            <div className="user-info">
                <div className="d-flex align-items-center">
                    <img
                        src={`http://localhost:8080/get-image/users/${profilePic}`}
                        width="50"
                        height="50"
                    />
                    <div
                        onClick={() => {
                            navigateTo(`/user/${userId}`);
                            onClose();
                        }}
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                    >
                        <h5>{firstName + " " + lastName}</h5>
                    </div>
                </div>
                <input
                    type="checkbox"
                    checked={selectedFollowers.includes(userId)}
                    onChange={(e) => handleFollow(e.target.checked)}
                />
            </div>
            <hr />
        </div>
    );
}

export default PopupGetChecked;
