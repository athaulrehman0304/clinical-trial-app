import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Login from "./Login";


function App() {
  const [participants, setParticipants] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

const [token, setToken] = useState(localStorage.getItem("token"));


  // 🔽 SORT & PAGINATION STATES
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
  try {
    const res = await axios.get("http://localhost:5000/api/participants", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setParticipants(res.data);
  } catch (err) {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      setToken(null);
    }
  }
};



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.age < 1 || formData.age > 120) {
      setError("Age must be between 1 and 120.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (formData.visitDate > today) {
      setError("Visit date cannot be in the future.");
      return;
    }

    if (formData.gender === "") {
      setError("Please select a gender.");
      return;
    }

    try {
      if (editingId) {
       await axios.patch(
  `http://localhost:5000/api/participants/${editingId}`,
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

        setMessage("Participant updated successfully!");
        setEditingId(null);
      } else {
        await axios.post(
  "http://localhost:5000/api/participants",
  formData,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
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
      setError("Something went wrong. Please try again.");
    }
  };

  const handleEdit = (participant) => {
    setEditingId(participant._id);
    setFormData({
      participantId: participant.participantId,
      name: participant.name,
      age: participant.age,
      gender: participant.gender,
      trialId: participant.trialId,
      visitDate: participant.visitDate.split("T")[0]
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this participant?")) {
      try {
        await axios.delete(
  `http://localhost:5000/api/participants/${id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

        setMessage("Participant deleted successfully!");
        setError("");
        fetchParticipants();
      } catch {
        setError("Failed to delete participant.");
        setMessage("");
      }
    }
  };

const exportToCSV = () => {
  const headers = [
    "Participant ID",
    "Name",
    "Age",
    "Gender",
    "Trial ID",
    "Visit Date"
  ];

  const rows = participants.map((p) => [
    p.participantId,
    p.name,
    p.age,
    p.gender,
    p.trialId,
    new Date(p.visitDate).toLocaleDateString()
  ]);

  let csvContent =
    "data:text/csv;charset=utf-8," +
    headers.join(",") +
    "\n" +
    rows.map((row) => row.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "participants.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  // 🔍 SEARCH + SORT
  let filtered = participants.filter(
    (p) =>
      p.participantId.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "age") {
    filtered.sort((a, b) => a.age - b.age);
  }

  // 📄 PAGINATION
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / recordsPerPage);



const totalParticipants = participants.length;

const maleCount = participants.filter(p => p.gender === "Male").length;
const femaleCount = participants.filter(p => p.gender === "Female").length;
const otherCount = participants.filter(p => p.gender === "Other").length;

const averageAge =
  participants.length > 0
    ? (
        participants.reduce((sum, p) => sum + Number(p.age), 0) /
        participants.length
      ).toFixed(1)
    : 0;

if (!token) {
  return <Login setToken={setToken} />;
}



  return (
    <div className="container">
      <h1>Clinical Trial Management Dashboard</h1>

<button
  onClick={() => {
    localStorage.removeItem("token");
    setToken(null);
  }}
  style={{
    float: "right",
    backgroundColor: "red",
    color: "white",
    padding: "6px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  }}
>
  Logout
</button>




<div className="stats-container">
  <div className="stat-card">
    <h3>Total Participants</h3>
    <p>{totalParticipants}</p>
  </div>

  <div className="stat-card">
    <h3>Male</h3>
    <p>{maleCount}</p>
  </div>

  <div className="stat-card">
    <h3>Female</h3>
    <p>{femaleCount}</p>
  </div>

  <div className="stat-card">
    <h3>Other</h3>
    <p>{otherCount}</p>
  </div>

  <div className="stat-card">
    <h3>Average Age</h3>
    <p>{averageAge}</p>
  </div>
</div>



      {message && <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>}
      {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}

      <h2>{editingId ? "Edit Participant" : "Add Participant"}</h2>

      <form onSubmit={handleSubmit} className="form">
        <input name="participantId" placeholder="Participant ID" value={formData.participantId} onChange={handleChange} required />
        <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input name="age" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />

        <select name="gender" value={formData.gender} onChange={handleChange} required>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input name="trialId" placeholder="Trial ID" value={formData.trialId} onChange={handleChange} required />
        <input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required />

        <button type="submit">{editingId ? "Update Participant" : "Add Participant"}</button>
      </form>

      <h2>Participants</h2>
<button onClick={exportToCSV} style={{ marginBottom: "10px" }}>
  Export to CSV
</button>



      <input
        placeholder="Search by Participant ID or Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />

      {/* SORT OPTIONS */}
      <div style={{ margin: "10px 0" }}>
        <button onClick={() => setSortBy("name")}>Sort by Name</button>
        <button onClick={() => setSortBy("age")} style={{ marginLeft: "8px" }}>Sort by Age</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Participant ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Trial ID</th>
            <th>Actions</th>
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
                <button onClick={() => handleDelete(p._id)} className="delete-btn">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>




      {/* PAGINATION BUTTONS */}
      <div style={{ marginTop: "15px" }}>
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>

        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
