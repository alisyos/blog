"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import BlogContentForm from "@/components/BlogContentForm";
import BlogResult from "@/components/BlogResult";
import Link from "next/link";

type FormData = {
  contentPurpose: string;
  userInfo: string;
  brandName: string;
  targetAudience: string;
  keywords: string;
  coreMessage: string;
  productDetails: string;
  reviewInfo: string;
  referenceContent: string;
  referenceFiles: FileList;
  writingStyle: string;
  seoKeywords: string;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [blogContent, setBlogContent] = useState<{
    title: string;
    content: string;
    tags: string[];
    cta: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<FormData>();

  const contentPurpose = watch("contentPurpose");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // FormData에서 파일 객체 처리
      const formData = new FormData();
      
      // 일반 텍스트 데이터 추가
      Object.keys(data).forEach((key) => {
        if (key !== "referenceFiles") {
          formData.append(key, data[key as keyof FormData] as string);
        }
      });
      
      // 파일 데이터 처리
      if (data.referenceFiles && data.referenceFiles.length > 0) {
        for (let i = 0; i < data.referenceFiles.length; i++) {
          formData.append("files", data.referenceFiles[i]);
        }
      }
      
      // API 엔드포인트 변경을 위한 준비
      const apiEndpoint = data.referenceFiles && data.referenceFiles.length > 0
        ? "/api/generate-with-files"
        : "/api/generate";
      
      // API 요청
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("블로그 생성에 실패했습니다");
      }
      
      const result = await response.json();
      setBlogContent(result);
    } catch (error) {
      console.error("Error:", error);
      alert("블로그 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setBlogContent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            AI 블로그 포스트 자동 작성기
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 좌측: 입력 폼 */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                블로그 포스트 작성하기
              </h2>
              <BlogContentForm
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                errors={errors}
                contentPurpose={contentPurpose}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* 우측: 결과 표시 */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 h-full">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <h3 className="text-lg font-medium mb-2">블로그 글 생성 중...</h3>
                  <p>잠시만 기다려주세요. 고품질 블로그 글을 작성하고 있습니다.</p>
                </div>
              ) : !blogContent ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">블로그 작성 대기 중</h3>
                  <p>왼쪽의 양식을 작성하고 생성 버튼을 클릭하면 이곳에 결과가 표시됩니다.</p>
                </div>
              ) : (
                <BlogResult 
                  blogContent={blogContent}
                  onReset={handleReset}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} AI 블로그 포스트 자동 작성기
          </p>
          <div className="mt-2">
            <Link 
              href="/admin" 
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              시스템 프롬프트 관리
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
