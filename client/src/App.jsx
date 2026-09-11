import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, Link } from 'react-router-dom';
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
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import AdminLayout from './pages/admin/AdminLayout';
import Login from './pages/admin/Login';
import Preloader from './components/Preloader';
import { 
  ChatTeardropText, 
  Briefcase, 
  FileText, 
  Article, 
  EnvelopeSimple, 
  Users,
  ArrowRight
} from '@phosphor-icons/react';
import './App.css';

// Lazy-loaded heavy components to optimize production bundle size
const PointConverter = lazy(() => import('./pages/PointConverter'));
const QuotationBuilder = lazy(() => import('./pages/admin/QuotationBuilder'));
const ProjectList = lazy(() => import('./pages/admin/ProjectList'));
const ProjectForm = lazy(() => import('./pages/admin/ProjectForm'));
const DailyReports = lazy(() => import('./pages/admin/DailyReports'));
const ContactList = lazy(() => import('./pages/admin/ContactList'));
const BlogList = lazy(() => import('./pages/admin/BlogList'));
const BlogForm = lazy(() => import('./pages/admin/BlogForm'));
const SubscriberList = lazy(() => import('./pages/admin/SubscriberList'));

const RouteLoading = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
    <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
    <span className="text-xs font-bold uppercase tracking-widest text-secondary/60">Loading Page...</span>
  </div>
);

function App() {
  return (
    <>
      <Preloader />
      <Router>
        <Routes>
          {/* Public Routes wrapped in Main Layout */}
          <Route element={
            <Layout>
              <Outlet />
            </Layout>
          }>
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
            
            {/* Lazy-loaded Point Converter */}
            <Route path="/point-converter" element={
              <Suspense fallback={<RouteLoading />}>
                <PointConverter />
              </Suspense>
            } />
            <Route path="/converter" element={<Navigate to="/point-converter" replace />} />
            <Route path="/tools/point-converter" element={<Navigate to="/point-converter" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                  <p className="text-sm text-gray-500 mt-1">Select a management module to proceed.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link to="/admin/contacts" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition">
                      <ChatTeardropText className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition flex items-center justify-between">
                      Inquiries & Leads
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Review quote requests, contact form entries, and customer messages.</p>
                  </Link>

                  <Link to="/admin/projects" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition flex items-center justify-between">
                      Portfolio Projects
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Manage case studies, site photographs, and survey project records.</p>
                  </Link>

                  <Link to="/admin/quotations" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition flex items-center justify-between">
                      Quotation Builder
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Generate formal PDF quotations with tax calculations and bank details.</p>
                  </Link>

                  <Link to="/admin/blog" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Article className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition flex items-center justify-between">
                      Blog & Insights
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Publish articles, property advice, and survey educational guides.</p>
                  </Link>

                  <Link to="/admin/subscribers" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition">
                      <EnvelopeSimple className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition flex items-center justify-between">
                      Subscribers
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">View newsletter subscribers and export email lists to CSV.</p>
                  </Link>

                  <Link to="/admin/daily-reports" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:border-primary/50 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition flex items-center justify-between">
                      Daily Field Reports
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Field team logs and automatic daily executive email summaries.</p>
                  </Link>
                </div>
              </div>
            } />

            {/* Inquiries */}
            <Route path="contacts" element={
              <Suspense fallback={<RouteLoading />}>
                <ContactList />
              </Suspense>
            } />

            {/* Projects */}
            <Route path="projects" element={
              <Suspense fallback={<RouteLoading />}>
                <ProjectList />
              </Suspense>
            } />
            <Route path="projects/new" element={
              <Suspense fallback={<RouteLoading />}>
                <ProjectForm />
              </Suspense>
            } />
            <Route path="projects/edit/:id" element={
              <Suspense fallback={<RouteLoading />}>
                <ProjectForm />
              </Suspense>
            } />

            {/* Quotations */}
            <Route path="quotations" element={
              <Suspense fallback={<RouteLoading />}>
                <QuotationBuilder />
              </Suspense>
            } />

            {/* Blog */}
            <Route path="blog" element={
              <Suspense fallback={<RouteLoading />}>
                <BlogList />
              </Suspense>
            } />
            <Route path="blog/new" element={
              <Suspense fallback={<RouteLoading />}>
                <BlogForm />
              </Suspense>
            } />
            <Route path="blog/edit/:id" element={
              <Suspense fallback={<RouteLoading />}>
                <BlogForm />
              </Suspense>
            } />

            {/* Subscribers */}
            <Route path="subscribers" element={
              <Suspense fallback={<RouteLoading />}>
                <SubscriberList />
              </Suspense>
            } />

            {/* Daily Reports */}
            <Route path="daily-reports" element={
              <Suspense fallback={<RouteLoading />}>
                <DailyReports />
              </Suspense>
            } />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;

