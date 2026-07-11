import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaStar, FaExclamationTriangle } from "react-icons/fa";

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/feedback");
      setFeedbackList(response.data);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to load feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📢 User Feedback</h1>

      {loading ? (
        <p className="text-gray-600 italic">Loading feedback...</p>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      ) : feedbackList.length === 0 ? (
        <p className="text-gray-500 italic">No feedback submitted yet.</p>
      ) : (
        <div className="grid gap-6">
          {feedbackList.map((fb) => (
            <div
              key={fb._id}
              className="border-l-4 border-blue-500 bg-white p-5 shadow-md rounded-lg transition hover:shadow-lg"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">📧 {fb.email}</h2>
              <p className="flex items-center gap-2 text-yellow-600 font-medium">
                <FaStar className="text-yellow-500" />
                {fb.rating}/5
              </p>
              <p className="text-gray-700 mt-2 mb-2">{fb.feedback}</p>
              <p className="text-sm text-gray-500">
                🕒 Submitted on: {formatDate(fb.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
