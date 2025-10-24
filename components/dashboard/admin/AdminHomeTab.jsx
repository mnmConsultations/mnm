'use client';

import { useState, useEffect } from 'react';
import { apiInstance as axios } from '../../../lib/utils/axios';
import { useToast } from '../../Toast';
import { useConfirmDialog } from '../../ConfirmDialog';

/**
 * Admin Home Tab Component
 * 
 * Main dashboard for administrators to manage users
 * 
 * Features:
 * - View count of paid users (users with active subscriptions)
 * - Search users by email with pagination (10 per page)
 * - Edit user packages (free, basic, plus) with edit mode pattern
 * - Delete users (only if they don't have active paid plans)
 * - Role filtering (only shows regular users, not admins)
 * 
 * Edit Mode Pattern: Admin clicks "Edit Package", makes changes in memory,
 * then clicks "Save" to commit (reduces unnecessary API calls)
 */
const AdminHomeTab = () => {
  const toast = useToast();
  const { confirm } = useConfirmDialog();
  const [paidUserCount, setPaidUserCount] = useState(0);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
      toast.error('Failed to fetch paid user count');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (page = 1) => {
    if (!searchEmail.trim()) {
      toast.warning('Please enter an email to search');
      setSearchResults([]);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalCount(0);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`/api/admin/users/search?email=${encodeURIComponent(searchEmail)}&page=${page}`);
      if (response.data.success) {
        setSearchResults(response.data.users);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount);
        setHasNextPage(response.data.hasNextPage);
        setHasPreviousPage(response.data.hasPreviousPage);
        
        if (response.data.totalCount === 0) {
          toast.info('No users found with that email');
        } else if (page === 1) {
          toast.success(`Found ${response.data.totalCount} user${response.data.totalCount !== 1 ? 's' : ''}`);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleSearch(newPage);
    }
  };

  const handleClearSearch = () => {
    setSearchEmail('');
    setSearchResults([]);
    setSelectedUser(null);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalCount(0);
    setHasNextPage(false);
    setHasPreviousPage(false);
  };

  const handleDeleteUser = async (userId, userEmail, userPackage, packageExpiresAt) => {
    // Check if user has active plan
    if (userPackage !== 'free' && packageExpiresAt && new Date(packageExpiresAt) > new Date()) {
      toast.warning('Cannot delete user with active plan');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete user ${userEmail}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const response = await axios.delete(`/api/admin/users/${userId}`);
      if (response.data.success) {
        toast.success('User deleted successfully');
        // Remove from search results
        setSearchResults(searchResults.filter(u => u._id !== userId));
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * User Package Edit Mode Functions
   * 
   * Implements edit-then-save pattern for user package management:
   * 1. handleEditUser: Enters edit mode, copies current package to temp state
   * 2. handlePackageChange: Updates package in temp state only (no API call)
   * 3. handleSaveUserChanges: Validates, confirms, then saves to database
   * 4. handleCancelEdit: Discards changes and exits edit mode
   * 
   * Prevents accidental package changes and reduces unnecessary DB updates
   */
  
  const handleEditUser = () => {
    setIsEditingUser(true);
    setTempUserData({
      package: selectedUser.package
    });
  };

  const handleCancelEdit = () => {
    setIsEditingUser(false);
    setTempUserData(null);
  };

  const handlePackageChange = (newPackage) => {
    setTempUserData({
      ...tempUserData,
      package: newPackage
    });
  };

  const handleSaveUserChanges = async () => {
    if (tempUserData.package === selectedUser.package) {
      toast.info('No changes to save');
      setIsEditingUser(false);
      setTempUserData(null);
      return;
    }

    const confirmed = await confirm({
      title: 'Save User Changes',
      message: `Are you sure you want to change this user's package from ${selectedUser.package.toUpperCase()} to ${tempUserData.package.toUpperCase()}?`,
      confirmText: 'Save Changes',
      cancelText: 'Cancel',
      type: 'info',
    });

    if (!confirmed) return;

    try {
      setIsSaving(true);
      const response = await axios.patch(`/api/admin/users/${selectedUser._id}`, {
        package: tempUserData.package,
      });
      if (response.data.success) {
        toast.success('User package updated successfully');
        // Update search results
        setSearchResults(searchResults.map(u => 
          u._id === selectedUser._id ? response.data.user : u
        ));
        setSelectedUser(response.data.user);
        setPaidUserCount(response.data.paidUserCount);
        setIsEditingUser(false);
        setTempUserData(null);
      }
    } catch (error) {
      console.error('Error updating user package:', error);
      toast.error(error.response?.data?.error || 'Failed to update user package');
    } finally {
      setIsSaving(false);
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
                disabled={isSearching || !searchEmail.trim()}
              >
                {isSearching ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
              {(searchEmail || searchResults.length > 0) && (
                <button
                  className="btn btn-ghost"
                  onClick={handleClearSearch}
                  disabled={isSearching}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              )}
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-base-content/70">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} users
                  </div>
                  <div className="join">
                    <button 
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPreviousPage || isSearching}
                    >
                      «
                    </button>
                    <button className="join-item btn btn-sm">
                      Page {currentPage} of {totalPages}
                    </button>
                    <button 
                      className="join-item btn btn-sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNextPage || isSearching}
                    >
                      »
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Help Text */}
          {!searchEmail && searchResults.length === 0 && (
            <div className="alert alert-info mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p className="font-semibold">Search for users by email address</p>
                <p className="text-sm mt-2">Press Enter or click Search to find users (10 results per page, admin accounts excluded)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Management Modal */}
      {selectedUser && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Manage User</h3>
              {!isEditingUser && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleEditUser}
                >
                  Edit Package
                </button>
              )}
            </div>
            
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
                  (isEditingUser ? tempUserData.package : selectedUser.package) === 'free' ? 'badge-ghost' :
                  (isEditingUser ? tempUserData.package : selectedUser.package) === 'basic' ? 'badge-info' :
                  'badge-success'
                }`}>
                  {(isEditingUser ? tempUserData.package : selectedUser.package).toUpperCase()}
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

              {isEditingUser && (
                <div>
                  <p className="font-semibold mb-2">Change Package:</p>
                  <div className="flex gap-2">
                    <button
                      className={`btn btn-sm ${tempUserData.package === 'free' ? 'btn-ghost' : 'btn-outline'}`}
                      onClick={() => handlePackageChange('free')}
                      disabled={isSaving}
                    >
                      Free
                    </button>
                    <button
                      className={`btn btn-sm ${tempUserData.package === 'basic' ? 'btn-info' : 'btn-outline'}`}
                      onClick={() => handlePackageChange('basic')}
                      disabled={isSaving}
                    >
                      Basic
                    </button>
                    <button
                      className={`btn btn-sm ${tempUserData.package === 'plus' ? 'btn-success' : 'btn-outline'}`}
                      onClick={() => handlePackageChange('plus')}
                      disabled={isSaving}
                    >
                      Plus
                    </button>
                  </div>
                  {tempUserData.package !== selectedUser.package && (
                    <div className="alert alert-warning mt-2 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Package will change from {selectedUser.package.toUpperCase()} to {tempUserData.package.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              )}

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
              {isEditingUser ? (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={handleSaveUserChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button 
                    className="btn btn-ghost"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn" onClick={() => {
                  setSelectedUser(null);
                  setIsEditingUser(false);
                  setTempUserData(null);
                }}>
                  Close
                </button>
              )}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setSelectedUser(null);
              setIsEditingUser(false);
              setTempUserData(null);
            }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default AdminHomeTab;
