import React, { useState, useEffect } from "react";
import axios from "axios";

const initialForm = {
  equipmentId: "",
  quantity: ""
};

export default function OrderForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [equipmentList, setEquipmentList] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [editOrderId, setEditOrderId] = useState(null);

  useEffect(() => {
    fetchEquipment();
    fetchOrders();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await axios.get("http://localhost:4000/equipment");
      setEquipmentList(res.data);
    } catch (err) {
      alert("Error fetching equipment");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:4000/orders");
      setOrders(res.data);
    } catch (err) {
      alert("Error fetching orders");
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.equipmentId) errs.equipmentId = "Please select equipment";
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
      errs.quantity = "Quantity must be a positive number";
    else {
      // Check if quantity exceeds stock
      const selected = equipmentList.find(e => e.id.toString() === form.equipmentId);
      if (selected && Number(form.quantity) > Number(selected.stock)) {
        errs.quantity = `Quantity cannot exceed available stock (${selected.stock})`;
      }
    }
    return errs;
  };

  // Calculate total price whenever equipmentId or quantity changes
  useEffect(() => {
    if (!form.equipmentId || !form.quantity) {
      setTotalPrice(0);
      return;
    }
    const selected = equipmentList.find(e => e.id.toString() === form.equipmentId);
    if (selected) {
      setTotalPrice(selected.price * Number(form.quantity));
    } else {
      setTotalPrice(0);
    }
  }, [form.equipmentId, form.quantity, equipmentList]);

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
      const selected = equipmentList.find(e => e.id.toString() === form.equipmentId);
      if (!selected) {
        alert("Selected equipment not found");
        return;
      }

      const orderData = {
        equipmentId: selected.id,
        quantity: Number(form.quantity),
        totalPrice: selected.price * Number(form.quantity)
      };

      if (editOrderId) {
        await axios.put(`http://localhost:4000/orders/${editOrderId}`, orderData);
        alert("Order updated");
        setEditOrderId(null);
      } else {
        await axios.post("http://localhost:4000/orders", orderData);
        alert("Order placed successfully");
      }

      // Reduce stock accordingly by fetching latest equipment (or implement backend stock update)
      fetchEquipment();
      fetchOrders();
      setForm(initialForm);
      setTotalPrice(0);
    } catch (err) {
      alert("Error saving order");
    }
  };

  const handleEditOrder = (order) => {
    setForm({
      equipmentId: order.equipmentId.toString(),
      quantity: order.quantity.toString()
    });
    setEditOrderId(order.id);
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await axios.delete(`http://localhost:4000/orders/${id}`);
      alert("Order deleted");
      fetchOrders();
      fetchEquipment();
      if (editOrderId === id) {
        setForm(initialForm);
        setEditOrderId(null);
        setErrors({});
        setTotalPrice(0);
      }
    } catch (err) {
      alert("Error deleting order");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">{editOrderId ? "Edit Order" : "Place New Order"}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-8">
             <label htmlFor="equipmentId" className="form-label">Select Equipment</label>
                <select
                id="equipmentId"
                className={`form-select ${errors.equipmentId ? "is-invalid" : ""}`}
                name="equipmentId"
                value={form.equipmentId}
                onChange={handleChange}
                >
                  <option value="">-- Select Equipment --</option>
                  {equipmentList.map(equip => (
                    <option key={equip.id} value={equip.id}>
                      {equip.equipmentName} (Stock: {equip.stock}, Price: ₹{equip.price})
                    </option>
                  ))}
                </select>
                <div className="invalid-feedback">{errors.equipmentId}</div>
              </div>

              <div className="col-md-4">
             
                <label htmlFor="quantity" className="form-label">Quantity</label>
                <input
                id="quantity"
                type="number"
                className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                name="quantity"
                placeholder="Enter quantity"
                value={form.quantity}
                onChange={handleChange}
                />

                <div className="invalid-feedback">{errors.quantity}</div>
              </div>
            </div>

            <div className="mt-3">
              <h5>Total Price: ₹{totalPrice}</h5>
            </div>

            <div className="mt-4">
              <button className="btn btn-success" type="submit">
                {editOrderId ? "Update Order" : "Place Order"}
              </button>
              {editOrderId && (
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => {
                    setForm(initialForm);
                    setEditOrderId(null);
                    setErrors({});
                    setTotalPrice(0);
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
          <h5 className="mb-0">Orders List</h5>
        </div>
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Quantity</th>
                <th>Total Price</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map(order => {
                  const equipment = equipmentList.find(e => e.id === order.equipmentId) || {};
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{equipment.equipmentName || "Unknown"}</td>
                      <td>{order.quantity}</td>
                      <td>₹{order.totalPrice}</td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditOrder(order)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-3">
                    No orders found
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
