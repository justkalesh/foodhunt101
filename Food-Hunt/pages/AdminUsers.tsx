
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockDatabase';
import { User, UserRole } from '../types';
import { ChevronLeft, Lock, Unlock, Shield, Plus, MessageSquare, X, Send } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', semester: '', password: '', role: UserRole.STUDENT });

  // Message Modal
  const [isMsgModalOpen, setIsMsgModalOpen] = useState(false);
  const [msgTarget, setMsgTarget] = useState<User | null>(null);
  const [msgContent, setMsgContent] = useState('');

  useEffect(() => {
    if (user && user.role !== UserRole.ADMIN) {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await api.admin.users.getAll();
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (targetUserId: string) => {
    // Prevent disabling self
    if (targetUserId === user?.id) {
      alert("You cannot disable your own admin account.");
      return;
    }
    await api.admin.users.toggleStatus(targetUserId);
    fetchUsers();
    fetchUsers();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.admin.users.create(newUser);
    if (res.success) {
      setIsAddModalOpen(false);
      setNewUser({ email: '', name: '', semester: '', password: '', role: UserRole.STUDENT });
      fetchUsers();
    } else {
      alert(res.message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTarget) return;
    const res = await api.messages.send('uadmin', msgTarget.id, msgContent);
    if (res.success) {
      setIsMsgModalOpen(false);
      setMsgContent('');
      setMsgTarget(null);
      alert('Message sent!');
    }
  };

  const openMsgModal = (u: User) => {
    setMsgTarget(u);
    setIsMsgModalOpen(true);
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Loading Users...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/admin" className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 mb-4 text-sm font-medium">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>

          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold dark:text-white">Manage Users</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm"
            >
              <Plus size={20} /> Add User
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 shadow-md rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User Info</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Semester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Loyalty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Email: {u.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {u.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
                      {u.loyalty_points || 0} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {u.role !== UserRole.ADMIN && (
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-colors ${u.is_disabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          {u.is_disabled ? <><Unlock size={14} /> Enable</> : <><Lock size={14} /> Disable</>}
                        </button>
                      )}
                      {u.role === UserRole.ADMIN && (
                        <span className="text-gray-400 text-xs italic">Protected</span>
                      )}
                      <button
                        onClick={() => openMsgModal(u)}
                        className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        <MessageSquare size={14} /> Msg
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Add New User</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                  <input required value={newUser.semester} onChange={e => setNewUser({ ...newUser, semester: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input required type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })} className="w-full p-2 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white">
                    <option value={UserRole.STUDENT}>Student</option>
                    <option value={UserRole.VENDOR}>Vendor</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700">Create User</button>
              </form>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {isMsgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Message {msgTarget?.name}</h2>
                <button onClick={() => setIsMsgModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleSendMessage} className="p-6 space-y-4">
                <textarea
                  required
                  rows={4}
                  placeholder="Type your message..."
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  className="w-full p-3 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white"
                />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                  <Send size={16} /> Send Message
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
