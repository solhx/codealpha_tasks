import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model.js';

// Debug: Log environment variables (remove in production)
console.log('🔧 Passport Config Loading...');
console.log('   GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Missing');
console.log('   GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✓ Set' : '✗ Missing');

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `http://localhost:${process.env.PORT || 4000}/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google OAuth callback received for:', profile.emails?.[0]?.value);
          
          // Check if user exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            user.lastLogin = new Date();
            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }

          // Check if user exists with same email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
              // Link Google account to existing user
              user.googleId = profile.id;
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              user.isEmailVerified = true;
              user.lastLogin = new Date();
              await user.save({ validateBeforeSave: false });
              return done(null, user);
            }
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || profile.name?.givenName || 'Google User',
            email: email?.toLowerCase() || `${profile.id}@google.local`,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            authProvider: 'google',
            isEmailVerified: true,
            isActive: true,
          });

          console.log('New user created via Google OAuth:', user.email);
          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
  console.log('✅ Google OAuth Strategy registered');
} else {
  console.warn('⚠️ Google OAuth not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
}

// GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || `http://localhost:${process.env.PORT || 4000}/api/auth/github/callback`,
        scope: ['user:email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('GitHub OAuth callback received for:', profile.username);
          
          // Get email from GitHub
          const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;

          // Check if user exists with this GitHub ID
          let user = await User.findOne({ githubId: profile.id.toString() });

          if (user) {
            user.lastLogin = new Date();
            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }

          // Check if user exists with same email
          if (profile.emails?.[0]?.value) {
            user = await User.findOne({ email: email.toLowerCase() });

            if (user) {
              // Link GitHub account to existing user
              user.githubId = profile.id.toString();
              if (!user.avatar && profile.photos?.[0]?.value) {
                user.avatar = profile.photos[0].value;
              }
              user.isEmailVerified = true;
              user.lastLogin = new Date();
              await user.save({ validateBeforeSave: false });
              return done(null, user);
            }
          }

          // Create new user
          user = await User.create({
            name: profile.displayName || profile.username || 'GitHub User',
            email: email.toLowerCase(),
            githubId: profile.id.toString(),
            avatar: profile.photos?.[0]?.value || '',
            authProvider: 'github',
            isEmailVerified: !!profile.emails?.[0]?.value,
            isActive: true,
          });

          console.log('New user created via GitHub OAuth:', user.email);
          return done(null, user);
        } catch (error) {
          console.error('GitHub OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );
  console.log('✅ GitHub OAuth Strategy registered');
} else {
  console.warn('⚠️ GitHub OAuth not configured. Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
}

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;