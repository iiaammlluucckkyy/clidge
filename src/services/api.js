import { flaskApi } from './flaskApi';
import { isFirebaseConfigured } from './firebaseConfig';

export const apiClient = {
  flask: flaskApi,
  isFirebaseConfigured,
  mode: 'DEMONSTRATION_STANDALONE'
};

export default apiClient;
