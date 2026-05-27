require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) continue;

    const key = arg.replace(/^--/, '');
    const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
    parsed[key] = value;

    if (value !== 'true') i += 1;
  }

  return parsed;
};

const run = async () => {
  const args = parseArgs();
  const name = args.name || process.env.ADMIN_NAME;
  const email = (args.email || process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = args.password || process.env.ADMIN_PASSWORD;

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is required in environment.');
    process.exit(1);
  }

  if (!name || !email || !password) {
    console.error('Missing required values. Provide name, email, and password.');
    console.error('Example: npm run create:admin -- --name "Site Admin" --email admin@example.com --password "StrongPass123!"');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const existing = await User.findOne({ email }).select('+password');

    if (existing) {
      existing.name = name;
      existing.password = password;
      existing.role = 'super_admin';
      existing.status = 'active';
      existing.isActive = true;
      await existing.save();

      console.log('Updated existing user as super_admin:', email);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'super_admin',
        status: 'active',
        isActive: true,
      });

      console.log('Created super_admin user:', email);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    process.exit(1);
  }
};

run();
