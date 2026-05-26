const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const ApiResponse = require('../helpers/apiResponse');

// @desc    Get dashboard metrics & analytics
// @route   GET /api/dashboard/stats
// @access  Private (Super Admin, Editor, Author)
const getDashboardStats = async (req, res, next) => {
  try {
    const isAuthor = req.user.role === 'author';
    const authorId = req.user.id;

    // Build matching query for post stats
    const postQuery = isAuthor ? { author: authorId } : {};

    // 1. Post stats (Total, Published, Drafts)
    const totalPosts = await Post.countDocuments(postQuery);
    const publishedPosts = await Post.countDocuments({ ...postQuery, status: 'published' });
    const draftPosts = await Post.countDocuments({ ...postQuery, status: 'draft' });

    // 2. Sum of views
    const viewStats = await Post.aggregate([
      {
        $match: isAuthor
          ? { author: new mongoose.Types.ObjectId(authorId) }
          : {},
      },
      { $group: { _id: null, totalViews: { $sum: '$views' } } },
    ]);
    const totalViews = viewStats.length > 0 ? viewStats[0].totalViews : 0;

    // 3. Recent posts (limit 5)
    const recentPosts = await Post.find(postQuery)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        drafts: draftPosts,
      },
      views: totalViews,
      recentPosts,
    };

    // 4. Global User Stats (Super Admin & Editor only)
    if (req.user.role === 'super_admin' || req.user.role === 'editor') {
      const totalUsers = await User.countDocuments({});
      const activeUsers = await User.countDocuments({ isActive: true });

      const roleBreakdown = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]);

      const roles = {
        super_admin: 0,
        editor: 0,
        author: 0,
        user: 0,
      };

      roleBreakdown.forEach((item) => {
        if (roles[item._id] !== undefined) {
          roles[item._id] = item.count;
        }
      });

      stats.users = {
        total: totalUsers,
        active: activeUsers,
        breakdown: roles,
      };
    }

    return ApiResponse.success(res, stats, 'Dashboard stats loaded');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
