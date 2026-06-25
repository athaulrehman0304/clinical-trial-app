import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Login from "./Login";

const API_URL = "http://localhost:5000";

function App() {
  const [participants, setParticipants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const [formData, setFormData] = useState({
    participantId: "",
    name: "",
    age: "",
    gender: "",
    trialId: "",
    visitDate: ""
  });

  useEffect(() => {
    if (token) {
      fetchParticipants();
    }
  }, [token]);

  const fetchParticipants = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API_URL}/api/participants`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setParticipants(res.data);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    
    if (formData.participantId.trim() === "") {
    setError("Participant ID cannot be empty.");
    return;
    }

    if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
    setError("Name should contain only letters and spaces.");
    return;
    }

    if (formData.age < 1 || formData.age > 120) {
      setError("Age must be between 1 and 120.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (formData.visitDate > today) {
      setError("Visit date cannot be in the future.");
      return;
    }

    try {
      if (editingId) {
        await axios.patch(
          `${API_URL}/api/participants/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Participant updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(
          `${API_URL}/api/participants`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Participant added successfully!");
      }

      fetchParticipants();
      setFormData({
        participantId: "",
        name: "",
        age: "",
        gender: "",
        trialId: "",
        visitDate: ""
      });
    } catch {
      setError("Something went wrong.");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      participantId: p.participantId,
      name: p.name,
      age: p.age,
      gender: p.gender,
      trialId: p.trialId,
      visitDate: p.visitDate.split("T")[0]
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this participant?")) return;
    try {
      await axios.delete(`${API_URL}/api/participants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchParticipants();
    } catch {
      setError("Delete failed.");
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Age", "Gender", "Trial ID", "Visit Date"];
    const rows = participants.map((p) => [
      p.participantId,
      p.name,
      p.age,
      p.gender,
      p.trialId,
      new Date(p.visitDate).toLocaleDateString()
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((r) => r.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "participants.csv";
    link.click();
  };

  let filtered = participants.filter(
    (p) =>
      p.participantId.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "age") filtered.sort((a, b) => a.age - b.age);

  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / recordsPerPage);

  if (!token) return <Login setToken={setToken} />;

  return (
    <div className="container">
      <h1>Clinical Trial Management Dashboard</h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          setToken(null);
        }}
        style={{ float: "right", background: "red", color: "white" }}
      >
        Logout
      </button>

      <p style={{ color: "green" }}>{message}</p>
      <p style={{ color: "red" }}>{error}</p>

      <h2>{editingId ? "Edit Participant" : "Add Participant"}</h2>

      <form onSubmit={handleSubmit}>
        <input name="participantId" placeholder="ID" value={formData.participantId} onChange={handleChange} required />
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />

        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input name="trialId" placeholder="Trial ID" value={formData.trialId} onChange={handleChange} required />
        <input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required />

        <button type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      <h2>Participants</h2>
      {loading && <p>Loading participants...</p>}
      <button onClick={exportToCSV}>Export CSV</button>

      <input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={() => setSortBy("name")}>Sort by Name</button>
      <button onClick={() => setSortBy("age")}>Sort by Age</button>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Trial</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRecords.map((p) => (
            <tr key={p._id}>
              <td>{p.participantId}</td>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.gender}</td>
              <td>{p.trialId}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
        <span> Page {currentPage} of {totalPages} </span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
      </div>
    </div>
  );
}

export default App;
