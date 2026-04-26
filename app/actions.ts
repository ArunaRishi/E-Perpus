"use server";

import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function handleRegister(email: string, password: string) {
  // 1. Daftarkan ke Supabase Auth
  const { error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) return { success: false, message: authError.message };

  // 2. Masukkan ke tabel Admin dengan status FALSE (Belum ACC)
  // Perhatikan: Nama tabel disesuaikan menjadi 'Admin'
  const { error: dbError } = await supabase
    .from('Admin') 
    .insert([{ 
        email: email, 
        role: 'Pegawai', // Default role untuk pendaftar baru
        status: false    // Di database kamu bool, jadi kita pakai false untuk pending
    }]);

  if (dbError) {
    console.error(dbError);
    return { success: false, message: "Gagal membuat profil. Email mungkin sudah terdaftar." };
  }

  return { success: true };
}

export async function handleLogin(email: string, password: string) {
  // 1. Cek tabel Admin dulu
  const { data: profile, error: profileError } = await supabase
    .from('Admin') 
    .select('*')
    .eq('email', email)
    .single();

  if (!profile || profileError) {
    return { success: false, message: "Akun tidak ditemukan atau belum terdaftar di database Admin." };
  }

  // 2. Cek apakah statusnya TRUE (Sudah di-ACC)
  // Karena di screenshot status kamu "TRUE", berarti yang bisa login hanya yang TRUE
  if (profile.status === false) {
    return { success: false, message: "⛔ Akun Anda belum disetujui (ACC) oleh Admin." };
  }

  // 3. Jika sudah di-ACC, verifikasi login ke Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { success: false, message: "Email atau Password salah!" };
  }

  // 4. Set Cookie berdasarkan ROLE yang ada di database ('Admin' atau 'Pegawai')
  const cookieStore = await cookies();
  cookieStore.set("user_email", email, { path: "/" });
  cookieStore.set("session", profile.role, { path: "/" });

  // Arahkan ke dashboard jika role-nya 'Admin' (case sensitive sesuai database)
  return { 
    success: true, 
    url: profile.role === 'Admin' ? "/dashboard" : "/katalog" 
  };
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  cookieStore.delete("user_email");
  await supabase.auth.signOut();
}