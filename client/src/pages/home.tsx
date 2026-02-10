import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/layout";
import vendingMachineImg from "@/assets/images/vending-machine.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Worry } from "@shared/schema";

const ONBOARDING_STEPS = [
  {
    title: "마음을 나누는 자판기",
    desc: "익명으로 고민을 털어놓고,\n따뜻한 위로를 주고받는 공간이에요.",
    icon: "🎰"
  },
  {
    title: "고민을 뽑아보세요",
    desc: "자판기 버튼을 누르면\n누군가의 진심 어린 고민이 나와요.",
    icon: "💌"
  },
  {
    title: "위로의 한마디",
    desc: "당신의 따뜻한 말 한마디가\n누군가에게는 큰 힘이 됩니다.",
    icon: "💝"
  }
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [isShaking, setIsShaking] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const { data: worries } = useQuery<Worry[]>({ 
    queryKey: ["/api/worries"] 
  });

  const stats = useMemo(() => {
    if (!worries) return { totalWorries: 0, totalCheers: 0 };
    return {
      totalWorries: worries.length,
      totalCheers: 0 // In a real app, you might want a separate stats endpoint
    };
  }, [worries]);

  useEffect(() => {
    const hasVisited = localStorage.getItem("has-visited-v1");
    if (!hasVisited) {
      setShowOnboarding(true);
    }
  }, []);

  const handleDrawWorry = () => {
    setIsShaking(true);
    setTimeout(async () => {
      try {
        const res = await fetch("/api/worries/random");
        if (res.ok) {
          const worry = await res.json();
          setLocation(`/read/${worry.id}`);
        } else {
          setLocation("/write");
        }
      } catch (err) {
        setLocation("/write");
      }
    }, 1500);
  };

  const nextOnboarding = () => {
    if (onboardingStep < ONBOARDING_STEPS.length - 1) {
      setOnboardingStep(s => s + 1);
    } else {
      setShowOnboarding(false);
      localStorage.setItem("has-visited-v1", "true");
    }
  };

  return (
    <Layout>
      <AnimatePresence>
        {showOnboarding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <Card className="w-full max-w-sm p-8 flex flex-col items-center text-center space-y-6 border-2 border-primary/20 shadow-2xl">
              <div className="text-6xl mb-2 animate-bounce">{ONBOARDING_STEPS[onboardingStep].icon}</div>
              <h2 className="text-2xl font-hand font-bold text-primary">{ONBOARDING_STEPS[onboardingStep].title}</h2>
              <p className="text-lg font-hand text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {ONBOARDING_STEPS[onboardingStep].desc}
              </p>
              <div className="flex gap-2">
                {ONBOARDING_STEPS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === onboardingStep ? 'bg-primary' : 'bg-primary/20'}`} />
                ))}
              </div>
              <Button 
                onClick={nextOnboarding}
                className="w-full h-12 text-lg font-hand bg-primary text-primary-foreground rounded-xl"
              >
                {onboardingStep === ONBOARDING_STEPS.length - 1 ? "시작하기" : "다음"}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex flex-col items-center">
        <div className="w-full flex justify-end mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/search")}
            className="font-hand text-lg text-primary hover:bg-primary/10 gap-2"
          >
            <Search className="w-5 h-5" />
            고민 검색하기
          </Button>
        </div>
        <div className="mb-6 text-center bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border-2 border-primary/20">
          <h1 className="text-4xl font-hand font-bold text-primary mb-1">익명 고민 자판기</h1>
          <p className="text-muted-foreground font-hand text-xl">동전을 넣듯, 마음을 나눠보세요</p>
        </div>

        <div className="relative mb-8 group">
          <motion.div
            animate={isShaking ? { x: [-2, 2, -2, 2, 0], rotate: [-1, 1, -1, 1, 0] } : {}}
            transition={{ duration: 0.5, repeat: isShaking ? 2 : 0 }}
            className="relative z-10"
          >
            <div className="relative bg-white p-4 rounded-[2rem] shadow-xl border-4 border-primary/30">
              <img 
                src={vendingMachineImg} 
                alt="Vending Machine" 
                className="w-72 h-auto mx-auto rounded-xl opacity-90"
              />
              
              <div className="absolute bottom-[25%] left-1/2 -translate-x-1/2 w-full flex flex-col items-center gap-3 px-8">
                 <Button 
                  onClick={handleDrawWorry}
                  disabled={isShaking}
                  className="w-full h-14 text-xl font-hand bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_0_0_hsl(8_100%_75%)] active:shadow-none active:translate-y-[4px] transition-all rounded-xl border-2 border-white/50 relative overflow-hidden"
                  data-testid="button-draw-worry"
                >
                  {isShaking ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>🎲</motion.span>
                      고민 찾는 중...
                    </span>
                  ) : "🎲 고민 뽑기"}
                </Button>
                
                <Button 
                  onClick={() => setLocation("/write")}
                  variant="secondary"
                  className="w-full h-12 text-lg font-hand bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-[0_4px_0_0_hsl(158_48%_70%)] active:shadow-none active:translate-y-[4px] transition-all rounded-xl border-2 border-white/50"
                  data-testid="button-insert-worry"
                >
                  📮 내 고민 넣기
                </Button>
              </div>
            </div>
          </motion.div>
          
          {isShaking && (
            <motion.div
              initial={{ y: 0, opacity: 0, scale: 0.5 }}
              animate={{ y: 200, opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="w-24 h-32 bg-white border-2 border-primary rounded-lg shadow-lg rotate-12 flex items-center justify-center">
                <span className="text-3xl animate-pulse">💌</span>
              </div>
            </motion.div>
          )}
        </div>

        <Card className="w-full bg-white/60 backdrop-blur-sm border-primary/20 shadow-sm p-4">
          <div className="flex justify-around text-center font-hand text-lg">
            <div>
              <p className="text-muted-foreground text-sm font-sans mb-1">전체 고민</p>
              <span className="text-2xl font-bold text-primary">{stats.totalWorries}개</span>
            </div>
          </div>
        </Card>

        <button 
          onClick={() => setShowOnboarding(true)}
          className="mt-6 text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-hand"
        >
          <Info className="w-4 h-4" />
          사용법 다시보기
        </button>
      </div>
    </Layout>
  );
}
