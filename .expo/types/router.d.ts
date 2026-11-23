/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(app)` | `/(app)/(tabs)` | `/(app)/(tabs)/home` | `/(app)/(tabs)/profile` | `/(app)/(tabs)/scan` | `/(app)/(tabs)/summary` | `/(app)/home` | `/(app)/profile` | `/(app)/scan` | `/(app)/summary` | `/(auth)` | `/(auth)/login` | `/(auth)/register` | `/(tabs)` | `/(tabs)/home` | `/(tabs)/profile` | `/(tabs)/scan` | `/(tabs)/summary` | `/_sitemap` | `/home` | `/login` | `/profile` | `/register` | `/scan` | `/summary`;
      DynamicRoutes: `/(app)/receipt/${Router.SingleRoutePart<T>}` | `/receipt/${Router.SingleRoutePart<T>}`;
      DynamicRouteTemplate: `/(app)/receipt/[id]` | `/receipt/[id]`;
    }
  }
}
