import React, { useState } from "react";
import axios from "axios";
import "./login_signup_style.css"; // Import your CSS file

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    is_superuser: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post("/create_user/", formData);
      console.log(response.data);
      // Handle success (e.g., redirect user)
    } catch (error) {
      console.error(error.response.data);
      // Handle error (e.g., display error message)
    }
  };

  return (
    <div className="wrapper_entrance">
      <div className="container_center">
        <h2>Create User</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="checkbox"
              id="is_superuser"
              name="is_superuser"
              checked={formData.is_superuser}
              onChange={handleChange}
            />
            <label htmlFor="is_superuser">Is Superuser?</label>
          </div>
          <button type="submit">Create User</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
