import { useEffect, useState } from "react";

export default function Bonuses({ user }) {
    const [bonuses, setBonuses] = useState([]);
    const [newBonus, setNewBonus] = useState({ title: "", url: "" });

    const loadBonuses = async () => {
        const r = await fetch("/bonus");
        setBonuses(await r.json());
    };

    useEffect(() => {
        const fetchBonuses = async () => {
            const r = await fetch("/bonus");
            const data = await r.json();
            setBonuses(data);
        };

        fetchBonuses();
    }, []);


    const addBonus = async (e) => {
        e.preventDefault();

        await fetch("/bonus", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newBonus)
        });

        setNewBonus({ title: "", url: "" });
        loadBonuses();
    };

    const deleteBonus = async (id) => {
        await fetch(`/bonus/${id}`, { method: "DELETE" });
        loadBonuses();
    };

    return (
        <div className="container mt-4">

            <h2>Clash Royale Bonuses</h2>

            <ul>
                {bonuses.map(b => (
                    <li key={b.id}>
                        <a href={b.url} target="_blank" rel="noreferrer">
                            {b.title}
                        </a>
                        {user?.role === "admin" && (
                            <button
                                className="btn btn-sm btn-danger ms-2"
                                onClick={() => deleteBonus(b.id)}
                            >
                                X
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            {user?.role === "admin" && (
                <form onSubmit={addBonus} className="mt-4">
                    <h4>Add Bonus</h4>
                    <input
                        className="form-control mb-2"
                        placeholder="Title"
                        value={newBonus.title}
                        onChange={e =>
                            setNewBonus({ ...newBonus, title: e.target.value })
                        }
                    />
                    <input
                        className="form-control mb-2"
                        placeholder="URL"
                        value={newBonus.url}
                        onChange={e =>
                            setNewBonus({ ...newBonus, url: e.target.value })
                        }
                    />
                    <button className="btn btn-success">Add</button>
                </form>
            )}

        </div>
    );
}
