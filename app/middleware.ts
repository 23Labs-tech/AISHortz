// // // // // import { createServerClient, type CookieOptions } from '@supabase/ssr'
// // // // // import { NextResponse, type NextRequest } from 'next/server'

// // // // // export async function middleware(request: NextRequest) {
// // // // //   let response = NextResponse.next({
// // // // //     request: {
// // // // //       headers: request.headers,
// // // // //     },
// // // // //   })

// // // // //   const supabase = createServerClient(
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // // // //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// // // // //     {
// // // // //       cookies: {
// // // // //         get(name: string) {
// // // // //           return request.cookies.get(name)?.value
// // // // //         },
// // // // //         set(name: string, value: string, options: CookieOptions) {
// // // // //           request.cookies.set({
// // // // //             name,
// // // // //             value,
// // // // //             ...options,
// // // // //           })
// // // // //           response = NextResponse.next({
// // // // //             request: {
// // // // //               headers: request.headers,
// // // // //             },
// // // // //           })
// // // // //           response.cookies.set({
// // // // //             name,
// // // // //             value,
// // // // //             ...options,
// // // // //           })
// // // // //         },
// // // // //         remove(name: string, options: CookieOptions) {
// // // // //           request.cookies.set({
// // // // //             name,
// // // // //             value: '',
// // // // //             ...options,
// // // // //           })
// // // // //           response = NextResponse.next({
// // // // //             request: {
// // // // //               headers: request.headers,
// // // // //             },
// // // // //           })
// // // // //           response.cookies.set({
// // // // //             name,
// // // // //             value: '',
// // // // //             ...options,
// // // // //           })
// // // // //         },
// // // // //       },
// // // // //     }
// // // // //   )

// // // // //   const { data: { user } } = await supabase.auth.getUser()

// // // // //   // Protect dashboard routes
// // // // //   if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
// // // // //     return NextResponse.redirect(new URL('/login', request.url))
// // // // //   }

// // // // //   // Redirect logged-in users away from auth pages
// // // // //   if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && user) {
// // // // //     return NextResponse.redirect(new URL('/dashboard', request.url))
// // // // //   }

// // // // //   return response
// // // // // }

// // // // // export const config = {
// // // // //   matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
// // // // // }

// // // // // middleware.ts (create this file in the root of your project)
// // // // import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// // // // import { NextResponse } from 'next/server'
// // // // import type { NextRequest } from 'next/server'

// // // // export async function middleware(req: NextRequest) {
// // // //   const res = NextResponse.next()
  
// // // //   // Create a Supabase client configured to use cookies
// // // //   const supabase = createMiddlewareClient({ req, res })

// // // //   // Refresh session if expired - required for Server Components
// // // //   const { data: { session } } = await supabase.auth.getSession()

// // // //   // Log for debugging
// // // //   if (session) {
// // // //     console.log('Middleware: User authenticated:', session.user.email)
// // // //   } else {
// // // //     console.log('Middleware: No active session')
// // // //   }

// // // //   return res
// // // // }

// // // // // Ensure the middleware is only called for relevant paths
// // // // export const config = {
// // // //   matcher: [
// // // //     /*
// // // //      * Match all request paths except for the ones starting with:
// // // //      * - _next/static (static files)
// // // //      * - _next/image (image optimization files)
// // // //      * - favicon.ico (favicon file)
// // // //      * - public (public files)
// // // //      */
// // // //     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
// // // //   ],
// // // // }

// // // // middleware.ts (place in root directory)
// // // import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
// // // import { NextResponse } from 'next/server'
// // // import type { NextRequest } from 'next/server'

// // // export async function middleware(req: NextRequest) {
// // //   const res = NextResponse.next()
  
// // //   // Create a Supabase client configured to use cookies
// // //   const supabase = createMiddlewareClient({ req, res })

// // //   // Refresh session if expired - required for Server Components
// // //   const { data: { session } } = await supabase.auth.getSession()

// // //   // Log for debugging
// // //   console.log('Middleware - Path:', req.nextUrl.pathname)
// // //   console.log('Middleware - Session:', session?.user?.email || 'No session')

// // //   return res
// // // }

// // // // Ensure the middleware is only called for relevant paths
// // // export const config = {
// // //   matcher: [
// // //     /*
// // //      * Match all request paths except for the ones starting with:
// // //      * - _next/static (static files)
// // //      * - _next/image (image optimization files)
// // //      * - favicon.ico (favicon file)
// // //      */
// // //     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
// // //   ],
// // // }

// // // middleware.ts
// // import { NextResponse } from 'next/server';
// // import type { NextRequest } from 'next/server';

// // export function middleware(request: NextRequest) {
// //   const response = NextResponse.next();
  
// //   // Get ngrok host from headers
// //   const forwardedHost = request.headers.get('x-forwarded-host');
// //   const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
// //   // If we're coming through ngrok, set the correct base URL in headers
// //   if (forwardedHost && forwardedHost.includes('ngrok')) {
// //     response.headers.set('x-forwarded-host', forwardedHost);
// //     response.headers.set('x-forwarded-proto', forwardedProto);
// //   }
  
// //   return response;
// // }

// // export const config = {
// //   matcher: [
// //     '/((?!api|_next/static|_next/image|favicon.ico).*)',
// //   ],
// // };

// // middleware.ts
// import { createServerClient } from '@supabase/ssr';
// import { NextResponse, type NextRequest } from 'next/server';

// export async function middleware(request: NextRequest) {
//   let response = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => {
//             request.cookies.set(name, value);
//           });
//           response = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) => {
//             response.cookies.set(name, value, options);
//           });
//         },
//       },
//     }
//   );

//   // Refresh session if needed
//   await supabase.auth.getUser();

//   return response;
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
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

  // Skip auth refresh for these paths to avoid issues with payment redirects
  const skipAuthPaths = [
    '/buy-credits/success',
    '/api/verify-payment',
    '/api/create-checkout',
    '/api/webhooks',
  ];

  const isSkipPath = skipAuthPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // For payment success page, just pass through without auth manipulation
  if (isSkipPath) {
    return response;
  }

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
            response.cookies.set(name, value, {
              ...options,
              // Make cookies more permissive for cross-domain redirects
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            });
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};