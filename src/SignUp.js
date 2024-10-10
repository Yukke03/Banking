import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const SignUpForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [aadharCard, setAadharCard] = useState('');
  const [panCard, setPanCard] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [aadharImage, setAadharImage] = useState(null);
  const [panImage, setPanImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  // Validation function
  const validate = (field) => {
    let newErrors = { ...errors };

    // Name validation
    if (field === 'firstName' && !/^[A-Za-z]+$/.test(firstName)) {
      newErrors.firstName = "First Name must contain only letters";
    } else if (field === 'firstName') {
      delete newErrors.firstName; // Clear error if valid
    }

    if (field === 'lastName' && !/^[A-Za-z]+$/.test(lastName)) {
      newErrors.lastName = "Last Name must contain only letters";
    } else if (field === 'lastName') {
      delete newErrors.lastName; // Clear error if valid
    }

    // Age validation
    if (field === 'dateOfBirth') {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const ageValidation = (today.getMonth() < birthDate.getMonth() || 
                            (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()));
      if (age < 18 || (age === 18 && ageValidation)) {
        newErrors.dateOfBirth = "You must be at least 18 years old";
      } else {
        delete newErrors.dateOfBirth; // Clear error if valid
      }
    }

    // Aadhar Card and PAN validations
    if (field === 'aadharCard' && !aadharCard.match(/^\d{12}$/)) {
      newErrors.aadharCard = "Aadhar Card must be 12 digits";
    } else if (field === 'aadharCard') {
      delete newErrors.aadharCard; // Clear error if valid
    }

    if (field === 'panCard' && !panCard.match(/^[A-Z]{5}\d{4}[A-Z]{1}$/)) {
      newErrors.panCard = "Invalid PAN format";
    } else if (field === 'panCard') {
      delete newErrors.panCard; // Clear error if valid
    }

    // Phone number validation
    if (field === 'phoneNumber' && !phoneNumber.match(/^\d{10}$/)) {
      newErrors.phoneNumber = "Phone Number must be 10 digits";
    } else if (field === 'phoneNumber') {
      delete newErrors.phoneNumber; // Clear error if valid
    }

    // Email validation
    if (field === 'email' && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Email is invalid";
    } else if (field === 'email') {
      delete newErrors.email; // Clear error if valid
    }

    // Password validation
    if (field === 'password' && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (field === 'password') {
      delete newErrors.password; // Clear error if valid
    }

    // Image validation
    if (field === 'aadharImage' && !aadharImage) {
        newErrors.aadharImage = "Aadhar image is required";
      } else if (field === 'aadharImage') {
        delete newErrors.aadharImage; // Clear error if valid
      }
  
      if (field === 'panImage' && !panImage) {
        newErrors.panImage = "PAN image is required";
      } else if (field === 'panImage') {
        delete newErrors.panImage; // Clear error if valid
      }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (file, fieldName) => {
    const formData = new FormData();
    formData.append('file', file);

    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/bank-of-barcelona-3da98.appspot.com/o?uploadType=media&name=${fieldName}/${file.name}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      console.error("Error uploading image:", await response.text());
      return null;
    }

    const imageUrl = `https://firebasestorage.googleapis.com/v0/b/bank-of-barcelona-3da98.appspot.com/o/${encodeURIComponent(fieldName + '/' + file.name)}?alt=media`;
    return imageUrl;
  };

  const submitForm = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return; // Prevent submission if validation fails
    }

    const userData = {
      id: uuidv4(),
      firstName,
      lastName,
      dateOfBirth,
      aadharCard,
      panCard,
      phoneNumber,
      email,
      password,
      createdAt: new Date(),
    };

    if (aadharImage) {
      const imageUrl = await uploadImage(aadharImage, 'aadhar');
      if (imageUrl) {
        userData.aadharImageUrl = imageUrl;
      }
    }

    if (panImage) {
      const imageUrl = await uploadImage(panImage, 'pan');
      if (imageUrl) {
        userData.panImageUrl = imageUrl;
      }
    }

    try {
      const response = await fetch(`https://firestore.googleapis.com/v1/projects/bank-of-barcelona-3da98/databases/(default)/documents/users?key=AIzaSyA8Ku0g-O7AzM1Ho4HSWoNJXx2z1prtFdM`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            id: { stringValue: userData.id },
            firstName: { stringValue: userData.firstName },
            lastName: { stringValue: userData.lastName },
            dateOfBirth: { stringValue: userData.dateOfBirth },
            aadharCard: { stringValue: userData.aadharCard },
            panCard: { stringValue: userData.panCard },
            phoneNumber: { stringValue: userData.phoneNumber },
            email: { stringValue: userData.email },
            password: { stringValue: userData.password },
            createdAt: { timestampValue: userData.createdAt.toISOString() },
            aadharImageUrl: { stringValue: userData.aadharImageUrl || "" },
            panImageUrl: { stringValue: userData.panImageUrl || "" },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setMessage('User registered successfully!');
      // Reset form fields
      setFirstName('');
      setLastName('');
      setDateOfBirth('');
      setAadharCard('');
      setPanCard('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setAadharImage(null);
      setPanImage(null);
      setErrors({});
    } catch (error) {
      console.error("Error submitting user data:", error);
      setMessage('Error submitting user data');
    }
  };

  return (
    <div className="signup-container">
      <h1>User Sign-Up</h1>
      <form onSubmit={submitForm}>
        <div className="form-group">
          <input type="text" required value={firstName} onChange={(e) => { setFirstName(e.target.value); validate('firstName'); }} placeholder="First Name" />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <input type="text" required value={lastName} onChange={(e) => { setLastName(e.target.value); validate('lastName'); }} placeholder="Last Name" />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
        <div className="form-group">
          <input type="date" required value={dateOfBirth} onChange={(e) => { setDateOfBirth(e.target.value); validate('dateOfBirth'); }} />
          {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
        </div>
        <div className="form-group">
          <input type="text" required value={aadharCard} onChange={(e) => { setAadharCard(e.target.value); validate('aadharCard'); }} placeholder="Aadhar Card Number" />
          {errors.aadharCard && <span className="error">{errors.aadharCard}</span>}
        </div>
        <div className="form-group">
          <input type="text" required value={panCard} onChange={(e) => { setPanCard(e.target.value); validate('panCard'); }} placeholder="PAN Card Number" />
          {errors.panCard && <span className="error">{errors.panCard}</span>}
        </div>
        <div className="form-group">
          <input type="text" required value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); validate('phoneNumber'); }} placeholder="Phone Number" />
          {errors.phoneNumber && <span className="error">{errors.phoneNumber}</span>}
        </div>
        <div className="form-group">
          <input type="email" required value={email} onChange={(e) => { setEmail(e.target.value); validate('email'); }} placeholder="Email" />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="form-group">
          <input type="password" required value={password} onChange={(e) => { setPassword(e.target.value); validate('password'); }} placeholder="Password" />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <div className="form-group">
          <label>Aadhar Image</label>
          <input type="file" required accept="image/*" onChange={(e) => { setAadharImage(e.target.files[0]); validate('aadharImage'); }} placeholder="Aadhar Image" />
          {errors.aadharImage && <span className="error">{errors.aadharImage}</span>}
        </div>
        <div className="form-group">
          <label>PAN Image</label>
          <input type="file" required accept="image/*" onChange={(e) => { setPanImage(e.target.files[0]); validate('panImage'); }} placeholder="PAN Image"/>
          {errors.panImage && <span className="error">{errors.panImage}</span>}
        </div>
        <button type="submit">Sign Up</button>
      </form>
      {message && <div className="message">{message}</div>}
      <div className="navigation-buttons">
        <button onClick={() => window.location.href = '/'}>Login</button>
        <button onClick={() => window.location.href = '/'}>Home</button>
      </div>
      <style jsx>{`
        /* Global Styles */
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
}

/* Container Styles */
.signup-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%; /* Full width of the screen */
  max-width: 600px; /* Optional: Maximum width for larger screens */
  margin: 0 auto; /* Center container */
  background-color: #ffffff; /* White background for the form */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* Subtle shadow effect */
  border-radius: 8px; /* Rounded corners */
  padding: 40px; /* Increased padding for a spacious look */
  position: relative; /* For any absolute positioned elements inside */
}

/* Heading Styles */
.signup-container h1 {
  color: #333333; /* Dark text color for heading */
  margin-bottom: 20px; /* Space below the heading */
  text-align: center; /* Center the heading text */
}

/* Form Group Styles */
.form-group {
  width: 100%; /* Full width for inputs */
  margin-bottom: 15px; /* Space between input groups */
}

/* Input Styles */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="date"],
input[type="file"] {
  width: 100%; /* Full width for inputs */
  padding: 12px; /* Inner spacing for inputs */
  border: 1px solid #cccccc; /* Border color */
  border-radius: 4px; /* Rounded corners for inputs */
  transition: border-color 0.3s; /* Smooth border transition */
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="date"]:focus {
  border-color: #007BFF; /* Highlight border on focus */
  outline: none; /* Remove default outline */
}

/* Error Message Styles */
.error {
  color: red; /* Red color for error messages */
  font-size: 0.9em; /* Smaller size for error messages */
}

/* Button Styles */
button {
  background-color: #007BFF; /* Primary button color */
  color: white; /* Text color for button */
  padding: 12px; /* Inner spacing for button */
  border: none; /* No border */
  border-radius: 4px; /* Rounded corners for button */
  cursor: pointer; /* Pointer cursor on hover */
  transition: background-color 0.3s; /* Smooth background transition */
  width: 100%; /* Full width button */
  font-size: 16px; /* Larger font size for readability */
}

button:hover {
  background-color: #0056b3; /* Darker shade on hover */
}

/* Message Styles */
.message {
  margin-top: 15px; /* Space above the message */
  color: #28a745; /* Green color for success messages */
  font-weight: bold; /* Bold text */
  text-align: center; /* Center the success message */
}

/* Responsive Styles */
@media (max-width: 600px) {
  .signup-container {
    padding: 20px; /* Reduce padding on smaller screens */
  }
}

      `}</style>
    </div>
  );
};

export default SignUpForm;
