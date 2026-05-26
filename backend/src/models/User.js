const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ['super_admin', 'editor', 'author', 'user'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [200, 'Bio cannot be more than 200 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  if (this.status !== undefined) {
    this.isActive = this.status === 'active';
  }

  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('validate', function (next) {
  if (this.isActive === false && this.status === 'active') {
    this.status = 'inactive';
  }

  if (this.isActive === true && this.status !== 'active') {
    this.status = 'active';
  }

  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.bumpRefreshTokenVersion = async function () {
  this.refreshTokenVersion = (this.refreshTokenVersion || 0) + 1;
  await this.save();
  return this.refreshTokenVersion;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
