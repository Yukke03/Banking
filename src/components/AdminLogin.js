import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components"; // Import styled-components

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 100px); /* Adjust height to fit footer */
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #3f51b5; /* Header background color */
  color: white;
`;

const HomeLink = styled.a`
  color: white; /* Change link color */
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid white;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: white; /* Change background on hover */
    color: #3f51b5; /* Change text color on hover */
  }
`;

const Form = styled.form`
  width: 300px; /* Set form width */
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin: 10px 0 5px;
`;

const Input = styled.input`
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Button = styled.button`
  padding: 10px;
  border: none;
  border-radius: 4px;
  background-color: #3f51b5; /* Button color */
  color: white;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #303f9f; /* Button hover color */
  }
`;

const ErrorMessage = styled.p`
  color: red;
  margin-top: 10px;
`;

const Footer = styled.footer`
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  padding: 10px 0;
  background-color: #f1f1f1; /* Footer background color */
`;

const AdminLogin = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Simulated login for example. Replace this with real authentication logic.
    if (adminId === "admin" && password === "admin123") {
      navigate("/admin/dashboard"); // Redirect to dashboard on successful login
    } else {
      setError("Invalid Admin ID or Password");
    }
  };

  return (
    <>
      <Header>
        <h1>Admin Portal</h1>
        <HomeLink href="/">Go to Home Page</HomeLink> {/* Link to homepage */}
      </Header>
      <Container>
        <h2>Admin Login</h2>
        <Form onSubmit={handleLogin}>
          <div>
            <Label htmlFor="adminId">Admin ID</Label>
            <Input
              type="text"
              id="adminId"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <Button type="submit">Login</Button>
        </Form>
      </Container>
      <Footer>
        &copy; 2024 Bank Of Barcelona. All Rights Reserved.
      </Footer>
    </>
  );
};

export default AdminLogin;
