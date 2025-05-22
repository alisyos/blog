import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// OpenAI 클라이언트 초기화 - 런타임에 초기화하도록 변경
let openai: OpenAI;

// 클라이언트 초기화 함수
function initOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "dummy-key",
    });
  }
  return openai;
}

// 프롬프트 파일 경로
const promptsFilePath = path.join(process.cwd(), "src/data/prompts.json");

// 프롬프트 로드 함수
function loadPrompts() {
  try {
    if (fs.existsSync(promptsFilePath)) {
      const fileContents = fs.readFileSync(promptsFilePath, "utf8");
      return JSON.parse(fileContents);
    }
    return {};
  } catch (error) {
    console.error("Error loading prompts:", error);
    return {};
  }
}

export async function POST(request: NextRequest) {
  try {
    // OpenAI 클라이언트 초기화
    const openaiClient = initOpenAI();

    // FormData 형식으로 받기
    const formData = await request.formData();
    const requestData: Record<string, any> = {};
    const files: File[] = [];
    
    // FormData에서 각 필드 추출
    for (const [key, value] of formData.entries()) {
      if (key === 'files') {
        files.push(value as File);
      } else {
        requestData[key] = value;
      }
    }
    
    // 필수 입력 값 유효성 검사
    if (
      !requestData.contentPurpose ||
      !requestData.userInfo ||
      !requestData.targetAudience ||
      !requestData.keywords ||
      !requestData.coreMessage
    ) {
      return NextResponse.json(
        { error: "필수 입력 값이 누락되었습니다" },
        { status: 400 }
      );
    }
    
    // 목적에 따른 추가 검증
    if (
      requestData.contentPurpose === "product" && 
      !requestData.productDetails
    ) {
      return NextResponse.json(
        { error: "제품/서비스 상세 정보가 필요합니다" },
        { status: 400 }
      );
    }
    
    if (
      requestData.contentPurpose === "review" && 
      !requestData.reviewInfo
    ) {
      return NextResponse.json(
        { error: "후기/사용경험 정보가 필요합니다" },
        { status: 400 }
      );
    }
    
    // 파일 처리
    let fileContents = "";
    
    if (files.length > 0) {
      for (const file of files) {
        try {
          // 파일의 텍스트 내용 추출
          const fileText = await file.text();
          fileContents += `\n파일 '${file.name}' 내용:\n${fileText}\n`;
        } catch (error) {
          console.error("파일 처리 중 오류:", error);
          fileContents += `\n파일 '${file.name}'을 처리하지 못했습니다.\n`;
        }
      }
    }
    
    // 저장된 프롬프트 로드
    const prompts = loadPrompts();
    
    // 스타일에 따른 프롬프트 선택 또는 기본값 사용
    let promptType = "with_files"; // 파일이 있으므로 기본값으로 with_files 사용
    if (requestData.seoKeywords) {
      promptType = "seo_optimized";
    }
    
    // 선택된 프롬프트가 없거나 존재하지 않는 경우 기본값 사용
    const systemPrompt = prompts[promptType]?.system || 
      `당신은 고품질 블로그 글을 작성하는 전문가입니다. 
사용자가 제공한 정보와 첨부 파일의 내용을 바탕으로 자연스럽고 매력적인 블로그 포스트를 작성해 주세요.

글은 다음 구조로 작성해주세요:
1. 제목 (흥미로운 제목)
2. 본문 (서론-본론-결론 구조, 마크다운 형식 사용)
3. 행동 유도(CTA) 문구
4. 해시태그 (5개)

결과는 다음 JSON 형식으로 반환해주세요:
{
  "title": "글 제목",
  "content": "마크다운 형식의 본문 내용",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "cta": "행동 유도 문구"
}`;

    // 사용자 프롬프트 구성
    let userPrompt = `블로그 글의 목적: ${requestData.contentPurpose}
작성자 정보: ${requestData.userInfo}
${requestData.brandName ? `소속/브랜드: ${requestData.brandName}` : ''}
대상 독자층: ${requestData.targetAudience}
주제 키워드: ${requestData.keywords}
핵심 메시지: ${requestData.coreMessage}
`;

    // 목적별 추가 정보
    if (requestData.contentPurpose === "product") {
      userPrompt += `제품/서비스 정보: ${requestData.productDetails}\n`;
    } else if (requestData.contentPurpose === "review") {
      userPrompt += `후기/사용경험: ${requestData.reviewInfo}\n`;
    }

    // 선택적 정보 추가
    if (requestData.referenceContent) {
      userPrompt += `참고자료: ${requestData.referenceContent}\n`;
    }
    if (requestData.writingStyle) {
      userPrompt += `문체 스타일: ${requestData.writingStyle}\n`;
    }
    if (requestData.seoKeywords) {
      userPrompt += `SEO 키워드: ${requestData.seoKeywords}\n`;
    }
    
    // 파일 내용 추가
    if (fileContents) {
      userPrompt += `\n--- 첨부 파일 내용 ---\n${fileContents}`;
    }

    // API 키가 유효한지 확인
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "dummy-key") {
      return NextResponse.json(
        { 
          title: "API 키 미설정",
          content: "OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의하세요.",
          tags: ["API", "오류", "설정", "OpenAI", "키"],
          cta: "관리자에게 API 키 설정을 요청하세요." 
        }
      );
    }

    // API 호출
    const completion = await openaiClient.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "gpt-4.1",
      response_format: { type: "json_object" },
    });

    // 응답 추출
    const responseContent = completion.choices[0].message.content;
    
    if (!responseContent) {
      throw new Error("API 응답이 비어있습니다");
    }
    
    // JSON 파싱
    const parsedResponse = JSON.parse(responseContent);
    
    return NextResponse.json(parsedResponse);
    
  } catch (error) {
    console.error("Error generating blog content:", error);
    return NextResponse.json(
      { error: "블로그 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
} 