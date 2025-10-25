# Security Fixes - Deployment Checklist

## 🚀 Pre-Deployment

### 1. Environment Variables
```bash
# .env or .env.local
# ⚠️ CRITICAL: Must be set before deployment

JWT_SECRET=your-super-secure-random-string-minimum-32-characters
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
RESEND_API_KEY=your-resend-api-key
```

**Generate JWT_SECRET:**
```bash
# Linux/Mac:
openssl rand -base64 48

# Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 2. Install Dependencies (Optional but Recommended)
```bash
npm install validator
# or
yarn add validator
```

### 3. Test Locally
```bash
npm run dev
# Test all endpoints from SECURITY_QUICK_GUIDE.md
```

---

## 📝 Deployment Steps

### Step 1: Code Review
- [ ] Review all modified files
- [ ] Ensure no secrets in code
- [ ] Check imports are correct
- [ ] Verify no syntax errors

### Step 2: Environment Setup
- [ ] Set `JWT_SECRET` in production environment
- [ ] Set `NEXT_PUBLIC_APP_URL` in production environment
- [ ] Verify all required env vars are set
- [ ] Ensure JWT_SECRET is different from development

### Step 3: Build & Test
```bash
npm run build
# Check for build errors

npm start
# Test production build locally
```

### Step 4: Deploy
```bash
# If using Git
git add .
git commit -m "Security fixes: rate limiting, input sanitization, password hardening"
git push origin main

# Vercel/Netlify will auto-deploy
# Or use your deployment method
```

### Step 5: Post-Deployment Verification
- [ ] Check application loads correctly
- [ ] Test signup with weak password (should fail)
- [ ] Test signup with strong password (should succeed)
- [ ] Test login rate limiting (5 attempts)
- [ ] Test contact form rate limiting
- [ ] Verify security headers in browser DevTools
- [ ] Check error messages don't leak info

---

## 🔍 Testing Commands

### Test Rate Limiting
```bash
# Replace with your production URL
PROD_URL="https://your-domain.com"

# Test signin rate limit (should block after 5 attempts)
for i in {1..6}; do
  echo "Attempt $i"
  curl -X POST $PROD_URL/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n\n"
done
```

### Test Password Requirements
```bash
# Should FAIL - too weak
curl -X POST $PROD_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"newuser@example.com","password":"simple"}' \
  -w "\nStatus: %{http_code}\n"

# Should SUCCEED
curl -X POST $PROD_URL/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","email":"newuser2@example.com","password":"Complex@Pass123"}' \
  -w "\nStatus: %{http_code}\n"
```

### Test Security Headers
```bash
curl -I $PROD_URL | grep -E "(X-Frame|X-Content|Content-Security|Strict-Transport)"
```

---

## ⚠️ Breaking Changes

### For End Users:
1. **Password Requirements Changed**
   - Old users keep existing passwords
   - New signups must meet strict requirements
   - Password reset will require new strong password

2. **Rate Limiting Active**
   - Max 5 login attempts per 15 minutes
   - Max 3 contact form submissions per hour
   - Clear error messages inform users

### For Developers:
1. **JWT_SECRET is now required**
   - App will not start without proper JWT_SECRET
   - Must be 32+ characters

2. **New Utility Functions Available**
   - Import from `@/lib/utils/sanitize`
   - Import from `@/lib/middleware/rateLimit`

3. **Dashboard Tasks POST requires admin role**
   - Previously unprotected
   - Now requires authentication + admin role

---

## 🐛 Troubleshooting

### Error: "JWT_SECRET must be at least 32 characters long"
**Cause:** JWT_SECRET is too short or not set  
**Fix:** Generate new secret with minimum 32 characters

### Error: "Too many login attempts"
**Cause:** Rate limiting is working  
**Fix:** Wait 15 minutes or clear rate limit in development

### Users can't sign up with old password format
**Cause:** New password requirements  
**Fix:** Inform users of new requirements:
- Minimum 8 characters
- Uppercase, lowercase, number, special character

### Contact form submissions failing
**Cause:** Rate limiting (3 per hour)  
**Fix:** This is intentional to prevent spam

### Build errors about missing modules
**Cause:** New utility files not found  
**Fix:** Ensure all files are committed and pushed

---

## 📊 Monitoring After Deployment

### Check These Logs:
```bash
# Look for these patterns in logs:

# Rate limiting working:
"Too many login attempts"
"Too many signup attempts"
"Too many contact form submissions"

# Password validation working:
"Password must be at least 8 characters"
"Password must contain uppercase, lowercase, number, and special character"

# Input validation working:
"Invalid email format"
"Invalid action URL"
"Invalid task ID"
```

### Metrics to Monitor:
- Failed login attempts (should see rate limiting)
- Signup failures due to weak passwords
- Contact form spam reduction
- No increase in server errors

---

## 🔄 Rollback Plan

If issues arise:

### Quick Rollback
```bash
git revert HEAD
git push origin main
```

### Selective Rollback
Revert specific files:
```bash
git checkout HEAD~1 -- app/api/auth/signup/route.js
git commit -m "Rollback signup changes"
git push
```

### Emergency Disable Rate Limiting
Temporarily disable in files:
```javascript
// Comment out rate limit check
// const rateLimitCheck = checkRateLimit(...);
// if (!rateLimitCheck.allowed) { ... }
```

---

## ✅ Success Criteria

Deployment is successful when:

- [ ] Application builds without errors
- [ ] All API endpoints respond correctly
- [ ] Users can signup with strong passwords
- [ ] Users cannot signup with weak passwords
- [ ] Rate limiting triggers correctly
- [ ] Security headers visible in browser
- [ ] No sensitive data in error messages
- [ ] All existing features work normally
- [ ] No increase in server error rate
- [ ] Performance impact < 5ms per request

---

## 📈 Performance Impact

Expected performance changes:

| Operation | Before | After | Impact |
|-----------|--------|-------|--------|
| Signup | ~50ms | ~55ms | +5ms (validation) |
| Signin | ~30ms | ~33ms | +3ms (rate check) |
| Contact form | ~100ms | ~105ms | +5ms (sanitization) |
| Task progress | ~40ms | ~45ms | +5ms (validation) |

**Overall Impact:** Negligible (< 10% increase)

---

## 🎯 Next Steps After Deployment

1. **Monitor for 24 hours**
   - Check error rates
   - Review rate limit hits
   - Monitor user feedback

2. **Collect Metrics**
   - Failed login attempts
   - Weak password rejections
   - Rate limit triggers

3. **Optional Enhancements**
   - Add 2FA for admin accounts
   - Implement account lockout
   - Add security event notifications
   - Consider Redis for rate limiting at scale

4. **Regular Security Reviews**
   - Weekly log review
   - Monthly dependency updates
   - Quarterly security audits

---

## 📞 Support Contacts

**Security Issues:**
- Review `SECURITY_FIXES_SUMMARY.md`
- Check `SECURITY_QUICK_GUIDE.md`
- Contact security team

**Technical Issues:**
- Check troubleshooting section
- Review deployment logs
- Test with curl commands above

---

## 🎉 Post-Deployment

Once deployed and verified:

1. ✅ Update team documentation
2. ✅ Inform users of password requirements
3. ✅ Monitor logs for first 24 hours
4. ✅ Schedule security review in 1 month
5. ✅ Plan for additional enhancements

**Your application is now significantly more secure! 🔒**

---

**Deployment Date:** ______________  
**Deployed By:** ______________  
**Verified By:** ______________  
**Status:** ☐ Success ☐ Issues ☐ Rollback Required
