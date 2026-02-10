import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, Send, Home, ShieldAlert, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Worry, Cheer } from "@shared/schema";

const SUGGESTIONS = ["괜찮아질 거예요", "항상 응원해요", "당신 잘못이 아니에요", "오늘도 수고했어요"];

export default function ReadWorry() {
  const [, params] = useRoute("/read/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cheer, setCheer] = useState("");

  const id = parseInt(params?.id || "0");

  const { data: worry, isLoading: worryLoading } = useQuery<Worry>({
    queryKey: [`/api/worries/${id}`],
    enabled: !!id
  });

  const { data: cheers, isLoading: cheersLoading } = useQuery<Cheer[]>({
    queryKey: [`/api/worries/${id}/cheers`],
    enabled: !!id
  });

  const mutation = useMutation({
    mutationFn: async (newCheer: { worryId: number; content: string }) => {
      const res = await apiRequest("POST", "/api/cheers", newCheer);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/worries/${id}/cheers`] });
      toast({
        title: "따뜻한 위로 감사해요 💝",
        className: "bg-primary text-primary-foreground border-none font-hand text-lg",
      });
      setCheer("");
    }
  });

  const handleSendCheer = () => {
    if (!cheer.trim()) return;

    if (cheer.length > 400) {
      toast({ title: "위로가 너무 길어요 (최대 400자)", variant: "destructive" });
      return;
    }

    mutation.mutate({ worryId: id, content: cheer });
  };

  const reportWorry = () => {
    toast({
      title: "신고가 접수되었습니다",
      description: "신속히 검토하여 조치하겠습니다.",
    });
  };

  if (worryLoading) return <Layout><div>로딩 중...</div></Layout>;
  if (!worry) return null;

  return (
    <Layout>
      <div className="space-y-6 pb-20">
         <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <span className="font-hand text-xl text-primary">누군가의 고민</span>
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="rounded-full">
            <Home className="w-6 h-6" />
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="min-h-[300px] p-8 bg-[#fffdf5] shadow-xl border border-primary/10 rounded-2xl relative flex flex-col justify-between overflow-hidden">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-primary/10 rotate-[-2deg] backdrop-blur-[1px]"></div>
            
            <div className="space-y-4 my-auto relative">
              <div className="flex justify-between items-center">
                <div className="text-4xl text-primary/10 font-serif leading-none">"</div>
                <div className="flex items-center gap-2">
                   <div className="bg-primary/5 px-3 py-1 rounded-full text-[10px] font-sans text-muted-foreground">
                    익명 #{worry.id}
                  </div>
                  <button onClick={reportWorry} className="text-muted-foreground/30 hover:text-destructive transition-colors">
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-hand leading-relaxed text-center text-foreground/90 whitespace-pre-wrap px-2">
                {worry.content}
              </p>
              <div className="text-4xl text-primary/10 font-serif text-right leading-none">"</div>
            </div>

            <div className="mt-8 pt-6 border-t border-primary/10">
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setCheer(s)}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-secondary/20 text-secondary-foreground text-xs font-hand border border-secondary/10 hover:bg-secondary/30 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <Textarea 
                  value={cheer}
                  onChange={(e) => setCheer(e.target.value)}
                  maxLength={400}
                  placeholder="당신의 위로가 큰 힘이 됩니다..."
                  className={`bg-white border-primary/20 focus-visible:ring-secondary min-h-[80px] font-hand text-lg pr-12 resize-none ${cheer.length >= 400 ? 'border-destructive' : ''}`}
                />
                <div className={`absolute right-3 top-3 text-[10px] font-sans ${cheer.length >= 400 ? 'text-destructive font-bold' : 'text-muted-foreground'}`}>
                  {cheer.length}/400
                </div>
                <Button
                  size="icon"
                  className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-md transition-all active:scale-90"
                  onClick={handleSendCheer}
                  disabled={mutation.isPending || !cheer.trim()}
                >
                  {mutation.isPending ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        <AnimatePresence>
          {cheers && cheers.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 space-y-4">
              <h3 className="font-hand text-xl text-center text-primary flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 fill-primary animate-pulse" />
                <span>도착한 위로들</span>
              </h3>
              <div className="space-y-3">
                {cheers.map((c, i) => (
                  <CheerCard key={c.id} content={c.content} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}

function CheerCard({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content.length > 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/90 p-4 rounded-xl shadow-sm border border-secondary/20 relative overflow-hidden cursor-pointer"
      onClick={() => isLong && setIsExpanded(!isExpanded)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/50"></div>
      <p className={`font-hand text-lg text-foreground/80 pl-2 ${!isExpanded && isLong ? 'line-clamp-2' : ''}`}>
        {content}
      </p>
      {isLong && (
        <div className="mt-1 pl-2 text-[10px] text-secondary font-sans text-right">
          {isExpanded ? "접기" : "더보기"}
        </div>
      )}
    </motion.div>
  );
}
