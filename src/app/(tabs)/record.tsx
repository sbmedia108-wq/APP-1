import { Redirect } from 'expo-router';

/** Placeholder route for the centre mic tab — the tab press opens /new instead. */
export default function Record() {
  return <Redirect href="/new" />;
}
