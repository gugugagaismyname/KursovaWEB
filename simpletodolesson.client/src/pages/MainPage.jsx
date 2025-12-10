import { Link } from "react-router-dom";

export default function MainPage({
    user,
    loginForm,
    registerForm,
    editingArticle,
    newArticle,
    articles,
    handleLoginSubmit,
    handleLogout,
    handleRegisterSubmit,
    handleUpdateArticle,
    handleDeleteArticle,
    handleCreateArticle,
    setLoginForm,
    setRegisterForm,
    setEditingArticle,
    setNewArticle
}) {

    return (
        <div>
            <h1>Just Clash</h1>

            {user ? (
                <div>
                    <b>Welcome {user.username}</b> ({user.role})
                    <button onClick={handleLogout} className="btn btn-link">Logout</button>
                </div>
            ) : (
                <form onSubmit={handleLoginSubmit}>
                    <input type="email" placeholder="Email"
                        value={loginForm.email}
                        onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />

                    <input type="password" placeholder="Password"
                        value={loginForm.password}
                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />

                     <button className="btn btn-sword">Login</button>
                </form>
            )}

            {!user && (
                <form onSubmit={handleRegisterSubmit}>
                    <h3>Register</h3>

                    <input type="text" placeholder="Username"
                        value={registerForm.username}
                        onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })} />

                    <input type="email" placeholder="Email"
                        value={registerForm.email}
                        onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />

                    <input type="password" placeholder="Password"
                        value={registerForm.password}
                        onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />

                    <button className="btn btn-chest">Register</button>
                </form>
            )}

            <hr />

            {editingArticle && (
                <form onSubmit={handleUpdateArticle}>
                    <h3>Edit Article</h3>

                    <input type="text"
                        value={editingArticle.title}
                        onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })} />

                    <textarea
                        value={editingArticle.content}
                        onChange={e => setEditingArticle({ ...editingArticle, content: e.target.value })} />

                    <button className="btn btn-warning">Save</button>
                    <button type="button" className="btn btn-secondary"
                        onClick={() => setEditingArticle(null)}>Cancel</button>
                </form>
            )}

            {user && user.role === "admin" && !editingArticle && (
                <form onSubmit={handleCreateArticle}>
                    <h3>Create Article</h3>

                    <input type="text"
                        placeholder="Title"
                        value={newArticle.title}
                        onChange={e => setNewArticle({ ...newArticle, title: e.target.value })} />

                    <textarea
                        placeholder="Content"
                        value={newArticle.content}
                        onChange={e => setNewArticle({ ...newArticle, content: e.target.value })} />

                    <button className="btn btn-crown">Publish</button>
                </form>
            )}

            <h2>Articles</h2>

            {articles.map(a => (
                <div key={a.id} className="card">
                    <h4>
                        <Link to={`/article/${a.id}`}>{a.title}</Link>
                    </h4>
                    <p>{a.content}</p>
                    <small>{new Date(a.createdDate).toLocaleString()}</small>

                    {user?.role === "admin" && (
                        <div>
                            <button className="btn btn-warning btn-sm"
                                onClick={() => setEditingArticle(a)}>Edit</button>

                            <button className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteArticle(a.id)}>Delete</button>
                        </div>
                    )}
                </div>
            ))}

        </div>
    );
}
