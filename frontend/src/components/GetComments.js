import { useEffect, useState } from "react";
import SingleComment from "./SingleComment";

function GetComments({ showComments, postId, currentUserId, commentAmount }) {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        const getComments = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-comments?postId=${postId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setComments(data);
                } else {
                    console.log(response.statusText);
                }
            } catch (error) {
                console.error(error);
            }
        };

        if (showComments) {
            getComments();
        }
    }, [postId, showComments, commentAmount]);

    if (showComments && comments) {
        return comments.map((comment) => (
            <SingleComment
                key={comment.commentId}
                commentId={comment.commentId}
                userId={comment.userId}
                displayName={comment.displayName}
                img={comment.img}
                createdAt={comment.createdAt}
                content={comment.content}
                currentUserId={currentUserId}
                profilePic={comment.profilePic}
            />
        ));
    }
}

export default GetComments;
