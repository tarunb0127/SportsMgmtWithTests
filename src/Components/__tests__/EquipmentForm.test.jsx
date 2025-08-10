import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EquipmentForm from "../EquipmentForm";
import axios from "axios";
import React from "react";

jest.mock("axios");
window.alert = jest.fn();
window.confirm = jest.fn(() => true); // auto-confirm deletes

describe("EquipmentForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to fill form with valid data
  const fillValidForm = () => {
    fireEvent.change(screen.getByPlaceholderText(/enter equipment name/i), {
      target: { value: "Football" }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter category/i), {
      target: { value: "Ball" }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter description/i), {
      target: { value: "Official size 5 football for outdoor matches" }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter stock quantity/i), {
      target: { value: "10" }
    });
    fireEvent.change(screen.getByPlaceholderText(/enter price/i), {
      target: { value: "100" }
    });
  };

  test("1. shows validation errors on empty submit", () => {
    render(<EquipmentForm />);
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText(/invalid name/i)).toBeInTheDocument();
    expect(screen.getByText(/category min 3 chars/i)).toBeInTheDocument();
    expect(screen.getByText(/description min 20 chars/i)).toBeInTheDocument();
    expect(screen.getByText(/stock between 1 and 1000/i)).toBeInTheDocument();
    expect(screen.getByText(/price between 1 and 100000/i)).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test("2. submits the form successfully with valid data", async () => {
    axios.post.mockResolvedValueOnce({});
    render(<EquipmentForm />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:4000/equipment",
        expect.objectContaining({
          equipmentName: "Football",
          category: "Ball",
          description: "Official size 5 football for outdoor matches",
          stock: "10",
          price: "100"
        })
      );
      expect(window.alert).toHaveBeenCalledWith("Equipment added");
    });

    // Form cleared after submit
    expect(screen.getByPlaceholderText(/enter equipment name/i)).toHaveValue("");
    expect(screen.getByPlaceholderText(/enter category/i)).toHaveValue("");
  });

  test("3. shows alert when POST API fails", async () => {
    axios.post.mockRejectedValueOnce(new Error("API error"));
    render(<EquipmentForm />);

    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Error saving equipment");
    });
  });

  test("4. shows validation error if stock is negative", () => {
    render(<EquipmentForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter stock quantity/i), {
      target: { value: "-5" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText(/stock between 1 and 1000/i)).toBeInTheDocument();
  });

  test("5. shows validation error if stock exceeds 1000", () => {
    render(<EquipmentForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter stock quantity/i), {
      target: { value: "1500" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText(/stock between 1 and 1000/i)).toBeInTheDocument();
  });

  test("6. shows validation error if price exceeds 100000", () => {
    render(<EquipmentForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter price/i), {
      target: { value: "200000" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText(/price between 1 and 100000/i)).toBeInTheDocument();
  });

  test("7. shows validation error if price is negative", () => {
    render(<EquipmentForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter price/i), {
      target: { value: "-50" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText(/price between 1 and 100000/i)).toBeInTheDocument();
  });

  test("8. shows validation error if category is less than 3 chars", () => {
    render(<EquipmentForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter category/i), {
      target: { value: "AB" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText(/category min 3 chars/i)).toBeInTheDocument();
  });

  test("9. shows validation error if description is too short", () => {
    render(<EquipmentForm />);
    fireEvent.change(screen.getByPlaceholderText(/enter description/i), {
      target: { value: "Too short" }
    });
    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(screen.getByText(/description min 20 chars/i)).toBeInTheDocument();
  });

  test("10. edit an existing equipment triggers axios.put and updates form", async () => {
    // Mock fetch to return one equipment item
    axios.get.mockResolvedValueOnce({
      data: [{
        id: "1",
        equipmentName: "Football",
        category: "Ball",
        description: "Official size 5 football for outdoor matches",
        stock: "10",
        price: "100"
      }]
    });
    axios.put.mockResolvedValueOnce({});
    render(<EquipmentForm />);

    // Wait for fetchEquipment to load
    await waitFor(() => {
      expect(screen.getByText("Football")).toBeInTheDocument();
    });

    // Click edit button on first row
    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    // Fields should be filled with selected equipment
    expect(screen.getByPlaceholderText(/enter equipment name/i)).toHaveValue("Football");
    expect(screen.getByPlaceholderText(/enter category/i)).toHaveValue("Ball");

    // Change stock and submit update
    fireEvent.change(screen.getByPlaceholderText(/enter stock quantity/i), {
      target: { value: "20" }
    });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "http://localhost:4000/equipment/1",
        expect.objectContaining({ stock: "20" })
      );
      expect(window.alert).toHaveBeenCalledWith("Equipment updated");
    });
  });

  test("11. delete an equipment calls axios.delete and refreshes list", async () => {
    axios.get.mockResolvedValueOnce({
      data: [{
        id: "1",
        equipmentName: "Football",
        category: "Ball",
        description: "Official size 5 football for outdoor matches",
        stock: "10",
        price: "100"
      }]
    });
    axios.delete.mockResolvedValueOnce({});
    render(<EquipmentForm />);

    // Wait for equipment list to render
    await waitFor(() => {
      expect(screen.getByText("Football")).toBeInTheDocument();
    });

    // Click delete button (window.confirm returns true)
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith("http://localhost:4000/equipment/1");
      expect(window.alert).not.toHaveBeenCalledWith("Error deleting equipment");
    });
  });
});
