# Release Checklist

## Pre-Build
- [ ] **Update Version Code/Name**: Increment `versionCode` and `versionName` in `android/app/build.gradle`.
- [ ] **Set Production URLs**: Ensure `BACKEND_URL` in `App.jsx` points to your production server (Render/AWS), NOT localhost.
- [ ] **AdMob IDs**: Replace Test Ad Unit IDs with Real Ad Unit IDs in `AdMobService.js` and `AndroidManifest.xml`.
- [ ] **Icons & Splash**: Verify app icons and splash screen are correct (`npx capacitor-assets generate`).

## Build
- [ ] **Build Web Assets**: Run `npm run build`.
- [ ] **Sync Capacitor**: Run `npx cap sync`.
- [ ] **Generate Bundle**: In Android Studio, go to `Build > Generate Signed Bundle / APK`. Select `Android App Bundle`.
- [ ] **Keystore**: Sign with your release keystore.

## Backend
- [ ] **Deploy Backend**: Push `backend/` to Render/Railway.
- [ ] **Verify Live Endpoint**: Test `POST /remove-bg` on the live server.

## Play Console Setup
- [ ] **Create App**: Set up new app in Google Play Console.
- [ ] **Store Listing**: Upload Title, Description, Screenshots, Icon, Feature Graphic.
- [ ] **Privacy Policy**: Link to your hosted Privacy Policy URL.
- [ ] **Data Safety**:
    - Does app collect data? Yes (AdMob/Firebase).
    - Encrypted in transit? Yes.
    - Can request deletion? No/Yes.
    - **Data Types**: Device or other IDs (AdMob), App info and performance (Firebase).
- [ ] **Ads**: Mark "App contains ads" as Yes.

## Testing
- [ ] **Internal Testing**: Upload AAB to Internal Testing track.
- [ ] **Add Testers**: Add your email list.
- [ ] **Download & Test**: Verify Real Ads display and background removal works in live environment.

## Release
- [ ] **Promote to Production**: Move from Internal Testing to Production.
- [ ] **Submit for Review**: Wait for approval.
