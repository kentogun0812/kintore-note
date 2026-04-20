import { Redirect } from 'expo-router';

export default function Index() {
  // Thay url để vào thẳng home
  return <Redirect href="/(tabs)/home" />;
}
