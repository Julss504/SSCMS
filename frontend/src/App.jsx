import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentRegister from './pages/StudentRegister';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import Students from './pages/Students';
import Events from './pages/Events';
import Admin from './pages/Admin';
import Attendance from './pages/Attendance';
import Archive from './pages/Archive';
import { getToken, getUserData } from './services/api';

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = getToken();
  const userData = getUserData();
  return token && userData?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

const AdminOrOfficerRoute = ({ children }) => {
  const token = getToken();
  const userData = getUserData();
  return token && (userData?.role === 'admin' || userData?.role === 'officer') ? children : <Navigate to="/dashboard" />;
};

const StudentRoute = ({ children }) => {
  const token = getToken();
  const userData = getUserData();
  return token && userData?.role === 'student' ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <StudentRoute>
              <Layout><StudentDashboard /></Layout>
            </StudentRoute>
          }
        />
        <Route
          path="/students"
          element={
            <AdminRoute>
              <Layout><Students /></Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Layout><Events /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <AdminOrOfficerRoute>
              <Layout><Attendance /></Layout>
            </AdminOrOfficerRoute>
          }
        />
        <Route
          path="/archive"
          element={
            <AdminRoute>
              <Layout><Archive /></Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Layout><Admin /></Layout>
            </AdminRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
