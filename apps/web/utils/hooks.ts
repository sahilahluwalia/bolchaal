// Custom hooks for user data
import { trpc } from '../app/_trpc/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export const useUserProfile = () => {
  return trpc.getProfile.useQuery();
};
