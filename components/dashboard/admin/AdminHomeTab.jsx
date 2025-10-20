'use client';

import { useState, useEffect } from 'react';
import { apiInstance as axios } from '../../../lib/utils/axios';

const AdminHomeTab = () => {
  const [paidUserCount, setPaidUserCount] = useState(0);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPaidUserCount();
  }, []);

  const fetchPaidUserCount = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/paid-users');
      if (response.data.success) {
        setPaidUserCount(response.data.paidUserCount);
      }
    } catch (error) {
      console.error('Error fetching paid user count:', error);
      alert('Failed to fetch paid user count');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`/api/admin/users/search?email=${encodeURIComponent(searchEmail)}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      alert('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail, userPackage, packageExpiresAt) => {
    // Check if user has active plan
    if (userPackage !== 'free' && packageExpiresAt && new Date(packageExpiresAt) > new Date()) {
      alert('Cannot delete user with active plan');
      return;
    }

    if (!confirm(`Are you sure you want to delete user ${userEmail}?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await axios.delete(`/api/admin/users/${userId}`);
      if (response.data.success) {
        alert('User deleted successfully');
        // Remove from search results
        setSearchResults(searchResults.filter(u => u._id !== userId));
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdatePackage = async (userId, newPackage) => {
    if (!confirm(`Are you sure you want to change this user's package to ${newPackage}?`)) {
      return;
    }

    try {
      setIsUpdating(true);
      const response = await axios.patch(`/api/admin/users/${userId}`, {
        package: newPackage,
      });
      if (response.data.success) {
        alert('User package updated successfully');
        // Update search results
        setSearchResults(searchResults.map(u => 
          u._id === userId ? response.data.user : u
        ));
        setSelectedUser(response.data.user);
        setPaidUserCount(response.data.paidUserCount);
      }
    } catch (error) {
      console.error('Error updating user package:', error);
      alert(error.response?.data?.error || 'Failed to update user package');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Paid User Count */}
      <div className="card bg-primary text-primary-content shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Paid Users</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <div className="text-5xl font-bold">{paidUserCount}</div>
          )}
          <p>Total number of users with active paid plans</p>
        </div>
      </div>

      {/* User Search */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Search Users</h2>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Search by Email</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter user email..."
                className="input input-bordered flex-1"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 ? (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Search Results:</h3>
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Package</th>
                      <th>Expires</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((user) => (
                      <tr key={user._id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${
                            user.package === 'free' ? 'badge-ghost' :
                            user.package === 'basic' ? 'badge-info' :
                            'badge-success'
                          }`}>
                            {user.package.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {user.packageExpiresAt ? 
                            new Date(user.packageExpiresAt).toLocaleDateString() :
                            'N/A'
                          }
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => setSelectedUser(user)}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : searchEmail && !isSearching ? (
            <div className="alert alert-info mt-4">
              <span>No users found with this email</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-4">Manage User</h3>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Name:</p>
                <p>{selectedUser.firstName} {selectedUser.lastName}</p>
              </div>
              <div>
                <p className="font-semibold">Email:</p>
                <p>{selectedUser.email}</p>
              </div>
              <div>
                <p className="font-semibold">Role:</p>
                <p className="badge badge-primary">{selectedUser.role}</p>
              </div>
              <div>
                <p className="font-semibold">Current Package:</p>
                <p className={`badge ${
                  selectedUser.package === 'free' ? 'badge-ghost' :
                  selectedUser.package === 'basic' ? 'badge-info' :
                  'badge-success'
                }`}>
                  {selectedUser.package.toUpperCase()}
                </p>
              </div>
              {selectedUser.packageExpiresAt && (
                <div>
                  <p className="font-semibold">Package Expires:</p>
                  <p>{new Date(selectedUser.packageExpiresAt).toLocaleDateString()}</p>
                  <p className={`text-sm ${
                    new Date(selectedUser.packageExpiresAt) > new Date() ? 
                    'text-success' : 'text-error'
                  }`}>
                    {new Date(selectedUser.packageExpiresAt) > new Date() ? 
                      'Active' : 'Expired'
                    }
                  </p>
                </div>
              )}

              <div className="divider"></div>

              <div>
                <p className="font-semibold mb-2">Change Package:</p>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => handleUpdatePackage(selectedUser._id, 'free')}
                    disabled={selectedUser.package === 'free' || isUpdating}
                  >
                    Free
                  </button>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => handleUpdatePackage(selectedUser._id, 'basic')}
                    disabled={selectedUser.package === 'basic' || isUpdating}
                  >
                    Basic
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleUpdatePackage(selectedUser._id, 'plus')}
                    disabled={selectedUser.package === 'plus' || isUpdating}
                  >
                    Plus
                  </button>
                </div>
              </div>

              <div className="divider"></div>

              <div>
                <p className="font-semibold mb-2 text-error">Danger Zone:</p>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDeleteUser(
                    selectedUser._id, 
                    selectedUser.email, 
                    selectedUser.package,
                    selectedUser.packageExpiresAt
                  )}
                  disabled={isDeleting || (
                    selectedUser.package !== 'free' && 
                    selectedUser.packageExpiresAt && 
                    new Date(selectedUser.packageExpiresAt) > new Date()
                  )}
                >
                  {isDeleting ? (
                    <span className="loading loading-spinner"></span>
                  ) : (
                    'Delete User'
                  )}
                </button>
                {selectedUser.package !== 'free' && 
                  selectedUser.packageExpiresAt && 
                  new Date(selectedUser.packageExpiresAt) > new Date() && (
                  <p className="text-sm text-error mt-1">
                    Cannot delete user with active plan
                  </p>
                )}
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedUser(null)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default AdminHomeTab;
