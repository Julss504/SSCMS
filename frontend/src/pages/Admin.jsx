import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserData, isAdmin, removeToken, removeUserData } from '../services/api';
import Users from './Users';
// import Attendance from './Attendance';
import Archive from './Archive';

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const userData = getUserData();
    const isAdminUser = isAdmin();
    if (!userData || !isAdminUser) {
      navigate('/login');
      return;
    }
    if (pathname.includes('archive')) {
      setActiveTab('archive');
    } else if (pathname.includes('attendance')) {
      setActiveTab('attendance');
    } else if (pathname.includes('users')) {
      setActiveTab('users');
    } else {
      setActiveTab('users');
    }
  }, [pathname, navigate]);

  const userData = getUserData();
  const isAdminUser = isAdmin();

  if (!userData || !isAdminUser) {
    return null;
  }

  const handleLogout = () => {
    removeToken();
    removeUserData();
    navigate('/login');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Administration</h2>
        <p className="text-sm text-brand-500 mt-1 font-medium">Manage users and archived records</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden">
        <div className="flex border-b border-brand-200 bg-brand-50/50">
          <button
            onClick={() => {
              setActiveTab('users');
              navigate('/users');
            }}
            className={`flex-1 px-6 py-4 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'users'
                ? 'text-ssc-red-600 border-b-2 border-ssc-red-600 bg-white'
                : 'text-brand-500 hover:text-brand-700 hover:bg-brand-100/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              User Management
            </div>
          </button>
          {/* <button
            onClick={() => {
              setActiveTab('attendance');
              navigate('/attendance');
            }}
            className={`flex-1 px-6 py-4 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'attendance'
                ? 'text-ssc-red-600 border-b-2 border-ssc-red-600 bg-white'
                : 'text-brand-500 hover:text-brand-700 hover:bg-brand-100/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0021 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Attendance Management
            </div>
          </button> */}
          <button
            onClick={() => {
              setActiveTab('archive');
              navigate('/archive');
            }}
            className={`flex-1 px-6 py-4 text-sm font-bold tracking-wide transition-colors ${
              activeTab === 'archive'
                ? 'text-ssc-red-600 border-b-2 border-ssc-red-600 bg-white'
                : 'text-brand-500 hover:text-brand-700 hover:bg-brand-100/50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.844 4.25-8.25 4.25S3.75 8.653 3.75 6.375m16.5 0c0-1.163-.185-2.266-.5-3.25M20.25 6.375v13.5m-16.5-13.5v13.5m16.5 0v3.75c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125v-3.75m16.5 0c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125" />
              </svg>
              Archive Management
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'users' && <Users hideNav={true} />}
          {activeTab === 'attendance' && <Attendance hideNav={true} />}
          {activeTab === 'archive' && <Archive hideNav={true} />}
        </div>
      </div>
    </div>
  );
};

export default Admin;