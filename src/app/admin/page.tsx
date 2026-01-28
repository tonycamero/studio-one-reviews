"use client";

import { useState, useEffect } from "react";
import { LogOut, Mail, Trophy, RefreshCw, Trash2 } from "lucide-react";

type Entry = {
    id: string;
    email: string;
    firstName: string | null;
    source: string | null;
    campaign: string | null;
    createdAt: string;
};

type Winner = {
    id: string;
    entryId: string;
    weekStartDate: string;
    winnerEmailSentAt: string | null;
};

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState("");
    const [entries, setEntries] = useState<Entry[]>([]);
    const [winners, setWinners] = useState<Record<string, Winner>>({}); // weekStartDate -> Winner
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        // We'll try to fetch entries, if 401 we're not auth'd
        const res = await fetch("/api/admin/entries");
        if (res.status === 401) {
            setIsAuthenticated(false);
        } else {
            setIsAuthenticated(true);
            const data = await res.json();
            setEntries(data);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await fetch("/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });

        if (res.ok) {
            setIsAuthenticated(true);
            checkAuth();
        } else {
            setError("Invalid password");
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        setIsAuthenticated(false);
    };

    const selectWinner = async (entryId: string) => {
        setLoading(true);
        const res = await fetch("/api/admin/winner/select", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entryId }),
        });
        if (res.ok) {
            alert("Winner selected for this week!");
            // In a real app we'd refresh the winners list
        } else {
            const data = await res.json();
            alert(data.error);
        }
        setLoading(false);
    };

    const deleteEntry = async (id: string) => {
        if (!confirm("Are you sure you want to delete this entry?")) return;

        setLoading(true);
        const res = await fetch("/api/admin/entries/delete", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });

        if (res.ok) {
            setEntries(entries.filter((e) => e.id !== id));
        } else {
            const data = await res.json();
            alert(data.error || "Failed to delete entry");
        }
        setLoading(false);
    };

    if (isAuthenticated === null) return null;

    if (!isAuthenticated) {
        return (
            <main>
                <div className="card">
                    <h1 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Admin Login</h1>
                    <form onSubmit={handleLogin}>
                        <label className="label">Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                        />
                        <button type="submit" className="button" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main style={{ maxWidth: "1000px", width: "100%", margin: "0 auto", padding: "2rem" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", width: "100%" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Admin Control Panel</h1>
                    <p style={{ color: "var(--muted-foreground)" }}>Studio One Café Giveaway</p>
                </div>
                <button onClick={handleLogout} className="button button-outline" style={{ width: "auto" }}>
                    <LogOut size={18} style={{ marginRight: "0.5rem" }} />
                    Logout
                </button>
            </header>

            <section style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
                    <h2 style={{ fontSize: "1.25rem" }}>Recent Entries</h2>
                    <button onClick={checkAuth} className="button button-outline" style={{ width: "auto", padding: "0.5rem" }}>
                        <RefreshCw size={16} />
                    </button>
                </div>

                <div style={{ overflowX: "auto", background: "var(--muted)", borderRadius: "0.5rem", border: "1px solid var(--border)" }}>
                    <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                <th style={{ padding: "1rem" }}>Date</th>
                                <th style={{ padding: "1rem" }}>Name</th>
                                <th style={{ padding: "1rem" }}>Email</th>
                                <th style={{ padding: "1rem" }}>Source</th>
                                <th style={{ padding: "1rem" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.map((entry) => (
                                <tr key={entry.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: "1rem" }}>{entry.firstName || "-"}</td>
                                    <td style={{ padding: "1rem" }}>{entry.email}</td>
                                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>{entry.source || "-"}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button
                                                onClick={() => selectWinner(entry.id)}
                                                className="button"
                                                style={{ padding: "0.4rem 0.8rem", width: "auto", fontSize: "0.875rem" }}
                                                disabled={loading}
                                            >
                                                <Trophy size={14} style={{ marginRight: "0.4rem" }} />
                                                Pick
                                            </button>
                                            <button
                                                onClick={() => deleteEntry(entry.id)}
                                                className="button button-outline"
                                                style={{ padding: "0.4rem 0.8rem", width: "auto", fontSize: "0.875rem", color: "#ef4444", borderColor: "#ef4444" }}
                                                disabled={loading}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--muted-foreground)" }}>
                                        No entries found for this week.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
