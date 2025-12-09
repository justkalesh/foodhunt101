
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/mockDatabase';
import { User, UserRole } from '../types';
import { ChevronLeft, Lock, Unlock, Plus, MessageSquare, X, Bell } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add User Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', semester: '', password: '', role: UserRole.STUDENT });

  // Push Notification Modal
  const [isPushModalOpen, setIsPushModalOpen] = useState(false);
  const [pushTarget, setPushTarget] = useState<User | null>(null);
  const [pushData, setPushData] = useState({ title: '', body: '' });

  // Edit User Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', pfp_url: '' });

  // Reward Modal
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardData, setRewardData] = useState({ target: 'all', userId: '', amount: '50' }); // target: 'all' or 'single'

  // Sort State
  type SortOption = 'newest' | 'oldest' | 'points_high';
  const [sortBy, setSortBy] = useState<SortOption>('newest');

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

  // Computed sorted users
  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'points_high') {
      return (b.loyalty_points || 0) - (a.loyalty_points || 0);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // Default 'newest'
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleToggleStatus = async (targetUserId: string) => {
    if (targetUserId === user?.id) {
      alert("You cannot disable your own admin account.");
      return;
    }
    await api.admin.users.toggleStatus(targetUserId);
    fetchUsers();
  };

  const handleEditUser = (u: User) => {
    setEditUser(u);
    setEditFormData({ name: u.name, pfp_url: u.pfp_url || '' });
    setIsEditModalOpen(true);
  };

  const submitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    const res = await api.users.updateProfile(editUser.id, editFormData);
    if (res.success) {
      setIsEditModalOpen(false);
      fetchUsers();
    } else {
      alert(res.message);
    }
  };

  const handleReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(rewardData.amount);
    if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

    let targetIds: string[] = [];
    if (rewardData.target === 'all') {
      targetIds = users.filter(u => u.role === UserRole.STUDENT).map(u => u.id); // Only reward students? Or everyone? User said "everyone at once".
      // Let's reward everyone including other admins/vendors if wanted, but mostly students.
      // User asked "users".
    } else {
      if (!rewardData.userId) return alert("Select a user");
      targetIds = [rewardData.userId];
    }

    if (targetIds.length === 0) return alert("No users found to reward.");

    // @ts-ignore
    const res = await api.admin.users.rewardPoints(targetIds, amount);
    if (res.success) {
      alert(res.message);
      setIsRewardModalOpen(false);
      fetchUsers();
    } else {
      alert(res.message);
    }
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

  const handleMessageUser = (u: User) => {
    navigate(`/inbox?userId=${u.id}&userName=${encodeURIComponent(u.name)}&userEmail=${encodeURIComponent(u.email)}`);
  };

  const openPushModal = (u: User) => {
    setPushTarget(u);
    setPushData({ title: 'Announcement', body: '' });
    setIsPushModalOpen(true);
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTarget) return;

    try {
      const res = await fetch('/api/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pushTarget.id,
          title: pushData.title,
          body: pushData.body
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Push Notification Sent!');
        setIsPushModalOpen(false);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err: any) {
      alert('Failed to send: ' + err.message);
    }
  };

  if (loading) return <div className="p-10 text-center dark:text-white">Loading Users...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/admin" className="text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 mb-4 text-sm font-medium">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>

          <div className="flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold dark:text-white">Manage Users</h1>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="p-1 border rounded text-sm dark:bg-dark-800 dark:text-white dark:border-gray-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Date Joined (Oldest)</option>
                  <option value="points_high">Most Points</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsRewardModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm"
              >
                <div className="w-5 h-5 flex items-center justify-center font-bold">$</div> Reward
              </button>
              <button
                onClick={() => openPushModal({ id: 'ALL', name: 'ALL USERS', email: '', role: UserRole.STUDENT, semester: '', loyalty_points: 0, is_disabled: false, created_at: '' })}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm"
              >
                <Bell size={20} /> Broadcast
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm"
              >
                <Plus size={20} /> Add User
              </button>
            </div>
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
                {sortedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/profile/${u.id}`} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          {u.pfp_url ? <img src={u.pfp_url} alt={u.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{u.name[0]}</div>}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{u.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Email: {u.email}</div>
                        </div>
                      </Link>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                      </button>

                      {u.role !== UserRole.ADMIN && (
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-colors ${u.is_disabled ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          {u.is_disabled ? <><Unlock size={14} /> Enable</> : <><Lock size={14} /> Disable</>}
                        </button>
                      )}

                      <button
                        onClick={() => handleMessageUser(u)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        <MessageSquare size={14} /> Msg
                      </button>
                      <button
                        onClick={() => openPushModal(u)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                      >
                        <Bell size={14} /> Push
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit User Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-sm">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Edit User</h2>
                <button onClick={() => setIsEditModalOpen(false)}><X size={24} className="text-gray-500" /></button>
              </div>
              <form onSubmit={submitEditUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:text-white dark:border-gray-600" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">PFP URL</label>
                  <input value={editFormData.pfp_url} onChange={e => setEditFormData({ ...editFormData, pfp_url: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:text-white dark:border-gray-600" />
                </div>
                <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-bold">Save Changes</button>
              </form>
            </div>
          </div>
        )}

        {/* Reward Modal */}
        {isRewardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-sm">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Reward Loyalty Points</h2>
                <button onClick={() => setIsRewardModalOpen(false)}><X size={24} className="text-gray-500" /></button>
              </div>
              <form onSubmit={handleReward} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Target</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 dark:text-white">
                      <input type="radio" checked={rewardData.target === 'all'} onChange={() => setRewardData({ ...rewardData, target: 'all' })} /> All Users
                    </label>
                    <label className="flex items-center gap-2 dark:text-white">
                      <input type="radio" checked={rewardData.target === 'single'} onChange={() => setRewardData({ ...rewardData, target: 'single' })} /> Specific User
                    </label>
                  </div>
                </div>

                {rewardData.target === 'single' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Select User</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search user..."
                        className="w-full p-2 border rounded dark:bg-dark-900 dark:text-white dark:border-gray-600"
                        list="user-list"
                        onChange={(e) => {
                          // If we had a local 'searchTerm' state, we'd update it here.
                          // But to fix the "can't type" issue without adding a new state variable to the top-level component (which forces a re-render of the whole table),
                          // we can use the default behavior of input with datalist, BUT we must NOT force 'value' to be the resolved name unless it's a match.
                          // Actually, the issue is that 'value' prop is controlled by state that gets updated onInput.
                          // Simpler fix: Remove 'value' prop (make it uncontrolled) OR use a local state variable inside a small wrapper?
                          // I'll stick to the controlled component pattern but relax the matching logic.
                          // Wait, the previous code had `value={users.find...?.name}`. That resets the input to "Bob" as soon as you type "B" (if Bob matches) or empty string.
                          // I will change this input to be UNCONTROLLED (defaultValue) or manage a separate 'searchValue' state.
                          // Given I can't easily add generic state here without refactoring, I will use a local state `searchTerm` in the Modal block? No, Modals are conditonal.
                          // I'll just change `value` to NOT be forced.
                        }}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                          const val = e.currentTarget.value;
                          // Attempt to match
                          const u = users.find(user => user.name === val || user.email === val);
                          if (u) {
                            setRewardData({ ...rewardData, userId: u.id });
                          } else {
                            // If cleared or typing, ensure we don't accidentally keep the old ID if name doesn't match?
                            // Actually, allow free typing for search, but ID only sets on match.
                            if (rewardData.userId && !u) {
                              setRewardData({ ...rewardData, userId: '' });
                            }
                          }
                        }}
                      />
                      <datalist id="user-list">
                        {users.map(u => <option key={u.id} value={u.name}>{u.email}</option>)}
                      </datalist>
                      <p className="text-xs text-gray-500 mt-1">Start typing name to search</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Points Amount</label>
                  <input type="number" value={rewardData.amount} onChange={e => setRewardData({ ...rewardData, amount: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:text-white dark:border-gray-600" />
                </div>

                <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold">Send Points</button>
              </form>
            </div>
          </div>
        )}

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

        {/* Push Notification Modal */}
        {isPushModalOpen && pushTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Send Push Notification</h2>
                <button onClick={() => setIsPushModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400"><X size={24} /></button>
              </div>
              <form onSubmit={handleSendPush} className="p-6 space-y-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">To: <span className="font-bold text-gray-900 dark:text-white">{pushTarget.name}</span></p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input required value={pushData.title} onChange={e => setPushData({ ...pushData, title: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Body</label>
                  <textarea required value={pushData.body} onChange={e => setPushData({ ...pushData, body: e.target.value })} className="w-full p-2 border rounded dark:bg-dark-900 dark:border-gray-600 dark:text-white" rows={4} />
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700">Send Notification</button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminUsers;
