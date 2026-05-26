const express = require('express');
const {
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
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, requirePermission } = require('../middleware/roleMiddleware');
const asyncHandler = require('../helpers/asyncHandler');
const {
  validateMongoIdParam,
  validatePostPayload,
  validateBlogQuery,
  validateSearchQuery,
  validateTaxonomyQuery,
} = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes for front-end website
router.get('/', validateBlogQuery, asyncHandler(getPosts));
router.get('/search', validateBlogQuery, validateSearchQuery, asyncHandler(searchPosts));
router.get('/categories', asyncHandler(getCategories));
router.get('/categories/:category', validateTaxonomyQuery, asyncHandler(getPostsByCategory));
router.get('/tags', asyncHandler(getTags));
router.get('/tags/:tag', validateTaxonomyQuery, asyncHandler(getPostsByTag));
router.get('/slug/:slug', asyncHandler(getPostBySlug));

// Protected routes for admin portal (Super Admin, Editor, Author)
router.use('/admin', protect, authorize('super_admin', 'editor', 'author'));

router
  .route('/admin')
  .get(requirePermission('posts:read'), asyncHandler(getAllPostsAdmin))
  .post(requirePermission('posts:create'), validatePostPayload, asyncHandler(createPost));

router.get('/admin/preview/:id', validateMongoIdParam('id'), requirePermission('posts:read'), asyncHandler(getPostPreviewAdmin));

router
  .route('/admin/:id')
  .all(validateMongoIdParam('id'))
  .get(requirePermission('posts:read'), asyncHandler(getPostByIdAdmin))
  .put(requirePermission('posts:update'), validatePostPayload, asyncHandler(updatePost))
  .delete(requirePermission('posts:delete'), asyncHandler(deletePost));

router.patch('/admin/:id/publish', validateMongoIdParam('id'), requirePermission('posts:update'), asyncHandler(publishPost));
router.patch('/admin/:id/draft', validateMongoIdParam('id'), requirePermission('posts:update'), asyncHandler(draftPost));

module.exports = router;
