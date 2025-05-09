import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';

const AddQuestionsPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [questions, setQuestions] = useState([
    { text: '', choices: ['', '', '', ''], correctAnswer: '' }
  ]);

  useEffect(() => {
    axios.get('/questions/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    if (field === 'text') {
      updated[index].text = value;
    } else {
      updated[index].choices[field] = value;
    }
    setQuestions(updated);
  };

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        choices: ['', '', '', ''],
        correctAnswer: ''
      }
    ]);
  };

  const handleSubmit = async () => {
    try {
      if (isNewCategory) {
        if (!newCategoryName.trim()) {
          alert('Please enter a name for the new category.');
          return;
        }
        await axios.post('/questions', {
          name: newCategoryName,
          questions
        });
        alert('✅ New category created!');
      } else {
        for (let i = 0; i < questions.length; i++) {
          await axios.put(`/questions/${selectedCategory}/${i}`, questions[i]);
        }
        alert('✅ Questions updated!');
      }

      navigate('/home')
    } catch (err) {
      alert('Something went wrong. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛠 Manage Trivia Questions</h1>

      <div className="mb-4">
        <label className="mr-4 font-medium">Select Existing Category:</label>
        <select
          className="border rounded p-2"
          disabled={isNewCategory}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">-- Select --</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <label className="ml-4">
          <input
            type="checkbox"
            className="mr-2"
            checked={isNewCategory}
            onChange={() => {
              setIsNewCategory(!isNewCategory);
              setSelectedCategory('');
              setQuestions([{ text: '', choices: ['', '', '', ''], correctAnswer: '' }]);
            }}
          />
          Create New Category
        </label>
      </div>

      {isNewCategory && (
        <input
          className="border p-2 mb-4 w-full"
          placeholder="New Category Name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
      )}

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className="border rounded p-4 bg-gray-50">
            <h3 className="font-bold mb-2">Question {idx + 1}</h3>
            <input
              className="border p-2 w-full mb-2"
              placeholder="Question Text"
              value={q.text}
              onChange={(e) => handleQuestionChange(idx, 'text', e.target.value)}
            />
            <div className="mb-2 font-semibold">Choices (select correct one):</div>
            {q.choices.map((choice, i) => (
              <div key={i} className="flex items-center mb-2">
                <input
                  type="radio"
                  name={`correct-${idx}`}
                  className="mr-2"
                  checked={q.correctAnswer === choice}
                  onChange={() => {
                    const updated = [...questions];
                    updated[idx].correctAnswer = updated[idx].choices[i];
                    setQuestions(updated);
                  }}
                />
                <input
                  className="border p-2 flex-grow"
                  placeholder={`Choice ${i + 1}`}
                  value={choice}
                  onChange={(e) => handleQuestionChange(idx, i, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={addNewQuestion}
        >
          + Add Another Question
        </button>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={handleSubmit}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddQuestionsPage;
