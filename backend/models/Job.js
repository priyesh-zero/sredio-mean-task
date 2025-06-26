const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "sync-organizations",
        "sync-repositories",
        "sync-commits",
        "sync-issues",
        "sync-pulls",
        "sync-members",
        "sync-changelog",
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repository",
    },
    priority: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "retry"],
      default: "pending",
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
    },
    error: {
      message: String,
      stack: String,
      code: String,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    maxAttempts: {
      type: Number,
      default: 3,
    },
    delay: {
      type: Number,
      default: 0,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: Date,
    completedAt: Date,
    nextRetryAt: Date,
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
jobSchema.index({ status: 1, priority: -1, scheduledAt: 1 });
jobSchema.index({ userId: 1, type: 1 });
jobSchema.index({ nextRetryAt: 1 });

module.exports = mongoose.model("Job", jobSchema);
