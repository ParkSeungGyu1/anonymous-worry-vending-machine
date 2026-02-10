import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, MessageCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Worry } from "@shared/schema";

export default function SearchWorries() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: worries } = useQuery<Worry[]>({
    queryKey: ["/api/worries"]
  });

  const filteredWorries = useMemo(() => {
    if (!worries) return [];
    if (!searchTerm.trim()) return worries;
    return worries.filter(w => 
      w.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.nickname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, worries]);

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLocation("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-hand font-bold">고민 기록 보관소</h1>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="고민이나 닉네임으로 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl border-2 border-primary/10 focus:border-primary/30 focus:outline-none bg-white shadow-sm font-hand text-lg transition-all"
          />
        </div>

        <div className="space-y-4">
          {filteredWorries.length > 0 ? (
            filteredWorries.map((w) => (
              <WorryCard key={w.id} worry={w} onClick={() => setLocation(`/read/${w.id}`)} />
            ))
          ) : (
            <div className="text-center py-20 bg-white/40 rounded-3xl border-2 border-dashed border-primary/10">
              <p className="font-hand text-xl text-muted-foreground">
                {worries ? "찾으시는 고민이 없어요 😢" : "불러오는 중..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function WorryCard({ worry, onClick }: { worry: Worry, onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card 
        onClick={onClick}
        className="p-5 cursor-pointer border-primary/10 bg-white/80 backdrop-blur-sm group overflow-hidden relative shadow-sm"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-hand px-2 py-0.5 bg-primary/10 text-primary rounded-full">
            {worry.nickname}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-sans">
            <Calendar className="w-3 h-3" />
            {format(new Date(worry.createdAt), "yyyy.MM.dd")}
          </span>
        </div>
        <p className="font-hand text-lg text-foreground/90 line-clamp-2 mb-3">
          {worry.content}
        </p>
      </Card>
    </motion.div>
  );
}
