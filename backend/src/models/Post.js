const mongoose = require('mongoose');
const {
  generateUniqueSlug,
  extractTableOfContents,
  calculateReadTime,
} = require('../utils/helpers');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'FAQ question is required'],
    trim: true,
  },
  answer: {
    type: String,
    required: [true, 'FAQ answer is required'],
    trim: true,
  },
});

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [300, 'Summary cannot exceed 300 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'Meta title should not exceed 70 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description should not exceed 160 characters'],
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    featureImage: {
      type: String,
      default: '',
    },
    featuredImage: {
      type: String,
      default: '',
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'OG title should not exceed 70 characters'],
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'OG description should not exceed 160 characters'],
    },
    ogImage: {
      type: String,
      default: '',
    },
    twitterTitle: {
      type: String,
      trim: true,
      maxlength: [70, 'Twitter title should not exceed 70 characters'],
    },
    twitterDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Twitter description should not exceed 160 characters'],
    },
    twitterImage: {
      type: String,
      default: '',
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    faq: [faqSchema],
    internalLinks: [
      {
        label: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
      },
    ],
    externalLinks: [
      {
        label: {
          type: String,
          trim: true,
        },
        url: {
          type: String,
          trim: true,
        },
      },
    ],
    tableOfContents: [
      {
        id: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
        },
        level: {
          type: Number,
          min: 2,
          max: 4,
        },
      },
    ],
    readTime: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search performance and quick lookup
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text', categories: 'text' });

// Pre-save validation and hooks
postSchema.pre('save', async function (next) {
  try {
    if (!this.slug || this.isModified('title') || this.isModified('slug')) {
      const source = this.isModified('title') ? this.title : this.slug || this.title;
      this.slug = await generateUniqueSlug(this.constructor, source, this._id);
    }

    if (!this.summary && this.excerpt) {
      this.summary = this.excerpt;
    }

    if (!this.excerpt && this.summary) {
      this.excerpt = this.summary;
    }

    if (this.featuredImage && !this.featureImage) {
      this.featureImage = this.featuredImage;
    }

    if (this.featureImage && !this.featuredImage) {
      this.featuredImage = this.featureImage;
    }

    if (!this.ogTitle) {
      this.ogTitle = this.metaTitle || this.title;
    }

    if (!this.ogDescription) {
      this.ogDescription = this.metaDescription || this.excerpt;
    }

    if (!this.ogImage) {
      this.ogImage = this.featureImage || this.featuredImage || '';
    }

    if (!this.twitterTitle) {
      this.twitterTitle = this.ogTitle;
    }

    if (!this.twitterDescription) {
      this.twitterDescription = this.ogDescription;
    }

    if (!this.twitterImage) {
      this.twitterImage = this.ogImage;
    }

    if (this.isModified('content')) {
      this.readTime = calculateReadTime(this.content);
      this.tableOfContents = extractTableOfContents(this.content);
    }

    if (this.status === 'published' && !this.publishedAt) {
      this.publishedAt = new Date();
    }

    if (!this.canonicalUrl && process.env.FRONTEND_URL && this.slug) {
      this.canonicalUrl = `${process.env.FRONTEND_URL.replace(/\/$/, '')}/blog/${this.slug}`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
