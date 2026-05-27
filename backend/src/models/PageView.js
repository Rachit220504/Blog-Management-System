const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      index: true,
    },
    postSlug: {
      type: String,
      trim: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    path: {
      type: String,
      trim: true,
      index: true,
    },
    referrer: {
      type: String,
      trim: true,
      default: '',
    },
    userAgent: {
      type: String,
      trim: true,
      default: '',
    },
    ipHash: {
      type: String,
      trim: true,
      index: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

pageViewSchema.index({ createdAt: -1 });

const PageView = mongoose.model('PageView', pageViewSchema);

module.exports = PageView;