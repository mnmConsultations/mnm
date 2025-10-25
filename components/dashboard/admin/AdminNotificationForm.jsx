/**
 * Admin Notification Form Component
 * 
 * Allows admins to send custom notifications to users
 * Features:
 * - Send to all users or select specific users
 * - Custom title, message, type, and priority
 * - Optional action URL
 * - Preview before sending
 * - Success/error feedback
 */
'use client';

import { useState, useEffect } from 'react';

const AdminNotificationForm = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    actionUrl: '',
    targetUserIds: []
  });
  const [sendToAll, setSendToAll] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsFetchingUsers(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => {
      const isSelected = prev.targetUserIds.includes(userId);
      return {
        ...prev,
        targetUserIds: isSelected
          ? prev.targetUserIds.filter(id => id !== userId)
          : [...prev.targetUserIds, userId]
      };
    });
  };

  const handleSelectAll = () => {
    setFormData(prev => ({
      ...prev,
      targetUserIds: users.map(u => u.id)
    }));
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      targetUserIds: []
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.message.trim()) {
      setError('Message is required');
      return;
    }
    if (formData.title.length > 100) {
      setError('Title must be 100 characters or less');
      return;
    }
    if (formData.message.length > 500) {
      setError('Message must be 500 characters or less');
      return;
    }
    if (!sendToAll && formData.targetUserIds.length === 0) {
      setError('Please select at least one user or choose "Send to All"');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        priority: formData.priority,
        actionUrl: formData.actionUrl.trim() || undefined,
        targetUserIds: sendToAll ? undefined : formData.targetUserIds
      };

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`✓ Notification sent successfully to ${data.notificationsSent} user(s)!`);
        // Reset form
        setFormData({
          title: '',
          message: '',
          type: 'info',
          priority: 'medium',
          actionUrl: '',
          targetUserIds: []
        });
        setSendToAll(true);
      } else {
        setError(data.error || 'Failed to send notification');
      }
    } catch (err) {
      setError('An error occurred while sending notification');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">
        <svg className="w-6 h-6 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Send Custom Notification
      </h2>

      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Title *</span>
            <span className="label-text-alt">{formData.title.length}/100</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., System Maintenance Notice"
            className="input input-bordered w-full"
            maxLength={100}
            required
          />
        </div>

        {/* Message */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Message *</span>
            <span className="label-text-alt">{formData.message.length}/500</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Enter your notification message..."
            className="textarea textarea-bordered h-32"
            maxLength={500}
            required
          />
        </div>

        {/* Type and Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Type</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              <option value="info">Info (Blue)</option>
              <option value="success">Success (Green)</option>
              <option value="warning">Warning (Yellow)</option>
              <option value="error">Error (Red)</option>
              <option value="update">Update (Blue)</option>
            </select>
          </div>

          {/* Priority */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Priority</span>
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="select select-bordered w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Action URL */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Action URL (Optional)</span>
          </label>
          <input
            type="url"
            name="actionUrl"
            value={formData.actionUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/action"
            className="input input-bordered w-full"
          />
          <label className="label">
            <span className="label-text-alt">If provided, a "Take Action" button will appear</span>
          </label>
        </div>

        {/* Target Users */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Recipients</span>
          </label>
          
          <div className="flex gap-2 mb-3">
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="recipientType"
                className="radio"
                checked={sendToAll}
                onChange={() => setSendToAll(true)}
              />
              <span className="label-text">Send to All Users</span>
            </label>
            <label className="label cursor-pointer gap-2">
              <input
                type="radio"
                name="recipientType"
                className="radio"
                checked={!sendToAll}
                onChange={() => setSendToAll(false)}
              />
              <span className="label-text">Select Specific Users</span>
            </label>
          </div>

          {!sendToAll && (
            <div className="border border-base-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="btn btn-xs btn-outline"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="btn btn-xs btn-outline"
                >
                  Deselect All
                </button>
                <span className="text-sm ml-auto self-center">
                  {formData.targetUserIds.length} selected
                </span>
              </div>

              {isFetchingUsers ? (
                <div className="flex justify-center py-4">
                  <span className="loading loading-spinner loading-sm"></span>
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-base-content/50 text-center py-4">
                  No users found
                </p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <label key={user.id} className="label cursor-pointer justify-start gap-3 hover:bg-base-200 rounded-lg p-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={formData.targetUserIds.includes(user.id)}
                        onChange={() => handleUserSelection(user.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-base-content/50">{user.email}</div>
                      </div>
                      <span className={`badge badge-sm ${
                        user.package === 'free' ? 'badge-ghost' :
                        user.package === 'essential' ? 'badge-info' :
                        'badge-success'
                      }`}>
                        {user.package}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="alert alert-info">
          <div className="flex-1">
            <div className="font-semibold mb-1">Preview</div>
            <div className="text-sm">
              <strong>{formData.title || 'Notification Title'}</strong>
              <p className="mt-1">{formData.message || 'Your notification message will appear here...'}</p>
              <div className="mt-2 text-xs opacity-70">
                Type: {formData.type} • Priority: {formData.priority}
                {formData.actionUrl && ' • Has Action Link'}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                message: '',
                type: 'info',
                priority: 'medium',
                actionUrl: '',
                targetUserIds: []
              });
              setSendToAll(true);
              setError('');
              setSuccess('');
            }}
            className="btn btn-ghost"
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Notification
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="alert alert-warning mt-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div className="text-sm">
          <strong>Note:</strong> Notifications will automatically expire after 7 days. 
          Users will see them in the "Notifications & Updates" section of their dashboard.
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationForm;
