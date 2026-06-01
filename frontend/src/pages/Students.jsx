import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI, getUserData, isAdmin } from '../services/api';

const Students = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    year: '',
    section: '',
  });
  const [error, setError] = useState('');
  const userData = getUserData();

  useEffect(() => {
    if (!userData || !isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      setStudents(response.data);
    } catch (error) {
      if (error.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        console.error('Error fetching students:', error);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await studentsAPI.delete(id);
        setStudents(students.filter(student => student._id !== id));
      } catch (error) {
        if (error.message === 'Session expired. Please log in again.') {
          console.warn('Session expired, redirecting to login');
        } else {
          alert('Error deleting student: ' + error.message);
        }
      }
    }
  };

  const handleArchive = async (id) => {
    if (window.confirm('Are you sure you want to archive this student?')) {
      try {
        await studentsAPI.archive(id);
        setStudents(students.filter(student => student._id !== id));
      } catch (error) {
        if (error.message === 'Session expired. Please log in again.') {
          console.warn('Session expired, redirecting to login');
        } else {
          alert('Error archiving student: ' + error.message);
        }
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingStudent) {
        await studentsAPI.update(editingStudent._id, formData);
      } else {
        await studentsAPI.create(formData);
      }
      setShowModal(false);
      setEditingStudent(null);
      setFormData({
        studentId: '',
        name: '',
        email: '',
        phone: '',
        department: '',
        year: '',
        section: '',
      });
      fetchStudents();
    } catch (err) {
      if (err.message === 'Session expired. Please log in again.') {
        console.warn('Session expired, redirecting to login');
      } else {
        setError(err.message || 'Operation failed');
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      department: student.department || '',
      year: student.year || '',
      section: student.section || '',
    });
    setShowModal(true);
  };

  const handleImport = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const response = await studentsAPI.import(file);
        
        alert(`Successfully imported ${response.data.imported} students. ${response.data.errors} errors found.`);
        
        fetchStudents();
        
        e.target.value = '';
      } catch (err) {
        // Handle session expired error
        if (err.message === 'Session expired. Please log in again.') {
          console.warn('Session expired, redirecting to login');
        } else {
          alert(err.message || 'Error importing students');
        }
      }
    };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({
      studentId: '',
      name: '',
      email: '',
      phone: '',
      department: '',
      year: '',
      section: '',
    });
    setShowModal(true);
  };

  const departments = ['Business Department', 'Information Technology Dept.', 'Hospitality Management Dept.', 'Education Dept.'];
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  const filteredStudents = students.filter(student => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      student.name?.toLowerCase().includes(searchLower) ||
      student.studentId?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower);
    const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;
    const matchesYear = !selectedYear || student.year === selectedYear;
    const matchesSection = !selectedSection || student.section === selectedSection;
    return matchesSearch && matchesDepartment && matchesYear && matchesSection;
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-900 tracking-tight">Student Management</h2>
            <p className="text-sm text-brand-500 mt-1 font-medium">Manage student records and registrations</p>
          </div>
          <div className="flex gap-3">
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-green-600/15 transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Import XLSX
              <input type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ssc-red-600 hover:bg-ssc-red-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-ssc-red-600/15 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add New Student
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-100 p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search students by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
          >
            <option value="">All Departments</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
          >
            <option value="">All Years</option>
            {years.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
          >
            <option value="">All Sections</option>
            {sections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-brand-100 overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-sm text-brand-400 font-medium">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-200 bg-brand-50/50">
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Student ID</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Department</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Year</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Section</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Events</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-brand-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-brand-50/50 transition-colors">
                    <td className="py-3.5 px-5 text-sm font-mono font-medium text-brand-900">{student.studentId}</td>
                    <td className="py-3.5 px-5 text-sm font-semibold text-brand-900">{student.name}</td>
                    <td className="py-3.5 px-5 text-sm text-brand-600">{student.email}</td>
                    <td className="py-3.5 px-5 text-sm text-brand-600">{student.phone || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-sm text-brand-600">{student.department || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-sm text-brand-600">{student.year || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-sm text-brand-600">{student.section || 'N/A'}</td>
                    <td className="py-3.5 px-5 text-sm text-brand-900 font-medium">{student.registeredEvents?.length || 0}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-900 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete
                        </button>
                        <button
                          onClick={() => handleArchive(student._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.844 4.25-8.25 4.25S3.75 8.653 3.75 6.375m16.5 0c0-1.163-.185-2.266-.5-3.25M20.25 6.375v13.5m-16.5-13.5v13.5m16.5 0v3.75c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125v-3.75m16.5 0c0 .621-.504 1.125-1.125 1.125h-9.75c-.621 0-1.125-.504-1.125-1.125" />
                          </svg>
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-brand-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-dropdown max-w-md w-full p-6 animate-slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-brand-900">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-100 text-brand-400 hover:text-brand-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Student ID</label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  required
                  disabled={editingStudent !== null}
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="">Select Department</option>
                  <option value="Business Department">Business Department</option>
                  <option value="Information Technology Dept.">Information Technology Dept.</option>
                  <option value="Hospitality Management Dept.">Hospitality Management Dept.</option>
                  <option value="Education Dept.">Education Dept.</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Year</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 uppercase tracking-wider mb-2">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g. A, B, C"
                  className="w-full px-4 py-2.5 bg-brand-50 border border-brand-200 rounded-xl text-sm text-brand-900 placeholder-brand-400 focus:ring-2 focus:ring-ssc-red-500/20 focus:border-ssc-red-500 outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-ssc-red-600 hover:bg-ssc-red-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  {editingStudent ? 'Update Student' : 'Create Student'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-brand-100 hover:bg-brand-200 text-brand-700 font-semibold py-2.5 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
