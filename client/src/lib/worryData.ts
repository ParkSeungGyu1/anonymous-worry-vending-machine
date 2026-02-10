import { useState, useEffect } from 'react';

export interface Worry {
  id: string;
  content: string;
  cheers: string[];
  createdAt: string;
  nickname: string;
}

const STORAGE_KEY = 'anonymous-worry-vending-machine-data';
const RECENT_HISTORY_KEY = 'recent-worries-history';
const BLOCKED_WORDS = ["바보", "멍청이", "나쁜놈"];

const ADJECTIVES = ["따뜻한", "행복한", "빛나는", "포근한", "활기찬", "지혜로운", "다정한", "용감한"];
const NOUNS = ["자판기", "햇살", "구름", "별빛", "바람", "라떼", "우체통", "미소"];

const INITIAL_WORRIES: Worry[] = [
  {
    id: '1',
    content: "취업 준비가 너무 길어지니까 자존감이 계속 낮아져요. 친구들은 다들 자리 잡는 것 같은데 저만 멈춰있는 기분입니다. 어떻게 하면 이 불안감을 떨쳐낼 수 있을까요?",
    cheers: ["각자의 속도가 있는 법이에요. 당신은 늦은 게 아니라 준비 중인 거예요. 조급해하지 말고 자신을 믿어보세요.", "포기하지 않는 것만으로도 대단한 거예요. 곧 좋은 소식이 있을 거예요! 힘내세요!"],
    createdAt: new Date().toISOString(),
    nickname: "푸른 바다 자판기"
  },
  {
    id: '2',
    content: "좋아하는 사람이 생겼는데 용기가 안 나요. 거절당하면 어색해질까 봐 말도 못 걸겠어요. 그냥 멀리서 바라보는 게 최선일까요?",
    cheers: ["후회하는 것보다 용기 내보는 게 낫지 않을까요? 당신의 진심은 분명히 통할 거예요.", "작은 인사부터 시작해보세요! 당신의 매력을 알아줄 사람이 분명히 있을 거예요."],
    createdAt: new Date().toISOString(),
    nickname: "꿈꾸는 고양이 구름"
  }
];

const generateNickname = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
};

export const getWorries = (): Worry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return INITIAL_WORRIES;
};

export const addWorry = (content: string) => {
  const worries = getWorries();
  const newWorry: Worry = {
    id: Date.now().toString(),
    content: content.slice(0, 400),
    cheers: [],
    createdAt: new Date().toISOString(),
    nickname: generateNickname()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newWorry, ...worries]));
  return newWorry;
};

export const addCheer = (worryId: string, cheer: string) => {
  const worries = getWorries();
  const updatedWorries = worries.map(w => {
    if (w.id === worryId) {
      if (w.cheers.includes(cheer)) return w;
      return { ...w, cheers: [...w.cheers, cheer.slice(0, 400)] };
    }
    return w;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWorries));
};

export const getRandomWorry = (): Worry | null => {
  const worries = getWorries();
  if (worries.length === 0) return null;

  const history = JSON.parse(localStorage.getItem(RECENT_HISTORY_KEY) || '[]');
  const available = worries.filter(w => !history.includes(w.id));
  const pool = available.length > 0 ? available : worries;
  
  const sortedPool = pool.sort((a, b) => a.cheers.length - b.cheers.length);
  const candidates = sortedPool.slice(0, Math.max(3, Math.floor(sortedPool.length * 0.3)));
  
  const selected = candidates[Math.floor(Math.random() * candidates.length)];

  const newHistory = [selected.id, ...history].slice(0, 10);
  localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(newHistory));
  
  return selected;
};

export const getStats = () => {
  const worries = getWorries();
  const totalWorries = worries.length;
  const totalCheers = worries.reduce((acc, curr) => acc + curr.cheers.length, 0);
  return { totalWorries, totalCheers };
};

export const validateContent = (text: string) => {
  const hasBadWord = BLOCKED_WORDS.some(word => text.includes(word));
  return !hasBadWord;
};
