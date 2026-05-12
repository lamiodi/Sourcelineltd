import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import LandSurveying from './pages/services/LandSurveying';
import EngineeringSurvey from './pages/services/EngineeringSurvey';
import DigitalMapping from './pages/services/DigitalMapping';
import Portfolio from './pages/Portfolio';
import ProjectDetail from './pages/ProjectDetail';
import Verify from './pages/Verify';
import Contact from './pages/Contact';
import Blog from './pages/Blog'; // Assuming Blog component exists
import BlogDetail from './pages/BlogDetail';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
// import Login from './pages/admin/Login';
import ProjectList from './pages/admin/ProjectList';
import ProjectForm from './pages/admin/ProjectForm';
import QuotationBuilder from './pages/admin/QuotationBuilder';
import DailyReports from './pages/admin/DailyReports';
import Preloader from './components/Preloader';
import './App.css';

function App() {
  return (
    <>
      <Preloader />
      <Router>
        <Routes>
        {/* Public Routes wrapped in Main Layout */}
        <Route element={<Layout><Outlet /></Layout>}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/land-surveying" element={<LandSurveying />} />
          <Route path="/services/engineering-survey" element={<EngineeringSurvey />} />
          <Route path="/services/digital-mapping" element={<DigitalMapping />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:id" element={<ProjectDetail />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin Routes (No Main Layout, has its own AdminLayout) */}
        {/* <Route path="/admin/login" element={<Login />} /> */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={
            <div className="space-y-12">
              <h2 className="text-2xl font-bold">Dashboard Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Projects</h3>
                  <p className="mt-2 text-sm text-gray-500">Update your portfolio dynamically.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900">Quotations</h3>
                  <p className="mt-2 text-sm text-gray-500">Generate and manage quotes.</p>
                </div>
              </div>
            </div>
          } />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/new" element={<ProjectForm />} />
          <Route path="projects/edit/:id" element={<ProjectForm />} />

          <Route path="quotations" element={<QuotationBuilder />} />
          <Route path="daily-reports" element={<DailyReports />} />
        </Route>
      </Routes>
    </Router>
    </>
  );
}

export default App;
