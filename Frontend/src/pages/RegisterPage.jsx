import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/users/register', form);
      console.log('Registration success:', response.data);
      navigate('/login');
    } catch (err) {
      setError('Registration failed. Username might already be taken.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">Create Account</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          name="name"
          type="text"
          placeholder="Username"
          value={form.name}
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
