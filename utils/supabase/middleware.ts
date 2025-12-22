// // // import { createServerClient } from '@supabase/ssr'
// // // import { NextResponse, type NextRequest } from 'next/server'

// // // export async function updateSession(request: NextRequest) {
// // //   let supabaseResponse = NextResponse.next({
// // //     request,
// // //   })

// // //   const supabase = createServerClient(
// // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // //     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
// // //     {
// // //       cookies: {
// // //         getAll() {
// // //           return request.cookies.getAll()
// // //         },
// // //         setAll(cookiesToSet) {
// // //           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
// // //           supabaseResponse = NextResponse.next({
// // //             request,
// // //           })
// // //           cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value))
// // //         },
// // //       },
// // //     }
// // //   )

// // //   // IMPORTANT: Avoid writing any logic between createServerClient and
// // //   // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
// // //   // issues with users being randomly logged out.

// // //   // IMPORTANT: Don't remove getClaims()
// // //   const { data } = await supabase.auth.getClaims()

// // //   const user = data?.claims

// // //   if (
// // //     !user &&
// // //     !request.nextUrl.pathname.includes('/login') &&
// // //     !request.nextUrl.pathname.includes('/register') &&
// // //     !request.nextUrl.pathname.includes('/forgot-password') &&
// // //     !request.nextUrl.pathname.includes('/reset-password') &&
// // //     !request.nextUrl.pathname.includes('/auth')
// // //   ) {
// // //     // no user, potentially respond by redirecting the user to the login page
// // //     const url = request.nextUrl.clone()
// // //     url.pathname = '/login'
// // //     return NextResponse.redirect(url)
// // //   }

// // //   // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
// // //   // creating a new response object with NextResponse.next() make sure to:
// // //   // 1. Pass the request in it, like so:
// // //   //    const myNewResponse = NextResponse.next({ request })
// // //   // 2. Copy over the cookies, like so:
// // //   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
// // //   // 3. Change the myNewResponse object to fit your needs, but avoid changing
// // //   //    the cookies!
// // //   // 4. Finally:
// // //   //    return myNewResponse
// // //   // If this is not done, you may be causing the browser and server to go out
// // //   // of sync and terminate the user's session prematurely!

// // //   return supabaseResponse
// // // }

// // // // import { createServerClient } from '@supabase/ssr'
// // // // import { NextResponse, type NextRequest } from 'next/server'

// // // // export async function updateSession(request: NextRequest) {
// // // //   let supabaseResponse = NextResponse.next({
// // // //     request,
// // // //   })

// // // //   const supabase = createServerClient(
// // // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ Fixed key name
// // // //     {
// // // //       cookies: {
// // // //         getAll() {
// // // //           return request.cookies.getAll()
// // // //         },
// // // //         setAll(cookiesToSet) {
// // // //           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
// // // //           supabaseResponse = NextResponse.next({ request })
// // // //           cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value))
// // // //         },
// // // //       },
// // // //     }
// // // //   )

// // // //   // ✅ Don't remove this line — it ensures user session consistency
// // // //   const { data } = await supabase.auth.getUser()

// // // //   const user = data?.user

// // // //   // ✅ Redirect unauthenticated users (except allowed paths)
// // // //   if (
// // // //     !user &&
// // // //     !request.nextUrl.pathname.startsWith('/login') &&
// // // //     !request.nextUrl.pathname.startsWith('/register') &&
// // // //     !request.nextUrl.pathname.startsWith('/forgot-password') &&
// // // //     !request.nextUrl.pathname.startsWith('/reset-password') &&
// // // //     !request.nextUrl.pathname.startsWith('/auth')
// // // //   ) {
// // // //     const url = request.nextUrl.clone()
// // // //     url.pathname = '/login'
// // // //     return NextResponse.redirect(url)
// // // //   }

// // // //   // ✅ Always return the Supabase response with updated cookies
// // // //   return supabaseResponse
// // // // }

// // import { createServerClient } from '@supabase/ssr'
// // import { NextResponse, type NextRequest } from 'next/server'

// // export async function updateSession(request: NextRequest) {
// //   let supabaseResponse = NextResponse.next({
// //     request,
// //   })

// //   const supabase = createServerClient(
// //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ✅ Fixed key name
// //     {
// //       cookies: {
// //         getAll() {
// //           return request.cookies.getAll()
// //         },
// //         setAll(cookiesToSet) {
// //           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
// //           supabaseResponse = NextResponse.next({ request })
// //           cookiesToSet.forEach(({ name, value }) => supabaseResponse.cookies.set(name, value))
// //         },
// //       },
// //     }
// //   )

// //   // ✅ Don't remove this line — it ensures user session consistency
// //   const { data } = await supabase.auth.getUser()

// //   const user = data?.user

// //   // ✅ Redirect unauthenticated users (except allowed paths)
// //   if (
// //     !user &&
// //     !request.nextUrl.pathname.startsWith('/login') &&
// //     !request.nextUrl.pathname.startsWith('/register') &&
// //     !request.nextUrl.pathname.startsWith('/forgot-password') &&
// //     !request.nextUrl.pathname.startsWith('/reset-password') &&
// //     !request.nextUrl.pathname.startsWith('/auth')
// //   ) {
// //     const url = request.nextUrl.clone()
// //     url.pathname = '/login'
// //     return NextResponse.redirect(url)
// //   }

// //   // ✅ Always return the Supabase response with updated cookies
// //   return supabaseResponse
// // }
// // middleware.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   const response = NextResponse.next();
  
//   // Get ngrok host from headers
//   const forwardedHost = request.headers.get('x-forwarded-host');
//   const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
//   // If we're coming through ngrok, set the correct base URL in headers
//   if (forwardedHost && forwardedHost.includes('ngrok')) {
//     response.headers.set('x-forwarded-host', forwardedHost);
//     response.headers.set('x-forwarded-proto', forwardedProto);
//   }
  
//   return response;
// }

// export const config = {
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };

// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};