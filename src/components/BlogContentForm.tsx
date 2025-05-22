"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";

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
  return (
    <form onSubmit={onSubmit} className="space-y-4 overflow-auto max-h-[calc(100vh-12rem)]">
      {/* 콘텐츠 목적 선택 */}
      <div>
        <label htmlFor="contentPurpose" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          콘텐츠 목적 선택 *
        </label>
        <select
          id="contentPurpose"
          {...register("contentPurpose", { required: "콘텐츠 목적을 선택해주세요" })}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">목적 선택...</option>
          <option value="product">제품/서비스 소개</option>
          <option value="review">후기/사용기</option>
          <option value="information">정보성 콘텐츠</option>
          <option value="news">뉴스/보도자료용</option>
          <option value="seo">SEO용</option>
          <option value="branding">브랜드 이미지 제고용</option>
        </select>
        {errors.contentPurpose && (
          <p className="mt-1 text-sm text-red-600">{errors.contentPurpose.message}</p>
        )}
      </div>

      {/* 기본 정보 그룹 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 사용자 정보 */}
        <div>
          <label htmlFor="userInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            사용자 정보 *
          </label>
          <input
            type="text"
            id="userInfo"
            {...register("userInfo", { required: "사용자 정보를 입력해주세요" })}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="필명, 연령대, 직업, 지역 등"
          />
          {errors.userInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.userInfo.message}</p>
          )}
        </div>

        {/* 소속 또는 블로그 브랜드명 */}
        <div>
          <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            소속 또는 블로그 브랜드명
          </label>
          <input
            type="text"
            id="brandName"
            {...register("brandName")}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="테크 블로그"
          />
        </div>
      </div>

      {/* 타겟 독자층 */}
      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          타겟 독자층 *
        </label>
        <input
          type="text"
          id="targetAudience"
          {...register("targetAudience", { required: "타겟 독자층을 입력해주세요" })}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="20-30대 직장인, IT 관심자"
        />
        {errors.targetAudience && (
          <p className="mt-1 text-sm text-red-600">{errors.targetAudience.message}</p>
        )}
      </div>

      {/* 주제 키워드 */}
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          주제 키워드 *
        </label>
        <input
          type="text"
          id="keywords"
          {...register("keywords", { required: "주제 키워드를 입력해주세요" })}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="인공지능, 머신러닝, 데이터 분석"
        />
        {errors.keywords && (
          <p className="mt-1 text-sm text-red-600">{errors.keywords.message}</p>
        )}
      </div>

      {/* 핵심 메시지/강조 포인트 */}
      <div>
        <label htmlFor="coreMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          핵심 메시지/강조 포인트 *
        </label>
        <textarea
          id="coreMessage"
          {...register("coreMessage", { required: "핵심 메시지를 입력해주세요" })}
          rows={3}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="이 글에서 강조하고 싶은 핵심 메시지를 작성해주세요"
        ></textarea>
        {errors.coreMessage && (
          <p className="mt-1 text-sm text-red-600">{errors.coreMessage.message}</p>
        )}
      </div>

      {/* 제품/서비스 상세 정보 - 제품/서비스 소개 목적인 경우에만 표시 */}
      {contentPurpose === "product" && (
        <div>
          <label htmlFor="productDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            제품/서비스 상세 정보 *
          </label>
          <textarea
            id="productDetails"
            {...register("productDetails", { required: "제품/서비스 상세 정보를 입력해주세요" })}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="제품/서비스 이름, 기능, 가격 등의 정보를 작성해주세요"
          ></textarea>
          {errors.productDetails && (
            <p className="mt-1 text-sm text-red-600">{errors.productDetails.message}</p>
          )}
        </div>
      )}

      {/* 후기/사용경험 정보 - 후기/사용기 목적인 경우에만 표시 */}
      {contentPurpose === "review" && (
        <div>
          <label htmlFor="reviewInfo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            후기/사용경험 정보 *
          </label>
          <textarea
            id="reviewInfo"
            {...register("reviewInfo", { required: "후기/사용경험 정보를 입력해주세요" })}
            rows={3}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="제품/서비스 사용 경험, 장단점 등을 작성해주세요"
          ></textarea>
          {errors.reviewInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.reviewInfo.message}</p>
          )}
        </div>
      )}

      {/* 선택적 정보 아코디언 */}
      <details className="border border-gray-200 dark:border-gray-700 rounded-md p-2">
        <summary className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer py-1">
          추가 정보 (선택사항)
        </summary>
        <div className="pt-3 space-y-4">
          {/* 참고자료 */}
          <div>
            <label htmlFor="referenceContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              참고자료
            </label>
            <textarea
              id="referenceContent"
              {...register("referenceContent")}
              rows={2}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
              placeholder="참고할 자료의 내용을 직접 입력해주세요"
            ></textarea>
            <div className="mt-2">
              <label htmlFor="referenceFiles" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                참고 파일 첨부
              </label>
              <input
                type="file"
                id="referenceFiles"
                multiple
                {...register("referenceFiles")}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-gray-100 file:text-gray-700
                  dark:file:bg-gray-700 dark:file:text-gray-200
                  hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">PDF, Word, 텍스트 파일 등을 첨부할 수 있습니다.</p>
            </div>
          </div>

          {/* 원하는 문체, 문장 스타일 */}
          <div>
            <label htmlFor="writingStyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              원하는 문체, 문장 스타일
            </label>
            <select
              id="writingStyle"
              {...register("writingStyle")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">선택...</option>
              <option value="professional">전문적/격식적</option>
              <option value="casual">캐주얼/친근한</option>
              <option value="storytelling">스토리텔링</option>
              <option value="humorous">유머러스한</option>
              <option value="descriptive">설명적/상세한</option>
              <option value="persuasive">설득력 있는</option>
            </select>
          </div>

          {/* SEO 키워드 */}
          <div>
            <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              SEO 키워드
            </label>
            <input
              type="text"
              id="seoKeywords"
              {...register("seoKeywords")}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="검색엔진 최적화를 위한 키워드 (쉼표로 구분)"
            />
          </div>
        </div>
      </details>

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