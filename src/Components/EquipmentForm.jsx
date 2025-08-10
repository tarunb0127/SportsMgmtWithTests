import React, { useState, useEffect } from "react";
import axios from "axios";

const initialForm = {
  equipmentName: "",
  category: "",
  description: "",
  stock: "",
  price: ""
};

export default function EquipmentForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [equipmentList, setEquipmentList] = useState([]);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await axios.get("http://localhost:4000/equipment");
      setEquipmentList(res.data);
    } catch (err) {
      alert("Error fetching equipment");
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.equipmentName.match(/^[a-zA-Z0-9 ]+$/)) errs.equipmentName = "Invalid name";
    if (!form.category || form.category.length < 3) errs.category = "Category min 3 chars";
    if (!form.description || form.description.length < 20) errs.description = "Description min 20 chars";
    if (!(form.stock > 0 && form.stock <= 1000)) errs.stock = "Stock between 1 and 1000";
    if (!(form.price > 0 && form.price <= 100000)) errs.price = "Price between 1 and 100000";
    return errs;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      if (editId) {
        await axios.put(`http://localhost:4000/equipment/${editId}`, form);
        alert("Equipment updated");
      } else {
        await axios.post("http://localhost:4000/equipment", form);
        alert("Equipment added");
      }
      setForm(initialForm);
      setEditId(null);
      fetchEquipment();
    } catch (err) {
      alert("Error saving equipment");
    }
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`http://localhost:4000/equipment/${id}`);
      fetchEquipment();
    } catch (err) {
      alert("Error deleting equipment");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">{editId ? "Edit Equipment" : "Add Equipment"}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Equipment Name</label>
                <input
                  className={`form-control ${errors.equipmentName ? "is-invalid" : ""}`}
                  name="equipmentName"
                  placeholder="Enter equipment name"
                  value={form.equipmentName}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.equipmentName}</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Category</label>
                <input
                  className={`form-control ${errors.category ? "is-invalid" : ""}`}
                  name="category"
                  placeholder="Enter category"
                  value={form.category}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.category}</div>
              </div>

              <div className="col-md-12">
                <label className="form-label">Description</label>
                <textarea
                  className={`form-control ${errors.description ? "is-invalid" : ""}`}
                  name="description"
                  placeholder="Enter description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.description}</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Stock</label>
                <input
                  type="number"
                  className={`form-control ${errors.stock ? "is-invalid" : ""}`}
                  name="stock"
                  placeholder="Enter stock quantity"
                  value={form.stock}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.stock}</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className={`form-control ${errors.price ? "is-invalid" : ""}`}
                  name="price"
                  placeholder="Enter price"
                  value={form.price}
                  onChange={handleChange}
                />
                <div className="invalid-feedback">{errors.price}</div>
              </div>
            </div>

            <div className="mt-4">
              <button className="btn btn-success" type="submit">
                {editId ? "Update" : "Add"}
              </button>
              {editId && (
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => {
                    setForm(initialForm);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card mt-5 shadow-sm">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">Equipment List</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Description</th>
                <th>Stock</th>
                <th>Price</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.length > 0 ? (
                equipmentList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.equipmentName}</td>
                    <td>{item.category}</td>
                    <td>{item.description}</td>
                    <td>{item.stock}</td>
                    <td>₹{item.price}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center p-3">
                    No equipment found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
