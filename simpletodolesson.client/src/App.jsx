import { useState, useEffect, useCallback } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ArticleDetails from "./pages/ArticleDetails";
import Bonuses from "./pages/Bonuses";
import MainPage from "./pages/MainPage";


function App() {

    const [user, setUser] = useState(null);
    const [loginForm, setLoginForm] = useState({ email: "", password: "" });
    const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });

    const [articles, setArticles] = useState([]);
    const [editingArticle, setEditingArticle] = useState(null);
    const [newArticle, setNewArticle] = useState({ title: "", content: "" });

    // ================================
    // SESSION RESTORE
    // ================================
    useEffect(() => {
        fetch("/account/me")
            .then(r => r.ok ? r.json() : null)
            .then(data => setUser(data));
    }, []);


    // ================================
    // LOGIN
    // ================================
    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("/account/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(loginForm)
        });

        if (response.ok) {
            const data = await response.json();
            setUser(data);
        } else {
            alert("Invalid login");
        }
    };


    // ================================
    // LOGOUT
    // ================================
    const handleLogout = async () => {
        await fetch("/account/logout", { method: "POST" });
        setUser(null);
    };


    // ================================
    // REGISTER
    // ================================
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        const resp = await fetch("/account/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registerForm)
        });

        if (resp.ok) {
            alert("Registered! Now login.");
            setRegisterForm({ username: "", email: "", password: "" });
        } else {
            alert("Registration error.");
        }
    };


    // ================================
    // LOAD ARTICLES
    // ================================
    const loadArticles = useCallback(async () => {
        const resp = await fetch("/article");
        setArticles(await resp.json());
    }, []);

    useEffect(() => {
        const fetchArticles = async () => {
            const resp = await fetch("/article");
            setArticles(await resp.json());
        };
        fetchArticles();
    }, []);


    // ================================
    // CREATE ARTICLE
    // ================================
    const handleCreateArticle = async (e) => {
        e.preventDefault();

        const resp = await fetch("/article", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newArticle)
        });

        if (resp.ok) {
            setNewArticle({ title: "", content: "" });
            loadArticles();
        } else {
            alert("Only admin can create articles.");
        }
    };


    // ================================
    // UPDATE ARTICLE
    // ================================
    const handleUpdateArticle = async (e) => {
        e.preventDefault();

        const resp = await fetch(`/article/${editingArticle.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingArticle)
        });

        if (resp.ok) {
            setEditingArticle(null);
            loadArticles();
        } else {
            alert("Update failed");
        }
    };


    // ================================
    // DELETE ARTICLE
    // ================================
    const handleDeleteArticle = async (id) => {
        if (!window.confirm("Delete?")) return;

        const resp = await fetch(`/article/${id}`, { method: "DELETE" });

        if (resp.ok) {
            loadArticles();
        } else {
            alert("Delete failed");
        }
    };

    // ============================================================
    // РЕНДЕР З ROUTER
    // ============================================================
    return (
        <BrowserRouter>

            <nav className="mb-3">
                <Link to="/" className="me-2">Home</Link>
                <Link to="/bonuses">Bonuses</Link>
            </nav>

            <Routes>
                <Route
                    path="/"
                    element={
                        <div className="home-bg">
                            <MainPage
                                user={user}
                                loginForm={loginForm}
                                registerForm={registerForm}
                                editingArticle={editingArticle}
                                newArticle={newArticle}
                                articles={articles}
                                handleLoginSubmit={handleLoginSubmit}
                                handleLogout={handleLogout}
                                handleRegisterSubmit={handleRegisterSubmit}
                                handleUpdateArticle={handleUpdateArticle}
                                handleDeleteArticle={handleDeleteArticle}
                                handleCreateArticle={handleCreateArticle}
                                setLoginForm={setLoginForm}
                                setRegisterForm={setRegisterForm}
                                setEditingArticle={setEditingArticle}
                                setNewArticle={setNewArticle}
                            />
                        </div>
                    }
                />

                <Route path="/article/:id" element={<ArticleDetails user={user} />} />
                <Route path="/bonuses" element={<Bonuses user={user} />} />
            </Routes>


        </BrowserRouter>
    );
}

export default App;
