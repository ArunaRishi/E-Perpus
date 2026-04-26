import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// 1. Inisialisasi Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function DetailBukuScan({ 
  params 
}: { 
  params: { id: string } 
}) {
  
  // 2. TUNGGU PARAMS: Wajib di Next.js versi terbaru agar ID tidak 'undefined'
  const resolvedParams = await params;
  const bookId = resolvedParams.id;

  // 3. AMBIL DATA: Query ke tabel 'books' berdasarkan ID
  const { data: book, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();

  // 4. HANDLING ERROR: Jika data tidak ditemukan atau ID salah syntax
  if (error || !book) {
    console.error("Supabase Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-slate-100">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-black text-slate-800 mb-2">Buku Tidak Ditemukan</h1>
          <p className="text-sm text-slate-500 mb-6">
            ID: <span className="font-mono font-bold text-red-500">{bookId}</span> tidak terdaftar di sistem.
          </p>
          <a href="/" className="inline-block w-full py-3 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
            Kembali ke Katalog
          </a>
        </div>
      </div>
    );
  }

  // 5. TAMPILAN UTAMA: Jika data berhasil ditarik
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-6 sm:p-10">
      <div className="max-w-md w-full">
        {/* Header Judul */}
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 text-center leading-tight mb-8">
          {book.title}
        </h1>

        {/* Container Gambar Buku */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-emerald-100 rounded-[2.5rem] blur opacity-25"></div>
          <div className="relative bg-slate-50 p-4 rounded-[2rem] border border-slate-100 shadow-2xl">
            <img 
              src={book.cover_url || "https://via.placeholder.com/400x600?text=No+Image"} 
              alt={book.title}
              className="w-full h-auto rounded-2xl object-cover shadow-sm"
            />
          </div>
        </div>

        {/* Informasi Detail */}
        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Kategori</p>
            <p className="text-sm font-bold text-slate-700">{book.category || 'Umum'}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Lokasi Rak</p>
            <p className="text-sm font-bold text-slate-700">{book.rak || 'TBA'}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Status Stok</p>
            <p className="text-sm font-bold text-slate-700">{book.stock} Tersedia</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rating</p>
            <p className="text-sm font-bold text-slate-700">⭐ {book.rating || '0.0'}</p>
          </div>
        </div>

        {/* Tombol Aksi Mobile */}
        <div className="mt-8">
          <button className="w-full py-4 bg-[#1B4332] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">
             Konfirmasi Peminjaman
          </button>
        </div>
      </div>
    </div>
  );
}