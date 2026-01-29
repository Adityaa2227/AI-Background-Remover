import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

export const AdMobService = {
  initialize: async () => {
    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Example Test Device ID
        initializeForTesting: true,
      });
      console.log('AdMob initialized');
    } catch (error) {
      console.error('AdMob initialization failed', error);
    }
  },

  showBanner: async () => {
    try {
      const options = {
        adId: 'ca-app-pub-3940256099942544/6300978111', // Test Banner ID
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting: true,
      };
      await AdMob.showBanner(options);
    } catch (error) {
      console.error('Failed to show banner', error);
    }
  },

  hideBanner: async () => {
    try {
      await AdMob.hideBanner();
    } catch (error) {
      console.error('Failed to hide banner', error);
    }
  },

  prepareRewardedAd: async () => {
    try {
        const options = {
            adId: 'ca-app-pub-3940256099942544/5224354917', // Test Rewarded Video ID
            isTesting: true
        };
        await AdMob.prepareRewardVideoAd(options);
    } catch(error) {
        console.error("Failed to prepare reward video", error);
        throw error;
    }
  },

  showRewardedAd: async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const options = {
            adId: 'ca-app-pub-3940256099942544/5224354917', // Test Rewarded Video ID
            isTesting: true
        };
        
        // Ensure it's prepared? AdMob plugin handles caching usually, but let's prepare strictly
        // await AdMob.prepareRewardVideoAd(options); 

        const rewardItem = await AdMob.showRewardVideoAd();
        console.log('Reward granted', rewardItem);
        resolve(rewardItem);
      } catch (error) {
        console.error('Failed to show rewarded video', error);
        reject(error);
      }
    });
  }
};
