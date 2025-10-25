/**
 * Task Model
 * 
 * Core content unit representing a relocation task
 * Tasks are displayed to users as checklist items in their dashboard
 * 
 * Schema Fields:
 * @property {ObjectId} _id - MongoDB auto-generated unique identifier
 * @property {string} title - Task name (max 50 chars) shown as heading
 * @property {string} description - Detailed task instructions (max 800 chars)
 * @property {ObjectId} category - Reference to Category document
 * @property {number} order - Display order within category (managed by admin)
 * @property {boolean} isRequired - Whether task is mandatory (default: true)
 * @property {string} estimatedDuration - Human-readable time estimate (e.g. "2-3 days")
 * @property {string} difficulty - Complexity level: easy | medium | hard
 * @property {Array} externalLinks - Helpful resources [{ title, url, description }]
 * @property {Array<string>} tips - Pro tips for completing the task
 * @property {Array<string>} requirements - Prerequisites or documents needed
 * @property {boolean} isActive - Soft delete flag (hidden tasks)
 * 
 * Indexes:
 * - (category, order): Fast sorted retrieval for dashboard display
 * - (isActive): Filter hidden tasks efficiently
 * 
 * Business Rules:
 * - Max 12 tasks per category
 * - Cannot delete last task in category
 */
const { Schema, model, models } = require("mongoose");

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    estimatedDuration: {
      type: String,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    externalLinks: [{
      title: String,
      url: String,
      description: String,
    }],
    helpfulLinks: [{
      title: {
        type: String,
        required: true,
        maxlength: 100,
      },
      url: {
        type: String,
        required: true,
        maxlength: 500,
      },
      description: {
        type: String,
        maxlength: 200,
      },
    }],
    tips: [String],
    requirements: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true,
    id: false, // Disable virtual id getter  
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
  }
);

taskSchema.index({ category: 1, order: 1 });
taskSchema.index({ isActive: 1 });

const Task = models.Task || model("Task", taskSchema);
module.exports = Task;