"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowPathIcon, ClipboardIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type BlogContent = {
  title: string;
  content: string;
  tags: string[];
  cta: string;
} | null;

type BlogResultProps = {
  blogContent: BlogContent;
  onReset: () => void;
};

export default function BlogResult({ blogContent, onReset }: BlogResultProps) {
  const [copied, setCopied] = useState(false);

  if (!blogContent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          블로그 결과가 아직 없습니다. 작성 양식을 작성해주세요.
        </p>
        <button
          onClick={onReset}
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" />
          다시 시작하기
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    const fullContent = `# ${blogContent.title}\n\n${blogContent.content}\n\n${blogContent.cta}\n\n태그: ${blogContent.tags.join(", ")}`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fullContent = `# ${blogContent.title}\n\n${blogContent.content}\n\n${blogContent.cta}\n\n태그: ${blogContent.tags.join(", ")}`;
    const blob = new Blob([fullContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blogContent.title.replace(/\s+/g, "_")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 overflow-auto max-h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">생성된 블로그</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ClipboardIcon className="w-4 h-4 mr-1.5" />
            {copied ? "복사됨!" : "복사하기"}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1.5" />
            다운로드
          </button>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{blogContent.title}</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{blogContent.content}</ReactMarkdown>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300">{blogContent.cta}</p>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {blogContent.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      
      <div className="text-center pt-2">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-gray-800 dark:text-gray-200"
        >
          다시 작성하기
        </button>
      </div>
    </div>
  );
} 