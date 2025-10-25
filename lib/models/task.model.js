/**
 * Task Model
 * 
 * Core content unit representing a relocation task
 * Tasks are displayed to users as checklist items in their dashboard
 * 
 * Schema Fields:
 * @property {string} id - Unique kebab-case identifier (auto-generated from title)
 * @property {string} title - Task name (max 50 chars) shown as heading
 * @property {string} description - Detailed task instructions (max 800 chars)
 * @property {string} category - Journey phase: beforeArrival | uponArrival | firstWeeks | ongoing
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
 * - ID auto-regenerates when title changes
 * - Cannot delete last task in category
 */
const { Schema, model, models } = require("mongoose");

const taskSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 50,
    },
    description: {
      type: String,
      required: true,
      maxlength: 800,
    },
    category: {
      type: String,
      required: true,
      enum: ["beforeArrival", "uponArrival", "firstWeeks", "ongoing"],
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
      enum: [
        '15-30 minutes',
        '30-60 minutes',
        '1-2 hours',
        '2-4 hours',
        'Half day',
        'Full day',
        '2-3 days',
        '1 week',
        '2-4 weeks',
        '1-2 months'
      ],
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
  { timestamps: true }
);

taskSchema.index({ category: 1, order: 1 });
taskSchema.index({ isActive: 1 });

const Task = models.Task || model("Task", taskSchema);
module.exports = Task;