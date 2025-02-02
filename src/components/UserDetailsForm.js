import React, { useState } from 'react';

export default function UserDetailsForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    // Basic email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    // Basic phone validation (optional if provided)
    if (phone && !/^[0-9]+$/.test(phone)) {
      setError('Invalid phone number');
      return;
    }
    setError(null);
    // Default optional fields to null if empty
    const details = {
      name: name.trim(),
      instagram: instagram.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
    };
    // Pass data up
    onSubmit(details);
  };

  return (
    <div className="question-display" style={{ textAlign: 'center' }}>
      <h2>Enter Your Details</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="answer-input">
        <input
          className="answer-text-input"
          placeholder="Name (required)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="answer-text-input"
          placeholder="Instagram (optional)"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
        <input
          className="answer-text-input"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="answer-text-input"
          placeholder="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="submit-button" type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}
