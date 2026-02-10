import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const EMOJIS = ["😢", "😰", "😔", "😞", "😣"];

export default function WriteWorry() {
  const [, setLocation] = useLocation();
  const [content, setContent] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("😔");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (newWorry: { content: string; nickname: string }) => {
      const res = await apiRequest("POST", "/api/worries", newWorry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/worries"] });
      toast({
        title: "고민이 전달됐어요 📮",
        description: "누군가 당신에게 따뜻한 위로를 보낼 거예요.",
        className: "bg-secondary text-secondary-foreground border-secondary-foreground/20 font-hand text-lg",
      });
      setLocation("/");
    },
  });

  const handleBack = () => {
    if (content.trim()) {
      setShowExitConfirm(true);
    } else {
      setLocation("/");
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "빈 고민은 넣을 수 없어요 😢",
        variant: "destructive",
      });
      return;
    }

    if (content.length > 400) {
      toast({
        title: "고민이 너무 길어요",
        description: "400자 이내로 줄여주세요.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({ 
      content: `${selectedEmoji} ${content}`,
      nickname: "익명" // Placeholder for now, backend generates random if not provided or we can just send it
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="rounded-full hover:bg-primary/20 hover:text-primary"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-hand font-bold">내 고민 넣기</h1>
        </div>

        <div className="space-y-4">
          <p className="text-center font-hand text-lg text-muted-foreground">지금 기분이 어때요?</p>
          <div className="flex justify-center gap-4">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`text-3xl p-3 rounded-2xl transition-all ${selectedEmoji === emoji ? 'bg-primary/20 scale-110 shadow-inner' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <Card className="p-6 bg-white shadow-lg border-2 border-dashed border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50"></div>
          
          <label className="block text-lg font-hand mb-3 text-muted-foreground">
            익명으로 털어놓아 보세요. (최대 400자)
          </label>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="여기에 고민을 적어주세요..."
            className={`min-h-[200px] text-xl font-hand resize-none border-primary/20 focus-visible:ring-primary bg-background/50 rounded-xl p-4 leading-relaxed ${content.length > 400 ? 'text-destructive border-destructive' : ''}`}
            data-testid="input-worry"
          />
          
          <div className="mt-4 flex justify-between items-center text-sm font-sans">
            <span className={content.length > 400 ? "text-destructive font-bold" : "text-muted-foreground"}>
              {content.length}/400
            </span>
            <div className="flex items-center gap-1 text-primary/60 text-xs">
              <AlertTriangle className="w-3 h-3" />
              <span>개인정보는 적지 말아주세요</span>
            </div>
          </div>
        </Card>

        <Button 
          onClick={handleSubmit}
          disabled={mutation.isPending || !content.trim()}
          className="w-full h-14 text-xl font-hand bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          data-testid="button-submit-worry"
        >
          {mutation.isPending ? "전달 중..." : "고민 넣기"}
          <Send className="w-5 h-5" />
        </Button>

        <p className="text-center text-xs text-muted-foreground font-sans px-4">
          욕설이나 부적절한 광고는 관리자에 의해 삭제될 수 있습니다.
        </p>
      </div>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent className="rounded-2xl border-2 border-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-hand text-2xl">작성을 중단할까요?</AlertDialogTitle>
            <AlertDialogDescription className="font-hand text-lg">
              지금 나가면 작성 중인 고민이 사라져요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-hand text-lg rounded-xl">계속 쓸게요</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => setLocation("/")}
              className="font-hand text-lg bg-destructive text-destructive-foreground rounded-xl"
            >
              나갈게요
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
