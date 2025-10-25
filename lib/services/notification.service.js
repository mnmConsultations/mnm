/**
 * Notification Service
 * 
 * Centralized service for managing user notifications
 * Prevents duplicate notifications and intelligently merges multiple edits
 * 
 * Features:
 * - Smart notification creation (avoids duplicates)
 * - Batch notifications for multiple edits
 * - TTL-based expiry (7 days)
 * - Entity tracking (tasks, categories)
 */

import Notification from '../models/notification.model';
import User from '../models/user.model';

/**
 * Create or update notification for entity change
 * 
 * Strategy:
 * - If recent notification exists for same entity+action (within 5 minutes), update it
 * - Otherwise, create new notification
 * - This prevents spam when admin makes multiple quick edits
 * 
 * @param {Object} params - Notification parameters
 * @param {string} params.entityType - 'task' or 'category'
 * @param {string} params.entityId - ID of the task/category
 * @param {string} params.action - 'created', 'updated', 'deleted'
 * @param {string} params.entityName - Display name of the entity
 * @param {Array<string>} params.changes - List of what changed (e.g., ['title', 'description'])
 * @returns {Promise<void>}
 */
export async function notifyEntityChange({ entityType, entityId, action, entityName, changes = [] }) {
  try {
    // Get all users (except admins)
    const users = await User.find({ role: 'user' });
    
    if (users.length === 0) {
      return;
    }

    // Time window for merging notifications (5 minutes)
    const mergeWindow = new Date(Date.now() - 5 * 60 * 1000);

    for (const user of users) {
      // Check for recent notification about this entity
      const recentNotification = await Notification.findOne({
        userId: user._id,
        'metadata.entityType': entityType,
        'metadata.entityId': entityId,
        'metadata.action': action,
        createdAt: { $gte: mergeWindow },
      }).sort({ createdAt: -1 });

      if (recentNotification) {
        // Update existing notification - merge changes
        const existingChanges = recentNotification.metadata?.changes || [];
        const mergedChanges = [...new Set([...existingChanges, ...changes])];
        
        let message = generateMessage(entityType, action, entityName, mergedChanges);
        
        await Notification.findByIdAndUpdate(recentNotification._id, {
          message,
          'metadata.changes': mergedChanges,
          updatedAt: new Date(),
        });
      } else {
        // Create new notification
        const { title, message, type } = generateNotificationContent(
          entityType,
          action,
          entityName,
          changes
        );

        await Notification.create({
          userId: user._id,
          title,
          message,
          type,
          priority: action === 'deleted' ? 'high' : 'medium',
          metadata: {
            entityType,
            entityId,
            action,
            changes,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error creating entity change notification:', error);
    // Don't throw - notifications shouldn't break main flow
  }
}

/**
 * Generate notification content based on entity type and action
 */
function generateNotificationContent(entityType, action, entityName, changes) {
  const entityLabel = entityType === 'task' ? 'Task' : 'Category';
  
  let title, message, type;

  switch (action) {
    case 'created':
      title = `New ${entityLabel} Added`;
      message = `A new ${entityType} "${entityName}" has been added to your dashboard.`;
      type = 'success';
      break;
      
    case 'updated':
      title = `${entityLabel} Updated`;
      message = generateMessage(entityType, action, entityName, changes);
      type = 'update';
      break;
      
    case 'deleted':
      title = `${entityLabel} Removed`;
      message = `The ${entityType} "${entityName}" has been removed from your dashboard.`;
      type = 'warning';
      break;
      
    default:
      title = `${entityLabel} Changed`;
      message = `The ${entityType} "${entityName}" has been modified.`;
      type = 'info';
  }

  return { title, message, type };
}

/**
 * Generate detailed message based on changes
 */
function generateMessage(entityType, action, entityName, changes) {
  if (action === 'updated' && changes.length > 0) {
    const changesText = changes.length > 3 
      ? `${changes.slice(0, 3).join(', ')} and more`
      : changes.join(', ');
    return `The ${entityType} "${entityName}" has been updated. Changes: ${changesText}.`;
  }
  
  return `The ${entityType} "${entityName}" has been ${action}.`;
}

/**
 * Notify about category move (when tasks are reassigned)
 */
export async function notifyCategoryMove({ taskName, oldCategoryName, newCategoryName }) {
  try {
    const users = await User.find({ role: 'user' });
    
    for (const user of users) {
      await Notification.create({
        userId: user._id,
        title: 'Task Moved',
        message: `The task "${taskName}" has been moved from "${oldCategoryName}" to "${newCategoryName}".`,
        type: 'info',
        priority: 'low',
      });
    }
  } catch (error) {
    console.error('Error creating category move notification:', error);
  }
}

/**
 * Clean up old notifications (optional - TTL handles this automatically)
 * Can be used for manual cleanup if needed
 */
export async function cleanupExpiredNotifications() {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await Notification.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    });
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up notifications:', error);
    return 0;
  }
}
