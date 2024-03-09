import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import SinglePost from "./SinglePost";

function SinglePostPage({}) {
    let { postId } = useParams();
    const [post, setPost] = useState(null);
    const sessionData = useOutletContext();
    const navigateTo = useNavigate();

    useEffect(() => {
        if (!sessionData.sessionExists) {
            navigateTo("/login");
            return;
        }
        const fetchPost = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/get-single-post?postId=${postId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setPost(data);
                } else {
                    console.error("Failed to fetch posts:", response.status);
                }
            } catch (error) {
                navigateTo("/");
            }
        };

        fetchPost();
    }, []);

    if (post) {
        return (
            <div style={{ width: "80%", margin: "auto" }}>
                <SinglePost
                    postId={postId}
                    userId={post.userId}
                    displayName={post.displayName}
                    privacy={post.privacy}
                    img={post.img}
                    createdAt={post.createdAt}
                    content={post.content}
                    comments={post.commentAmount}
                    currentUserId={
                        sessionData.sessionExists
                            ? sessionData.userData.userId
                            : null
                    }
                    profilePic={post.profilePic}
                    showComments={true}
                />
            </div>
        );
    }
}

export default SinglePostPage;
