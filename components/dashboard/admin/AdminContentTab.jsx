'use client';

import { useState, useEffect } from 'react';
import { apiInstance as axios } from '../../../lib/utils/axios';
import { useToast } from '../../Toast';
import { useConfirmDialog } from '../../ConfirmDialog';
import dynamic from 'next/dynamic';

// Dynamically import RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(() => import('../../RichTextEditor'), {
  ssr: false,
  loading: () => <div className="skeleton h-48 w-full"></div>
});

const AdminContentTab = () => {
  const toast = useToast();
  const { confirm } = useConfirmDialog();
  const [categories, setCategories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState('categories'); // 'categories' or 'tasks'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Order editing states
  const [isEditingCategoryOrder, setIsEditingCategoryOrder] = useState(false);
  const [isEditingTaskOrder, setIsEditingTaskOrder] = useState(false);
  const [tempCategories, setTempCategories] = useState([]);
  const [tempTasks, setTempTasks] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchTasks();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/admin/categories');
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (categoryId = null) => {
    try {
      const url = categoryId ? 
        `/api/admin/tasks?category=${categoryId}` : 
        '/api/admin/tasks';
      const response = await axios.get(url);
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  const handleCreateCategory = () => {
    if (categories.length >= 6) {
      toast.warning('Maximum of 6 categories allowed');
      return;
    }
    setEditingCategory({
      displayName: '',
      description: '',
      icon: 'circle',
      color: '#3B82F6',
      estimatedTimeFrame: '',
    });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory({...category});
    setIsModalOpen(true);
  };

  const handleSaveCategory = async () => {
    try {
      setIsSaving(true);
      
      if (editingCategory._id) {
        // Update existing category
        const response = await axios.patch(
          `/api/admin/categories/${editingCategory.id}`,
          editingCategory
        );
        if (response.data.success) {
          toast.success('Category updated successfully');
          fetchCategories();
          fetchTasks(); // Refresh tasks as category ID might have changed
        }
      } else {
        // Create new category
        const response = await axios.post('/api/admin/categories', editingCategory);
        if (response.data.success) {
          toast.success('Category created successfully');
          fetchCategories();
        }
      }
      
      setIsModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = await confirm({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? All tasks in this category must be deleted first.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await axios.delete(`/api/admin/categories/${categoryId}`);
      if (response.data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  // Category Order Management
  const handleEditCategoryOrder = () => {
    setIsEditingCategoryOrder(true);
    setTempCategories([...categories]);
  };

  const handleCancelCategoryOrder = () => {
    setIsEditingCategoryOrder(false);
    setTempCategories([]);
  };

  const handleMoveCategoryUp = (index) => {
    if (index > 0) {
      const newCategories = [...tempCategories];
      [newCategories[index], newCategories[index - 1]] = [newCategories[index - 1], newCategories[index]];
      setTempCategories(newCategories);
    }
  };

  const handleMoveCategoryDown = (index) => {
    if (index < tempCategories.length - 1) {
      const newCategories = [...tempCategories];
      [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
      setTempCategories(newCategories);
    }
  };

  const handleSaveCategoryOrder = async () => {
    try {
      setIsSaving(true);
      
      // Send batch update with new order for all categories
      const updates = tempCategories.map((cat, index) => ({
        id: cat.id,
        order: index + 1
      }));

      const response = await axios.patch('/api/admin/categories/reorder', { categories: updates });
      
      if (response.data.success) {
        setCategories(tempCategories);
        setIsEditingCategoryOrder(false);
        setTempCategories([]);
        toast.success('Category order saved successfully');
      }
    } catch (error) {
      console.error('Error saving category order:', error);
      toast.error('Failed to save category order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategoryOrder = async (categoryId, newOrder) => {
    try {
      const response = await axios.patch(
        `/api/admin/categories/${categoryId}/order`,
        { newOrder }
      );
      if (response.data.success) {
        setCategories(response.data.categories);
        toast.success('Category order updated');
      }
    } catch (error) {
      console.error('Error updating category order:', error);
      toast.error('Failed to update category order');
    }
  };

  const handleCreateTask = () => {
    if (!selectedCategory) {
      toast.warning('Please select a category first');
      return;
    }
    
    const categoryTasks = tasks.filter(t => t.category === selectedCategory);
    if (categoryTasks.length >= 12) {
      toast.warning('Maximum of 12 tasks per category allowed');
      return;
    }
    
    setEditingTask({
      title: '',
      description: '',
      category: selectedCategory,
      estimatedDuration: '',
      difficulty: 'medium',
      externalLinks: [],
      tips: [],
      requirements: [],
    });
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask({...task});
    setIsModalOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      setIsSaving(true);
      
      if (editingTask._id) {
        // Update existing task
        const response = await axios.patch(
          `/api/admin/tasks/${editingTask.id}`,
          editingTask
        );
        if (response.data.success) {
          toast.success('Task updated successfully');
          fetchTasks();
        }
      } else {
        // Create new task
        const response = await axios.post('/api/admin/tasks', editingTask);
        if (response.data.success) {
          toast.success('Task created successfully');
          fetchTasks();
        }
      }
      
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error.response?.data?.error || 'Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = await confirm({
      title: 'Delete Task',
      message: 'Are you sure you want to delete this task? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;

    try {
      const response = await axios.delete(`/api/admin/tasks/${taskId}`);
      if (response.data.success) {
        toast.success('Task deleted successfully');
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  // Task Order Management
  const handleEditTaskOrder = () => {
    setIsEditingTaskOrder(true);
    const categoryTasks = tasks.filter(t => t.category === selectedCategory);
    setTempTasks([...categoryTasks]);
  };

  const handleCancelTaskOrder = () => {
    setIsEditingTaskOrder(false);
    setTempTasks([]);
  };

  const handleMoveTaskUp = (index) => {
    if (index > 0) {
      const newTasks = [...tempTasks];
      [newTasks[index], newTasks[index - 1]] = [newTasks[index - 1], newTasks[index]];
      setTempTasks(newTasks);
    }
  };

  const handleMoveTaskDown = (index) => {
    if (index < tempTasks.length - 1) {
      const newTasks = [...tempTasks];
      [newTasks[index], newTasks[index + 1]] = [newTasks[index + 1], newTasks[index]];
      setTempTasks(newTasks);
    }
  };

  const handleSaveTaskOrder = async () => {
    try {
      setIsSaving(true);
      
      // Send batch update with new order for all tasks
      const updates = tempTasks.map((task, index) => ({
        id: task.id,
        order: index + 1
      }));

      const response = await axios.patch('/api/admin/tasks/reorder', { 
        tasks: updates,
        category: selectedCategory 
      });
      
      if (response.data.success) {
        await fetchTasks(selectedCategory);
        setIsEditingTaskOrder(false);
        setTempTasks([]);
        toast.success('Task order saved successfully');
      }
    } catch (error) {
      console.error('Error saving task order:', error);
      toast.error('Failed to save task order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTaskOrder = async (taskId, newOrder) => {
    try {
      const response = await axios.patch(
        `/api/admin/tasks/${taskId}/order`,
        { newOrder }
      );
      if (response.data.success) {
        fetchTasks();
        toast.success('Task order updated');
      }
    } catch (error) {
      console.error('Error updating task order:', error);
      toast.error('Failed to update task order');
    }
  };

  const categoryTaskCounts = categories.map(cat => ({
    ...cat,
    taskCount: tasks.filter(t => t.category === cat.id).length
  }));

  const filteredTasks = selectedCategory ? 
    tasks.filter(t => t.category === selectedCategory) : 
    tasks;

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <div className="tabs tabs-boxed">
        <a 
          className={`tab ${activeView === 'categories' ? 'tab-active' : ''}`}
          onClick={() => setActiveView('categories')}
        >
          Categories
        </a>
        <a 
          className={`tab ${activeView === 'tasks' ? 'tab-active' : ''}`}
          onClick={() => setActiveView('tasks')}
        >
          Tasks
        </a>
      </div>

      {/* Categories View */}
      {activeView === 'categories' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">Categories ({categories.length}/6)</h2>
              <div className="flex gap-2">
                {isEditingCategoryOrder ? (
                  <>
                    <button
                      className="btn btn-success btn-sm"
                      onClick={handleSaveCategoryOrder}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Order'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={handleCancelCategoryOrder}
                      disabled={isSaving}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={handleEditCategoryOrder}
                      disabled={categories.length === 0}
                    >
                      Edit Order
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleCreateCategory}
                      disabled={categories.length >= 6}
                    >
                      + Add Category
                    </button>
                  </>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Tasks</th>
                      <th>Color</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isEditingCategoryOrder ? tempCategories : categoryTaskCounts).map((category, index) => (
                      <tr key={category._id}>
                        <td>
                          {isEditingCategoryOrder ? (
                            <div className="flex gap-1">
                              <button
                                className="btn btn-xs btn-ghost"
                                onClick={() => handleMoveCategoryUp(index)}
                                disabled={index === 0}
                              >
                                ↑
                              </button>
                              <span className="px-2">{index + 1}</span>
                              <button
                                className="btn btn-xs btn-ghost"
                                onClick={() => handleMoveCategoryDown(index)}
                                disabled={index === tempCategories.length - 1}
                              >
                                ↓
                              </button>
                            </div>
                          ) : (
                            <span className="px-2">{category.order}</span>
                          )}
                        </td>
                        <td>
                          <div>
                            <div className="font-bold">{category.displayName}</div>
                            <div className="text-xs text-gray-500">{category.id}</div>
                          </div>
                        </td>
                        <td className="max-w-xs truncate">{category.description}</td>
                        <td>
                          <span className="badge badge-info">{category.taskCount}/12</span>
                        </td>
                        <td>
                          <div 
                            className="w-8 h-8 rounded"
                            style={{ backgroundColor: category.color }}
                          ></div>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => handleEditCategory(category)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={category.taskCount > 0}
                            >
                              Delete
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
        </div>
      )}

      {/* Tasks View */}
      {activeView === 'tasks' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-sm">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${!selectedCategory ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => {
                    setSelectedCategory(null);
                    fetchTasks();
                  }}
                >
                  All Tasks
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    className={`btn btn-sm ${
                      selectedCategory === category.id ? 'btn-primary' : 'btn-outline'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      fetchTasks(category.id);
                    }}
                  >
                    {category.displayName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">
                  Tasks
                  {selectedCategory && (
                    <span className="text-sm font-normal">
                      ({filteredTasks.length}/12 in {categories.find(c => c.id === selectedCategory)?.displayName})
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  {isEditingTaskOrder ? (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handleSaveTaskOrder}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Order'}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleCancelTaskOrder}
                        disabled={isSaving}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={handleEditTaskOrder}
                        disabled={!selectedCategory || filteredTasks.length === 0}
                      >
                        Edit Order
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleCreateTask}
                        disabled={!selectedCategory || filteredTasks.length >= 12}
                      >
                        + Add Task
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!selectedCategory ? (
                <div className="alert alert-info">
                  <span>Please select a category to view and manage tasks</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Difficulty</th>
                        <th>Duration</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isEditingTaskOrder ? tempTasks : filteredTasks).map((task, index) => (
                        <tr key={task._id}>
                          <td>
                            {isEditingTaskOrder ? (
                              <div className="flex gap-1">
                                <button
                                  className="btn btn-xs btn-ghost"
                                  onClick={() => handleMoveTaskUp(index)}
                                  disabled={index === 0}
                                >
                                  ↑
                                </button>
                                <span className="px-2">{index + 1}</span>
                                <button
                                  className="btn btn-xs btn-ghost"
                                  onClick={() => handleMoveTaskDown(index)}
                                  disabled={index === tempTasks.length - 1}
                                >
                                  ↓
                                </button>
                              </div>
                            ) : (
                              <span className="px-2">{task.order}</span>
                            )}
                          </td>
                          <td>
                            <div>
                              <div className="font-bold max-w-xs truncate">{task.title}</div>
                              <div className="text-xs text-gray-500">{task.id}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              task.difficulty === 'easy' ? 'badge-success' :
                              task.difficulty === 'medium' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {task.difficulty}
                            </span>
                          </td>
                          <td>{task.estimatedDuration || 'N/A'}</td>
                          <td>
                            <div className="flex gap-2">
                              <button
                                className="btn btn-xs btn-ghost"
                                onClick={() => handleEditTask(task)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-xs btn-error"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                Delete
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
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {isModalOpen && editingCategory && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory._id ? 'Edit Category' : 'Create Category'}
            </h3>
            
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Display Name *</span>
                  <span className="label-text-alt">{editingCategory.displayName?.length || 0}/50</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editingCategory.displayName}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    displayName: e.target.value.slice(0, 50)
                  })}
                  maxLength={50}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={3}
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    description: e.target.value
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Icon</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={editingCategory.icon}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      icon: e.target.value
                    })}
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Color</span>
                  </label>
                  <input
                    type="color"
                    className="input input-bordered h-12"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({
                      ...editingCategory,
                      color: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Estimated Time Frame</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g., 2-3 months before arrival"
                  value={editingCategory.estimatedTimeFrame}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    estimatedTimeFrame: e.target.value
                  })}
                />
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveCategory}
                disabled={isSaving || !editingCategory.displayName}
              >
                {isSaving ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setIsModalOpen(false);
              setEditingCategory(null);
            }}>close</button>
          </form>
        </dialog>
      )}

      {/* Task Edit Modal */}
      {isModalOpen && editingTask && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {editingTask._id ? 'Edit Task' : 'Create Task'}
            </h3>
            
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title *</span>
                  <span className="label-text-alt">{editingTask.title?.length || 0}/50</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    title: e.target.value.slice(0, 50)
                  })}
                  maxLength={50}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description (Rich Text) *</span>
                  <span className="label-text-alt">{editingTask.description?.length || 0}/800</span>
                </label>
                <RichTextEditor
                  content={editingTask.description}
                  onChange={(html) => {
                    // Limit description to 800 characters
                    const limitedHtml = html.slice(0, 800);
                    setEditingTask({
                      ...editingTask,
                      description: limitedHtml
                    });
                  }}
                  placeholder="Write task description here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Category *</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      category: e.target.value
                    })}
                  >
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.id}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Difficulty</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={editingTask.difficulty}
                    onChange={(e) => setEditingTask({
                      ...editingTask,
                      difficulty: e.target.value
                    })}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Estimated Duration</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="e.g., 2-3 days, 1 week"
                  value={editingTask.estimatedDuration}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    estimatedDuration: e.target.value
                  })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tips (one per line)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={3}
                  placeholder="Enter tips, one per line"
                  value={editingTask.tips?.join('\n') || ''}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    tips: e.target.value.split('\n').filter(t => t.trim())
                  })}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Requirements (one per line)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  rows={3}
                  placeholder="Enter requirements, one per line"
                  value={editingTask.requirements?.join('\n') || ''}
                  onChange={(e) => setEditingTask({
                    ...editingTask,
                    requirements: e.target.value.split('\n').filter(r => r.trim())
                  })}
                />
              </div>
            </div>

            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveTask}
                disabled={isSaving || !editingTask.title || !editingTask.description}
              >
                {isSaving ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => {
              setIsModalOpen(false);
              setEditingTask(null);
            }}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default AdminContentTab;
