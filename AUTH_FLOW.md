# Faith Connect Authentication Flow

## 📱 **User Journey After Signup**

### **Screen 1: Signup** ✅
**Location:** `/auth/signup`
- User enters: Name, Email, Phone, Partnership Number (optional)
- Selects verification method: SMS/WhatsApp or Email
- Clicks "Create Account & Get Code"
- Loading state shows: "Creating Account..." with animated dots

**Backend Response:**
```json
{
  "message": "Account created. OTP sent.",
  "identifier": "0115568694",
  "method": "phone"
}
```

---

### **Screen 2: OTP Verification** ⏭️ NEXT
**Location:** `/auth/verify?identifier=0115568694&method=phone`
- Shows 6-digit OTP input boxes
- Displays where code was sent (phone/email)
- "Resend Code" option (available after 60 seconds)
- Verifying state shows: "Verifying..." with animated dots

**Expected Backend Response:**
```json
{
  "refresh": "jwt_refresh_token",
  "access": "jwt_access_token",
  "user": {
    "id": 407,
    "phone": "0115568694",
    "email": "imaina671@gmail.com",
    "first_name": "Emmanuel Maina",
    "user_type": "member"
  }
}
```

---

### **Screen 3: Account Type Selection** ⏭️ AFTER VERIFY
**Location:** `/auth/account-type`
**Purpose:** User chooses their role

**Two Options:**

#### Option A: **Community Member** 👤
- Browse faith-based businesses
- Write reviews
- Save favorites
- Get discounts

**Redirects to:** `/` (Home/Browse)

#### Option B: **Business Owner** 🏢
- List your faith-based business
- Manage products/services
- Track reviews
- Get verified

**Redirects to:** `/onboarding/business` (Multi-step form)

---

### **Screen 4A: Community Member Flow**
**Location:** `/` (Home/Directory)
- Welcome message
- Browse businesses
- View categories
- Search functionality
- **Profile shows:** Completion progress in dropdown

---

### **Screen 4B: Business Owner Onboarding** (Multi-Step)
**Location:** `/onboarding/business`

**Step 1: Business Information**
- Business Name
- Category (Dropdown: Church, Christian Store, etc.)
- Description
- Logo upload

**Step 2: Location Details**
- Physical Address
- City/County
- Google Maps integration
- Service areas

**Step 3: Contact & Hours**
- Business Phone
- Business Email
- Website (optional)
- Hours of Operation

**Step 4: Products & Services** (Optional)
- Add initial products
- Add initial services
- Pricing information

**After Completion:**
- Business profile created
- Verification pending (shown in profile dropdown)
- **Redirects to: `/` (Directory)** - Same as community members!
- **BUT:** Navbar shows "Dashboard" link to manage business
- Can access `/dashboard` and `/dashboard/offerings` anytime

---

## 🎨 **Loading Animations Implemented**

### 1. **Button Loading States**
- Spinner icon (rotating)
- Status text ("Creating Account...", "Verifying...")
- Animated dots (pulsing sequence)
- Button press effect (scale down on click)

### 2. **Page Transitions**
- `animate-fade-in-up`: Elements slide up with fade
- `animate-scale-in`: Cards scale in smoothly
- `animate-fade-in-bottom`: Content fades from bottom

### 3. **Input Focus Effects**
- Border color transitions
- Ring effect on focus
- Smooth color changes

### 4. **Form Validation**
- Real-time error messages
- Input states (valid/invalid)
- Disabled states during loading

---

## 🔄 **Complete User Flow Summary**

```
1. Sign Up (/auth/signup)
   ↓ [OTP sent via SMS/Email]
   
2. Verify OTP (/auth/verify)
   ↓ [JWT tokens stored, user authenticated]
   
3. Choose Account Type (/auth/account-type)
   ↓
   ├─→ Community Member → Browse Home (/)
   │
   └─→ Business Owner → Business Onboarding (/auth/business-onboarding)
       ↓ [4 multi-step forms]
       
4. Final Destination
   ├─→ Member: Home Feed (/)
   └─→ Owner: Business Dashboard (/dashboard)
```

---

## ✨ **UX Enhancements**

### **Loading Indicators:**
- ✅ Spinner animations
- ✅ Loading dots
- ✅ Status messages
- ✅ Progress indicators

### **Smooth Transitions:**
- ✅ Page animations
- ✅ Button hover effects
- ✅ Form field focus states
- ✅ Error message sliding

### **Visual Feedback:**
- ✅ Button press effects
- ✅ Input validation states
- ✅ Success/error colors
- ✅ Disabled states

---

## 🚀 **Next Steps to Implement**

1. **Account Type Selection Page** → Create `/auth/account-type`
2. **Business Onboarding Flow** → Create `/auth/business-onboarding`
3. **Dashboard Pages** → Business owner dashboard
4. **Profile Completion Tracking** → Update UserProfileDropdown

---

## 🎯 **Current Status**

✅ Signup page with loading animations
✅ OTP verification with animated states
✅ JWT authentication flow
✅ User model with verification fields
✅ RBAC system (Shield-like permissions)
⏳ Account type selection page
⏳ Business onboarding multi-step form
⏳ Community member home feed
