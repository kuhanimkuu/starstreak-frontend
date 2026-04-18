# Admin Access Guide

## How to Access the Admin Panel

### 1. Navigate to Admin Login
- **URL**: http://localhost:5176/admin/login
- **Or**: Scroll to the footer and click the small "Admin" link at the bottom left

### 2. Login Credentials
You need Firebase Authentication credentials to log in. Here's how to create an admin user:

#### Option A: Create Admin via Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Users**
4. Click **Add User**
5. Enter:
   - Email: `admin@starstreak.com` (or your preferred email)
   - Password: Create a strong password
6. After creating the user, go to **Firestore Database**
7. Create a collection called `users`
8. Add a document with the user's UID:
   ```
   Document ID: [User UID from Authentication]
   Fields:
   - uid: [User UID]
   - email: admin@starstreak.com
   - displayName: Admin
   - role: super_admin
   - active: true
   - createdAt: [current timestamp]
   ```

#### Option B: Use the Browser Console (Development Only)
After setting up Firebase Authentication:
```javascript
// Import Firebase functions in your browser console
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

// Create admin user
const email = 'admin@starstreak.com';
const password = 'YourSecurePassword123!';

createUserWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      displayName: 'Admin',
      role: 'super_admin',
      active: true,
      createdAt: new Date().toISOString()
    });
    console.log('Admin user created successfully!');
  });
```

### 3. User Roles
The system supports two roles:
- **super_admin**: Full access to all admin features (manage products, team, blogs, careers)
- **team_member**: Limited access (can manage blogs and careers only)

### 4. Admin Dashboard Features
Once logged in at `/admin/dashboard`, you can:
- ✅ Manage blog posts (create, edit, delete, publish)
- ✅ Manage job postings (careers section)
- ✅ Manage team members (super_admin only)
- ✅ Manage product portfolio (super_admin only)
- ✅ View statistics and quick actions

### 5. Firebase Configuration
Make sure your Firebase config is properly set in:
- File: `src/lib/firebase/config.js`

It should contain your Firebase project credentials:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 6. Security Notes
- ⚠️ **Never commit Firebase credentials to Git**
- ⚠️ Only create admin accounts for trusted team members
- ⚠️ Use strong passwords for all admin accounts
- ⚠️ The admin panel is protected by Firebase Authentication
- ⚠️ All admin routes require authentication

### 7. Accessing Admin Features by Role

#### Super Admin Can:
- Create/edit/delete blog posts
- Create/edit/delete job postings
- Add/edit/delete team members
- Add/edit/delete products
- Access all dashboard sections

#### Team Member Can:
- Create/edit/delete blog posts
- Create/edit/delete job postings
- View (but not edit) team members and products

---

## Quick Access Links
- **Admin Login**: http://localhost:5176/admin/login
- **Dashboard**: http://localhost:5176/admin/dashboard (requires login)
- **Blog Management**: http://localhost:5176/admin/dashboard/blogs
- **Careers Management**: http://localhost:5176/admin/dashboard/careers
- **Team Management**: http://localhost:5176/admin/dashboard/team (super_admin only)
- **Products Management**: http://localhost:5176/admin/dashboard/products (super_admin only)

---

## Troubleshooting

### Can't log in?
1. Check Firebase Authentication is enabled in your Firebase Console
2. Verify the user exists in Firebase Authentication
3. Verify the user has a document in Firestore `users` collection with `role` field
4. Check browser console for errors

### Don't have access to certain features?
1. Check your user role in Firestore
2. Super admin features require `role: super_admin`
3. Team member features require `role: team_member` or `role: super_admin`

### Forgot password?
Use Firebase Console to reset the user's password or use Firebase's password reset functionality.
