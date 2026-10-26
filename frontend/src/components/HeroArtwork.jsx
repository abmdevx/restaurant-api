export function HeroArtwork() {
  return <div className="relative mx-auto h-[450px] w-full max-w-[520px]">
    <div className="absolute right-4 top-12 h-80 w-80 rounded-full bg-amber-100 dark:bg-amber-950/40 sm:right-14" />
    <div className="absolute right-12 top-8 flex h-[390px] w-[290px] rotate-3 flex-col items-center justify-between border-[10px] border-[#fffaf0] bg-gradient-to-br from-amber-700 via-amber-500 to-yellow-300 p-6 shadow-2xl shadow-amber-950/20 dark:border-stone-800 sm:right-24">
      <span className="self-start text-[10px] tracking-[0.25em] text-white/80">01</span>
      <img className="h-52 w-52 object-contain drop-shadow-xl" src="/restora.png" alt="Restora logo" />
      <span className="text-[9px] uppercase tracking-[0.2em] text-white/90">Good food · better moments</span>
    </div>
    <div className="absolute bottom-8 left-2 grid -rotate-6 gap-1 bg-white p-5 shadow-xl dark:bg-stone-800">
      <span className="text-[10px] text-stone-400">Tonight's special</span>
      <strong className="font-serif text-xl text-stone-800 dark:text-stone-100">Made with care</strong>
      <span className="text-[10px] text-stone-400">Always</span>
    </div>
    <span className="absolute left-16 top-8 text-4xl text-amber-500">✧</span>
    <span className="absolute right-5 top-3 text-2xl text-amber-500">✦</span>
  </div>
}
