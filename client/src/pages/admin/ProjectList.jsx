import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PencilSimple as Edit, Trash as Trash2, Plus, MapPin } from '@phosphor-icons/react';
import { API_URL } from '../../config';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/projects`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Projects</h1>
        <Link 
          to="/admin/projects/new" 
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center hover:bg-orange-400"
        >
          <Plus className="h-5 w-5 mr-2" /> Add New Project
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {projects.map((project) => (
            <li key={project.id}>
              <div className="px-4 py-4 flex items-center sm:px-6">
                <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                  <div className="flex items-center">
                    {project.image && (
                      <img src={project.image} alt={project.title} className="h-12 w-12 rounded object-cover mr-4" />
                    )}
                    <div>
                      <div className="flex text-sm">
                        <p className="font-medium text-primary truncate">{project.title}</p>
                      </div>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm text-gray-500 mr-4">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">{project.category}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <p>{project.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 flex space-x-2">
                  <Link 
                    to={`/admin/projects/edit/${project.id}`}
                    className="text-indigo-600 hover:text-indigo-900 p-2"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-900 p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {projects.length === 0 && (
            <li className="px-4 py-4 text-center text-gray-500">No projects found. Add one to get started.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProjectList;
