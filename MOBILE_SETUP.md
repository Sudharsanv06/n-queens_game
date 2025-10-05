# 📱 How to Run N-Queens Game on Your Mobile Device

## 🚀 **Currently Running:**
- **Frontend**: http://172.18.99.145:5173/
- **Backend**: http://localhost:5000/

---

## **Method 1: Quick Mobile Testing (Web Browser) - EASIEST**

### Step 1: Connect to Same WiFi
Make sure your mobile phone is on the **same WiFi network** as your computer.

### Step 2: Open Mobile Browser
1. Open **Chrome, Safari, or any browser** on your mobile phone
2. Go to: **`http://172.18.99.145:5173`**
3. The N-Queens game will load on your mobile browser!

### Step 3: Add to Home Screen (Optional)
- **iPhone**: Tap Share → Add to Home Screen
- **Android**: Tap Menu (⋮) → Add to Home Screen

---

## **Method 2: Build Native Mobile App - FULL NATIVE**

### For Android (APK Installation):

#### Step 1: Build the App
```bash
# In your project folder, run:
cd client
npm run build
npx cap sync android
npx cap open android
```

#### Step 2: Generate APK in Android Studio
1. **Android Studio** will open automatically
2. Go to **Build → Build Bundle(s)/APK(s) → Build APK(s)**
3. Wait for build to complete
4. Click **"locate"** to find the APK file
5. The APK will be in: `client/android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 3: Install on Your Phone
**Option A: USB Transfer**
1. Connect phone to computer via USB
2. Copy the APK file to your phone
3. On your phone, enable "Install from Unknown Sources"
4. Tap the APK file to install

**Option B: Email/Cloud**
1. Email the APK file to yourself
2. Download on your phone
3. Install the APK

### For iPhone (requires Mac + Xcode):
```bash
cd client
npm run build
npx cap sync ios
npx cap open ios
```
Then build in Xcode and install via TestFlight or direct installation.

---

## **Method 3: Quick Local Testing Script**

I'll create a script to make this super easy:
