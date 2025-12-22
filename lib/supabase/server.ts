// // // import { createServerClient, type CookieOptions } from '@supabase/ssr'
// // // import { cookies } from 'next/headers'

// // // export function createClient() {
// // //   const cookieStore = cookies()

// // //   return createServerClient(
// // //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// // //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// // //     {
// // //       cookies: {
// // //         get(name: string) {
// // //           return cookieStore.get(name)?.value
// // //         },
// // //         set(name: string, value: string, options: CookieOptions) {
// // //           try {
// // //             cookieStore.set({ name, value, ...options })
// // //           } catch (error) {
// // //             // Handle cookie setting errors
// // //           }
// // //         },
// // //         remove(name: string, options: CookieOptions) {
// // //           try {
// // //             cookieStore.set({ name, value: '', ...options })
// // //           } catch (error) {
// // //             // Handle cookie removal errors
// // //           }
// // //         },
// // //       },
// // //     }
// // //   )
// // // }


// // // lib/supabase/server.ts
// // import { createServerClient } from '@supabase/ssr';
// // import { cookies } from 'next/headers';

// // export const createClient = async () => {
// //   const cookieStore = await cookies(); // ← AWAIT HERE (this is the fix)

// //   return createServerClient(
// //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
// //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
// //     {
// //       cookies: {
// //         getAll() {
// //           return cookieStore.getAll();
// //         },
// //         setAll(cookiesToSet) {
// //           cookiesToSet.forEach(({ name, value, options }) => {
// //             try {
// //               cookieStore.set(name, value, options);
// //             } catch {
// //               // Ignore — this can happen in Server Components
// //             }
// //           });
// //         },
// //       },
// //     }
// //   );
// // };

// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';

// export async function createClient() {
//   const cookieStore = await cookies();

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => {
//             try {
//               cookieStore.set(name, value, options);
//             } catch {}
//           });
//         },
//       },
//     }
//   );
// }

// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Handle the error gracefully in server components
          }
        },
      },
    }
  );
}