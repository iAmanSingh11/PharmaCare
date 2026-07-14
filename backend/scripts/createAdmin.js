/*
 * One-time bootstrap script to create first admin account, since
 * admin signup is not exposed as a public API endpoint (i did it intentionally).
 * How to use
 * node scripts/createAdmin.js "Admin Name" admin@pharmacare.com "Pswd123"
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const [, , name, email, password] = process.argv;

if (!name || !email || !password) {
  console.error('Usage: node scripts/createAdmin.js "Admin Name" admin@email.com "Password123"');
  process.exit(1);
}

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const existing = await User.findOne({ email });
  if (existing) {
    console.error(`A user with email ${email} already exists.`);
    process.exit(1);
  }

  await User.create({
    name,
    email,
    password,
    phone: '0000000000',
    role: 'admin',
    isEmailVerified: true,
  });

  console.log(`✅ Admin account created for ${email}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
