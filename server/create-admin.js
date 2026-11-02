// Creates (or promotes) ONLY an admin user. Does NOT delete or touch any other data.
// Place in:  server/create-admin.js
// Run from the server folder:
//   node create-admin.js "Your Name" you@example.com "StrongPassword123!"

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

(async () => {
  const [name, emailRaw, password] = process.argv.slice(2);
  if (!name || !emailRaw || !password) {
    console.error('Usage: node create-admin.js "Name" email password');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }
  const email = emailRaw.toLowerCase().trim();

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/toflymedia');

  let user = await User.findOne({ email });
  if (user) {
    user.role = 'admin';
    user.isActive = true;
    user.password = password;          // pre-save hook hashes it
    await user.save();
    console.log(`✅ Existing user ${email} promoted to admin and password reset`);
  } else {
    await User.create({ name, email, password, role: 'admin', isActive: true });
    console.log(`✅ Admin created: ${email}`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error('❌', e.message); process.exit(1); });