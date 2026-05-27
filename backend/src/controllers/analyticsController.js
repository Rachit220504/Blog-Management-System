const crypto = require('crypto');
const Post = require('../models/Post');
const PageView = require('../models/PageView');
const ApiResponse = require('../helpers/apiResponse');

const buildIpHash = (value = '') => crypto.createHash('sha256').update(String(value)).digest('hex');

const recordPageView = async (req, res, next) => {
  try {
    const { slug, path: pagePath = '', referrer = '' } = req.body || {};

    if (!slug) {
      return ApiResponse.error(res, 'Post slug is required', 400);
    }

    const post = await Post.findOne({ slug, status: 'published' }).select('_id slug author');

    if (!post) {
      return ApiResponse.error(res, 'Post not found', 404);
    }

    const pageView = await PageView.create({
      post: post._id,
      postSlug: post.slug,
      author: post.author,
      path: pagePath || `/blog/${post.slug}`,
      referrer: referrer || req.get('referer') || '',
      userAgent: req.get('user-agent') || '',
      ipHash: buildIpHash(req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''),
    });

    return ApiResponse.success(res, { recorded: true, id: pageView._id }, 'Page view recorded');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPageView,
};