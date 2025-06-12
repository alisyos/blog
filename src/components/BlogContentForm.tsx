"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { useState } from "react";

type FormData = {
  contentPurpose: string;
  contentInputType: string;
  content: string;
  contentFiles: FileList;
  persona: string;
  targetAudience: string;
  writingTone: string;
  writingStyle: string;
};

type BlogContentFormProps = {
  onSubmit: (e: React.FormEvent) => void;
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  contentPurpose: string;
  isLoading: boolean;
};

export default function BlogContentForm({
  onSubmit,
  register,
  errors,
  contentPurpose,
  isLoading,
}: BlogContentFormProps) {
  const [contentInputType, setContentInputType] = useState<string>("");

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* 목적 선택 */}
      <div>
        <label htmlFor="contentPurpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          목적 *
        </label>
        <select
          id="contentPurpose"
          {...register("contentPurpose", { required: "목적을 선택해주세요" })}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">항목 선택</option>
          <option value="news">기사/이슈형 콘텐츠</option>
          <option value="insight">인사이드/칼럼형 콘텐츠</option>
          <option value="review">리뷰 및 비교형 콘텐츠</option>
          <option value="information">정보 제공형 콘텐츠</option>
        </select>
        {errors.contentPurpose && (
          <p className="mt-1 text-sm text-red-600">{errors.contentPurpose.message}</p>
        )}
      </div>

      {/* 내용 입력 방식 선택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          내용 입력 방식 *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
            contentInputType === 'text' 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}>
            <input
              type="radio"
              value="text"
              {...register("contentInputType", { required: "입력 방식을 선택해주세요" })}
              onChange={(e) => setContentInputType(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-xl mb-1">✏️</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">직접 입력</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">텍스트로 직접 작성</div>
            </div>
          </label>
          
          <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
            contentInputType === 'file' 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}>
            <input
              type="radio"
              value="file"
              {...register("contentInputType", { required: "입력 방식을 선택해주세요" })}
              onChange={(e) => setContentInputType(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-xl mb-1">📁</div>
              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">파일 업로드</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">txt, docx 파일</div>
            </div>
          </label>
        </div>
        {errors.contentInputType && (
          <p className="mt-1 text-sm text-red-600">{errors.contentInputType.message}</p>
        )}
      </div>

      {/* 조건부 내용 입력 */}
      {contentInputType === 'text' && (
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            내용 *
          </label>
          <textarea
            id="content"
            {...register("content", { 
              required: contentInputType === 'text' ? "내용을 입력해주세요" : false 
            })}
            rows={6}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm"
            placeholder="게시물에 들어갈 내용을 입력해 주세요."
          ></textarea>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
      )}

      {contentInputType === 'file' && (
        <div>
          <label htmlFor="contentFiles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            파일 업로드 *
          </label>
          <input
            type="file"
            id="contentFiles"
            multiple
            accept=".txt,.docx"
            {...register("contentFiles", {
              required: contentInputType === 'file' ? "파일을 선택해주세요" : false
            })}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-gray-100 file:text-gray-700
              dark:file:bg-gray-700 dark:file:text-gray-200
              hover:file:bg-gray-200 dark:hover:file:bg-gray-600
              border border-gray-300 dark:border-gray-600 rounded-md p-2"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            txt, docx 파일을 첨부할 수 있습니다. 여러 파일 선택 가능합니다.
          </p>
          {errors.contentFiles && (
            <p className="mt-1 text-sm text-red-600">{errors.contentFiles.message}</p>
          )}
        </div>
      )}

      {/* 페르소나 */}
      <div>
        <label htmlFor="persona" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          페르소나 *
        </label>
        <input
          type="text"
          id="persona"
          {...register("persona", { required: "페르소나를 입력해주세요" })}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm"
          placeholder="누가 쓴 글처럼 보이길 원하시나요? ex) 여행 전문 기자, 가정 주부"
        />
        {errors.persona && (
          <p className="mt-1 text-sm text-red-600">{errors.persona.message}</p>
        )}
      </div>

      {/* 타깃 독자층 */}
      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          타깃 독자층
        </label>
        <input
          type="text"
          id="targetAudience"
          {...register("targetAudience")}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-sm"
          placeholder="게시물을 읽을 독자 특징을 입력해 주세요. ex) 사회초년생"
        />
      </div>

      {/* 문체 */}
      <div>
        <label htmlFor="writingTone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          문체
        </label>
        <select
          id="writingTone"
          {...register("writingTone")}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">항목 선택</option>
          <option value="해요">-해요</option>
          <option value="합니다">-합니다</option>
          <option value="함">-함</option>
          <option value="이다">-이다</option>
        </select>
      </div>

      {/* 문장스타일 */}
      <div>
        <label htmlFor="writingStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          문장스타일
        </label>
        <select
          id="writingStyle"
          {...register("writingStyle")}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">항목 선택</option>
          <option value="격식">격식</option>
          <option value="친근">친근</option>
          <option value="유머러스">유머러스</option>
          <option value="설명적">설명적</option>
          <option value="설득적">설득적</option>
        </select>
      </div>

      {/* 제출 버튼 */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            isLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? "블로그 글 생성 중..." : "블로그 글 생성하기"}
        </button>
      </div>
    </form>
  );
} 