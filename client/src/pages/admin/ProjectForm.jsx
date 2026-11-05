import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { API_URL } from '../../config';
import { projects as staticProjectsData } from '../../data';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    category: 'Residential',
    location: '',
    image: '',
    description: '',
    details: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_URL}/projects/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            title: data.title || '',
            category: data.category || 'Residential',
            location: data.location || '',
            image: data.image || '',
            description: data.description || '',
            details: data.details || ''
          });
          return;
        }
        const fallback = staticProjectsData.find(p => String(p.id) === String(id));
        if (fallback) {
          setFormData({
            title: fallback.title || '',
            category: fallback.category || 'Residential',
            location: fallback.location || '',
            image: fallback.image || '',
            description: fallback.description || '',
            details: fallback.details || ''
          });
        } else {
          throw new Error('Failed to fetch project details');
        }
      } catch (err) {
        const fallback = staticProjectsData.find(p => String(p.id) === String(id));
        if (fallback) {
          setFormData({
            title: fallback.title || '',
            category: fallback.category || 'Residential',
            location: fallback.location || '',
            image: fallback.image || '',
            description: fallback.description || '',
            details: fallback.details || ''
          });
        } else {
          setError(err.message);
        }
      }
    };

    if (isEditing) {
      fetchProject();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    if (e.target.name === 'imageFile') {
      const file = e.target.files[0];
      setImageFile(file);
      if (file) {
        setImagePreview(URL.createObjectURL(file));
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing 
        ? `${API_URL}/projects/${id}`
        : `${API_URL}/projects`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('category', formData.category);
      submitData.append('location', formData.location);
      submitData.append('description', formData.description);
      submitData.append('details', formData.details || '');
      if (imageFile) {
        submitData.append('imageFile', imageFile);
      } else if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save project');
      }

      navigate('/admin/projects');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activePreview = imagePreview || formData.image;

  return (
    <div>
      <button 
        onClick={() => navigate('/admin/projects')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
      </button>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {isEditing ? 'Edit Project' : 'Add New Project'}
          </h3>
          
          <form onSubmit={handleSubmit} className="mt-5 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Project Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Land Surveying">Land Surveying</option>
                <option value="Topographical">Topographical</option>
                <option value="Engineering">Engineering</option>
                <option value="GIS">GIS</option>
                <option value="Digital Mapping">Digital Mapping</option>
                <option value="Property Consultancy">Property Consultancy</option>
                <option value="Landscaping">Landscaping</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="e.g. Lekki, Lagos"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700">
                  Upload Project Image (Local Storage)
                </label>
                <input
                  type="file"
                  name="imageFile"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                  Or Image Path / URL
                </label>
                <input
                  type="text"
                  name="image"
                  id="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="/images/20250516_111224.jpg.jpeg or https://..."
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {activePreview && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Image Preview:</p>
                <img src={activePreview} alt="Preview" className="h-48 w-auto rounded-lg object-cover border border-gray-200" />
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Short Summary (Scope of Work)
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="details" className="block text-sm font-medium text-gray-700">
                Full Case Study Overview (Optional)
              </label>
              <textarea
                name="details"
                id="details"
                rows="5"
                value={formData.details}
                onChange={handleChange}
                placeholder="Detailed project narrative shown on the project detail page..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/projects')}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;
