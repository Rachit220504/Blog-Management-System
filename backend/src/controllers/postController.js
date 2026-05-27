const Post = require('../models/Post');
const User = require('../models/User');
const ApiResponse = require('../helpers/apiResponse');
const {
  buildBlogPayload,
  getPublishedPostsQuery,
  getUniqueValues,
  ensureSlugAvailable,
} = require('../services/blogService');

// ==========================================
// PUBLIC ENDPOINTS (For Next.js Frontend)
// ==========================================

// @desc    Get all published posts (paginated, filterable)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    const query = getPublishedPostsQuery({
      search: req.query.search || req.query.q,
      tag: req.query.tag,
      category: req.query.category,
    });

    // Execute query
    const posts = await Post.find(query)
      .populate('author', 'name avatar bio')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get published post by slug
// @route   GET /api/posts/slug/:slug
// @access  Public
const getPostBySlug = async (req, res, next) => {
  try {
    // Use an atomic increment to avoid race conditions under high concurrency
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name avatar bio');

    if (!post) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search published posts
// @route   GET /api/posts/search
// @access  Public
const searchPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const searchTerm = req.query.q || req.query.search || '';

    const query = getPublishedPostsQuery({
      search: searchTerm,
      tag: req.query.tag,
      category: req.query.category,
    });

    const posts = await Post.find(query)
      .populate('author', 'name avatar bio')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      query: searchTerm,
      count: posts.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get published posts by category
// @route   GET /api/posts/categories/:category
// @access  Public
const getPostsByCategory = async (req, res, next) => {
  try {
    req.query.category = req.params.category;
    return getPosts(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Get published posts by tag
// @route   GET /api/posts/tags/:tag
// @access  Public
const getPostsByTag = async (req, res, next) => {
  try {
    req.query.tag = req.params.tag;
    return getPosts(req, res, next);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories
// @route   GET /api/posts/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await getUniqueValues('categories', { status: 'published' });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tags
// @route   GET /api/posts/tags
// @access  Public
const getTags = async (req, res, next) => {
  try {
    const tags = await getUniqueValues('tags', { status: 'published' });

    return res.status(200).json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN ENDPOINTS (For React Admin Panel)
// ==========================================

// @desc    Get all posts (Admin view: drafts + published)
// @route   GET /api/posts/admin
// @access  Private (Super Admin, Editor, Author)
const getAllPostsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Authors can only see their own posts
    if (req.user.role === 'author') {
      query.author = req.user.id;
    }

    if (req.query.category) {
      query.categories = req.query.category;
    }

    if (req.query.tag) {
      query.tags = req.query.tag;
    }

    // Search query
    if (req.query.search || req.query.q) {
      const searchTerm = req.query.search || req.query.q;
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    // Status query
    if (req.query.status) {
      query.status = req.query.status;
    }

    const posts = await Post.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get post by ID (Admin)
// @route   GET /api/posts/admin/:id
// @access  Private (Super Admin, Editor, Author)
const getPostByIdAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'name email'
    );

    if (!post) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    // Authors can only access their own posts
    if (req.user.role === 'author' && post.author._id.toString() !== req.user.id) {
      return ApiResponse.error(res, 'You are not authorized to view this post', 403);
    }

    return res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a post preview (draft or published)
// @route   GET /api/posts/admin/preview/:id
// @access  Private
const getPostPreviewAdmin = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email role avatar bio');

    if (!post) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    if (req.user.role === 'author' && post.author._id.toString() !== req.user.id) {
      return ApiResponse.error(res, 'You are not authorized to preview this post', 403);
    }

    return res.status(200).json({
      success: true,
      data: post,
      preview: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/posts/admin
// @access  Private (Super Admin, Editor, Author)
const createPost = async (req, res, next) => {
  try {
    // Inject the current logged-in user as the author
    req.body.author = req.user.id;
    const payload = buildBlogPayload(req.body, req.user.id);

    if (payload.slug) {
      const available = await ensureSlugAvailable(payload.slug);
      if (!available) {
        return ApiResponse.error(res, 'Slug already exists, please choose another one', 400);
      }
    }

    const post = await Post.create(payload);

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/posts/admin/:id
// @access  Private (Super Admin, Editor, Author)
const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    // Role authorization check: Authors can only edit their own posts
    if (req.user.role === 'author' && post.author.toString() !== req.user.id) {
      return ApiResponse.error(res, 'You are not authorized to edit this post', 403);
    }

    // Prevent changing the author
    delete req.body.author;

    const payload = buildBlogPayload(req.body, post.author, post.toObject());

    if (payload.slug && payload.slug !== post.slug) {
      const available = await ensureSlugAvailable(payload.slug, post._id);
      if (!available) {
        return ApiResponse.error(res, 'Slug already exists, please choose another one', 400);
      }
    }

    // Update post fields
    // Using save() instead of findByIdAndUpdate so that pre-save hooks (slugify, readTime) are run
    Object.assign(post, payload);
    post = await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish a post
// @route   PATCH /api/posts/admin/:id/publish
// @access  Private (Super Admin, Editor, Author)
const publishPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    if (req.user.role === 'author' && post.author.toString() !== req.user.id) {
      return ApiResponse.error(res, 'You are not authorized to publish this post', 403);
    }

    post.status = 'published';
    post.publishedAt = post.publishedAt || new Date();
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post published successfully',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Move a post to draft
// @route   PATCH /api/posts/admin/:id/draft
// @access  Private (Super Admin, Editor, Author)
const draftPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    if (req.user.role === 'author' && post.author.toString() !== req.user.id) {
      return ApiResponse.error(res, 'You are not authorized to change this post', 403);
    }

    post.status = 'draft';
    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Post moved to draft',
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/admin/:id
// @access  Private (Super Admin, Editor, Author)
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return ApiResponse.error(res, 'Blog post not found', 404);
    }

    // Role authorization check: Authors can only delete their own posts
    if (req.user.role === 'author' && post.author.toString() !== req.user.id) {
      return ApiResponse.error(res, 'You are not authorized to delete this post', 403);
    }

    await post.deleteOne();

    return ApiResponse.success(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostBySlug,
  searchPosts,
  getPostsByCategory,
  getPostsByTag,
  getCategories,
  getTags,
  getAllPostsAdmin,
  getPostByIdAdmin,
  getPostPreviewAdmin,
  createPost,
  updatePost,
  publishPost,
  draftPost,
  deletePost,
};
