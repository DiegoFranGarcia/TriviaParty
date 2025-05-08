import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

   try {
  console.log('Sending request to backend with form data:', form); // Log the form data
  const response = await axios.post('http://localhost:3001/api/auth/register', form);
  console.log('Registration success:', response.data); // Log the success response
  navigate('/login');
} catch (err) {
  console.error('Error occurred during registration:', err); // Log the full error object
  if (err.response) {
    // Log the response details if available
    console.error('Error response data:', err.response.data);
    console.error('Error response status:', err.response.status);
    console.error('Error response headers:', err.response.headers);
  } else if (err.request) {
    // Log the request details if no response was received
    console.error('Error request:', err.request);
  } else {
    // Log any other errors
    console.error('Error message:', err.message);
  }
  setError('Registration failed. Username might already be taken.');
}
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
          Register
        </button>
        <p
          className="text-sm text-gray-600 text-center cursor-pointer underline"
          onClick={() => navigate('/login')}
        >
          Already have an account? Login here
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
