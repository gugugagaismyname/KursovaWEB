import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ArticleDetails({ user }) {
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        const load = async () => {
            const r = await fetch("/article");
            const data = await r.json();
            setArticle(data.find(a => a.id == id));

            const c = await fetch(`/comment/${id}`);
            setComments(await c.json());
        };

        load();
    }, [id]);

    const addComment = async (e) => {
        e.preventDefault();

        await fetch(`/comment/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(commentText)
        });

        setCommentText("");

        // Реактивні коментарі
        const c = await fetch(`/comment/${id}`);
        setComments(await c.json());
    };

    const deleteComment = async (commentId) => {
        await fetch(`/comment/${commentId}`, { method: "DELETE" });

        const c = await fetch(`/comment/${id}`);
        setComments(await c.json());
    };

    if (!article) return <p>Loading...</p>;

    return (
        <div className="container mt-4">
            <h2>{article.title}</h2>
            <div className="article-content">{article.content}</div>

            <hr />

            <h4>Comments</h4>

            {comments.map(c => (
                <div key={c.id} className="comment-box">
                    <b>{c.user}</b>: {c.content}
                    {user?.role === "admin" && (
                        <button
                            className="btn btn-sm btn-danger ms-2"
                            onClick={() => deleteComment(c.id)}
                        >
                            X
                        </button>
                    )}
                </div>
            ))}

            {user && (
                <form onSubmit={addComment} className="mt-3">
                    <textarea
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        placeholder="Your comment..."
                        className="form-control mb-2"
                    />
                    <button className="btn btn-primary">Add comment</button>
                </form>
            )}
        </div>
    );
}
