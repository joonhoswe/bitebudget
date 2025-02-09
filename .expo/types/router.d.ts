/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/camera`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/leaderboard` | `/leaderboard`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/social` | `/social`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/wallet` | `/wallet`; params?: Router.UnknownInputParams; } | { pathname: `/auth/login`; params?: Router.UnknownInputParams; } | { pathname: `/auth/signup`; params?: Router.UnknownInputParams; } | { pathname: `/components/Friends`; params?: Router.UnknownInputParams; } | { pathname: `/components/TransactionList`; params?: Router.UnknownInputParams; } | { pathname: `/components/transaction`; params?: Router.UnknownInputParams; } | { pathname: `/types/ed2curve.d`; params?: Router.UnknownInputParams; } | { pathname: `/types/image.d`; params?: Router.UnknownInputParams; } | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/camera`; params?: Router.UnknownOutputParams; } | { pathname: `/`; params?: Router.UnknownOutputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/leaderboard` | `/leaderboard`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/social` | `/social`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/wallet` | `/wallet`; params?: Router.UnknownOutputParams; } | { pathname: `/auth/login`; params?: Router.UnknownOutputParams; } | { pathname: `/auth/signup`; params?: Router.UnknownOutputParams; } | { pathname: `/components/Friends`; params?: Router.UnknownOutputParams; } | { pathname: `/components/TransactionList`; params?: Router.UnknownOutputParams; } | { pathname: `/components/transaction`; params?: Router.UnknownOutputParams; } | { pathname: `/types/ed2curve.d`; params?: Router.UnknownOutputParams; } | { pathname: `/types/image.d`; params?: Router.UnknownOutputParams; } | { pathname: `/+not-found`, params: Router.UnknownOutputParams & {  } };
      href: Router.RelativePathString | Router.ExternalPathString | `/camera${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/leaderboard${`?${string}` | `#${string}` | ''}` | `/leaderboard${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/profile${`?${string}` | `#${string}` | ''}` | `/profile${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/social${`?${string}` | `#${string}` | ''}` | `/social${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/wallet${`?${string}` | `#${string}` | ''}` | `/wallet${`?${string}` | `#${string}` | ''}` | `/auth/login${`?${string}` | `#${string}` | ''}` | `/auth/signup${`?${string}` | `#${string}` | ''}` | `/components/Friends${`?${string}` | `#${string}` | ''}` | `/components/TransactionList${`?${string}` | `#${string}` | ''}` | `/components/transaction${`?${string}` | `#${string}` | ''}` | `/types/ed2curve.d${`?${string}` | `#${string}` | ''}` | `/types/image.d${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/camera`; params?: Router.UnknownInputParams; } | { pathname: `/`; params?: Router.UnknownInputParams; } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/leaderboard` | `/leaderboard`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/profile` | `/profile`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/social` | `/social`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/wallet` | `/wallet`; params?: Router.UnknownInputParams; } | { pathname: `/auth/login`; params?: Router.UnknownInputParams; } | { pathname: `/auth/signup`; params?: Router.UnknownInputParams; } | { pathname: `/components/Friends`; params?: Router.UnknownInputParams; } | { pathname: `/components/TransactionList`; params?: Router.UnknownInputParams; } | { pathname: `/components/transaction`; params?: Router.UnknownInputParams; } | { pathname: `/types/ed2curve.d`; params?: Router.UnknownInputParams; } | { pathname: `/types/image.d`; params?: Router.UnknownInputParams; } | `/+not-found` | { pathname: `/+not-found`, params: Router.UnknownInputParams & {  } };
    }
  }
}
