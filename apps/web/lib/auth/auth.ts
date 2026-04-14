'use server';

import { createSupabaseServerClient as createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const getURL = () => {
    let url = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000/';
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
    return url;
};

export async function signInWithGithub() {
  const supabase = await createClient();
  const { data } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
        redirectTo: `${getURL()}auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url); // use the redirect API for your server framework
  }
}
