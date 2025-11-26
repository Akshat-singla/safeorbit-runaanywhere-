import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to welcome - the layout will handle auth routing
  return <Redirect href="/welcome" />;
}
