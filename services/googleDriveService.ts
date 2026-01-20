import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // User will need to configure
const GOOGLE_REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
];

export interface GoogleDriveAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export const googleDriveService = {
  async authenticate(): Promise<GoogleDriveAuth | null> {
    try {
      const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
          clientId: GOOGLE_CLIENT_ID,
          scopes: SCOPES,
          redirectUri: GOOGLE_REDIRECT_URI,
        },
        discovery
      );

      const result = await promptAsync();

      if (result.type === 'success') {
        const { authentication } = result;
        if (authentication?.accessToken) {
          const auth: GoogleDriveAuth = {
            accessToken: authentication.accessToken,
            refreshToken: authentication.refreshToken,
            expiresAt: Date.now() + (authentication.expiresIn || 3600) * 1000,
          };

          await AsyncStorage.setItem('google-drive-auth', JSON.stringify(auth));
          return auth;
        }
      }

      return null;
    } catch (error) {
      console.error('Google Drive auth error:', error);
      return null;
    }
  },

  async getAuth(): Promise<GoogleDriveAuth | null> {
    try {
      const stored = await AsyncStorage.getItem('google-drive-auth');
      if (!stored) return null;

      const auth: GoogleDriveAuth = JSON.parse(stored);
      
      // Check if token expired
      if (Date.now() >= auth.expiresAt) {
        return null;
      }

      return auth;
    } catch (error) {
      console.error('Error getting auth:', error);
      return null;
    }
  },

  async disconnect(): Promise<void> {
    try {
      await AsyncStorage.removeItem('google-drive-auth');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  },

  async uploadFile(fileName: string, content: string, mimeType: string = 'application/json'): Promise<string | null> {
    try {
      const auth = await this.getAuth();
      if (!auth) {
        throw new Error('Not authenticated with Google Drive');
      }

      const metadata = {
        name: fileName,
        mimeType: mimeType,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: mimeType }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  },

  async downloadFile(fileId: string): Promise<string | null> {
    try {
      const auth = await this.getAuth();
      if (!auth) {
        throw new Error('Not authenticated with Google Drive');
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  },

  async listFiles(): Promise<any[]> {
    try {
      const auth = await this.getAuth();
      if (!auth) {
        throw new Error('Not authenticated with Google Drive');
      }

      const response = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder', {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`List files failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  },

  async syncToGoogleDrive(data: any): Promise<boolean> {
    try {
      const fileName = `moriyumi-backup-${Date.now()}.json`;
      const content = JSON.stringify(data, null, 2);
      const fileId = await this.uploadFile(fileName, content);
      return fileId !== null;
    } catch (error) {
      console.error('Sync error:', error);
      return false;
    }
  },
};
