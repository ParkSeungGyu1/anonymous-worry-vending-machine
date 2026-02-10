import { Link } from "wouter";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-foreground">
      <main className="w-full max-w-md mx-auto relative z-10">
        {children}
      </main>
      
      <footer className="mt-8 text-center text-muted-foreground font-hand text-lg">
        <p>© 2026 익명 고민 자판기</p>
        <p className="text-sm opacity-70 font-sans">당신의 하루가 조금 더 따뜻해지기를</p>
      </footer>
    </div>
  );
}
