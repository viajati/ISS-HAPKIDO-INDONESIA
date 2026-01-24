import { supabase } from './supabase';

/**
 * Login with email and password
 */
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Update last login
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.user.id);
  }

  return data;
}

/**
 * Register with token verification
 */
export async function registerWithToken(params: {
  email: string;
  password: string;
  username: string;
  full_name: string;
  token: string;
  wilayah?: string;
  dojang?: string;
  phone?: string;
}) {
  // 1. Verify token
  const { data: tokenData, error: tokenError } = await supabase
    .from('registration_tokens')
    .select('*')
    .eq('token', params.token)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .single();

  if (tokenError || !tokenData) {
    throw new Error('Token tidak valid atau sudah kadaluarsa');
  }

  // 2. Check username availability
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', params.username)
    .single();

  if (existingUser) {
    throw new Error('Username sudah digunakan');
  }

  // 3. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        username: params.username,
        full_name: params.full_name,
      },
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Gagal membuat user');
  }

  // 4. Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    username: params.username,
    email: params.email,
    full_name: params.full_name,
    role: tokenData.role,
    wilayah: params.wilayah || tokenData.wilayah,
    dojang: params.dojang,
    phone: params.phone,
    status: 'active',
  });

  if (profileError) {
    // Rollback auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error('Gagal membuat profile: ' + profileError.message);
  }

  // 5. Mark token as used
  await supabase
    .from('registration_tokens')
    .update({
      status: 'used',
      used_at: new Date().toISOString(),
      used_by: authData.user.id,
    })
    .eq('token', params.token);

  return authData;
}

/**
 * Logout
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  return data.session;
}

/**
 * Get current user profile
 */
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Reset password (send email)
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}
