"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

type PromptData = {
  [key: string]: {
    system: string;
  };
};

const promptNames = {
  news: "기사/이슈형",
  insight: "인사이트/칼럼형", 
  review: "리뷰/비교형",
  information: "정보 제공형"
};

const promptDescriptions = {
  news: "업계 소식, 신제품 발표, 정책 변경 등 속보성 콘텐츠",
  insight: "전문가 견해, 철학, 통찰을 담은 칼럼형 콘텐츠",
  review: "제품 사용기, 장단점, 가격/스펙 비교 콘텐츠",
  information: "How-to 가이드, 튜토리얼, 문제 해결 콘텐츠"
};

export default function AdminPage() {
  const [prompts, setPrompts] = useState<PromptData>({});
  const [loading, setLoading] = useState(true);
  const [currentPrompt, setCurrentPrompt] = useState<string>("news");
  const [promptContent, setPromptContent] = useState<string>("");
  const [savedStatus, setSavedStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // 프롬프트 데이터 로드
    const fetchPrompts = async () => {
      try {
        const response = await fetch("/api/admin/prompts");
        if (!response.ok) {
          throw new Error("프롬프트를 불러오는데 실패했습니다");
        }
        const data = await response.json();
        setPrompts(data);
        setPromptContent(data[currentPrompt]?.system || "");
        setLoading(false);
      } catch (err) {
        setError("프롬프트를 불러오는데 오류가 발생했습니다");
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [currentPrompt]);

  const handlePromptChange = (promptKey: string) => {
    setSavedStatus("");
    setCurrentPrompt(promptKey);
    setPromptContent(prompts[promptKey]?.system || "");
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSavedStatus("");
    setPromptContent(e.target.value);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: currentPrompt,
          system: promptContent,
        }),
      });

      if (!response.ok) {
        throw new Error("프롬프트 저장에 실패했습니다");
      }

      // 업데이트된 프롬프트 데이터 갱신
      const updatedPrompts = { ...prompts };
      updatedPrompts[currentPrompt] = { system: promptContent };
      setPrompts(updatedPrompts);
      
      setSavedStatus("저장 완료!");
      setTimeout(() => setSavedStatus(""), 3000);
    } catch (err) {
      setError("프롬프트 저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            시스템 프롬프트 관리
          </h1>
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            메인으로 돌아가기
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 프롬프트 목록 */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">프롬프트 목록</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">목적별 시스템 프롬프트</p>
            </div>
            
            {loading ? (
              <div className="py-4 text-center text-gray-500">로딩 중...</div>
            ) : (
              <ul className="space-y-2">
                {Object.keys(prompts).map((key) => (
                  <li 
                    key={key}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border ${
                      currentPrompt === key 
                        ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700" 
                        : "border-gray-200 dark:border-gray-600"
                    }`}
                    onClick={() => handlePromptChange(key)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {promptNames[key as keyof typeof promptNames] || key}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {promptDescriptions[key as keyof typeof promptDescriptions] || "설명 없음"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* 프롬프트 편집 */}
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {promptNames[currentPrompt as keyof typeof promptNames] || currentPrompt}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {promptDescriptions[currentPrompt as keyof typeof promptDescriptions] || "설명 없음"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {savedStatus && (
                  <span className="text-green-500 text-sm font-medium">{savedStatus}</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {loading ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
            
            <textarea
              value={promptContent}
              onChange={handleContentChange}
              className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed resize-y"
              placeholder="시스템 프롬프트 내용을 입력하세요"
            ></textarea>
            
            <div className="mt-6 space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <p className="font-medium">📝 프롬프트 작성 가이드</p>
              <ul className="space-y-1 ml-4">
                <li>• 프롬프트는 블로그 생성 시 AI에게 전달되는 지시사항입니다.</li>
                <li>• {`{{목적}}, {{내용}}, {{페르소나}}`} 등의 템플릿 변수를 사용할 수 있습니다.</li>
                <li>• 마크다운 형식으로 작성할 수 있습니다.</li>
                <li>• 변경 후 반드시 '저장' 버튼을 클릭하세요.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 