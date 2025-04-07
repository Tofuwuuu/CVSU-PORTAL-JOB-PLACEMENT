import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const JobDetail = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/jobs");
        setJobs(response.data);
      } catch (err) {
        setError("Failed to load job listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading jobs...</div>;
  if (error) return <div className="text-center mt-10 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Available Job Opportunities</h1>
      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <p>No jobs available at the moment.</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} className="border rounded p-4 shadow-md">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-700">Company: {job.company}</p>
              <p className="text-sm text-gray-500 mb-3">Location: {job.location}</p>
              <Link to={`/student/job/${job._id}`}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  View Details
                </button>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JobDetail;
