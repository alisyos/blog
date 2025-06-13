import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// prompts.json 파일에서 프롬프트 로드하는 함수
function loadPrompts() {
  const promptsPath = path.join(process.cwd(), 'src/data/prompts.json');
  const data = fs.readFileSync(promptsPath, 'utf-8');
  return JSON.parse(data);
}

// 템플릿 변수 치환 함수
function replaceTemplateVariables(template: string, variables: Record<string, string>) {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');  
    result = result.replace(regex, value || '');
  });
  return result;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { contentPurpose, purpose, content, persona, targetAudience, writingTone, writingStyle } = await request.json();

    // 필수 필드 검증
    if (!contentPurpose || !purpose || !content || !persona) {
      return NextResponse.json(
        { error: '유형, 목적, 내용, 페르소나는 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    // 프롬프트 로드
    const prompts = loadPrompts();
    
    // 유형에 따른 프롬프트 키 매핑
    const promptKeyMap: Record<string, string> = {
      'news': 'news',
      'insight': 'insight', 
      'review': 'review',
      'information': 'information'
    };

    const promptKey = promptKeyMap[contentPurpose] || 'news';
    const systemPrompt = prompts[promptKey]?.system;

    if (!systemPrompt) {
      return NextResponse.json(
        { error: '시스템 프롬프트를 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // 템플릿 변수 치환
    const processedPrompt = replaceTemplateVariables(systemPrompt, {
      유형: contentPurpose,
      목적: purpose,
      내용: content,
      페르소나: persona,
      타깃독자층: targetAudience || '',
      문체: writingTone || '',
      문장스타일: writingStyle || ''
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: processedPrompt
        },
        {
          role: 'user',
          content: `유형: ${contentPurpose}\n목적: ${purpose}\n내용: ${content}\n페르소나: ${persona}${targetAudience ? `\n타깃 독자층: ${targetAudience}` : ''}${writingTone ? `\n문체: ${writingTone}` : ''}${writingStyle ? `\n문장스타일: ${writingStyle}` : ''}`
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content;
    
    if (!result) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    // JSON 파싱 시도
    try {
      const blogPost = JSON.parse(result);
      
      // contentPurpose 추가
      blogPost.contentPurpose = contentPurpose;
      
      return NextResponse.json(blogPost);
    } catch (parseError) {
      // JSON 파싱 실패 시 기본 형식으로 반환
      return NextResponse.json({
        title: "생성된 블로그 포스트",
        content: [result],
        tags: ["블로그", "포스트"],
        footnote: [],
        contentPurpose: contentPurpose
      });
    }

  } catch (error) {
    console.error('블로그 생성 오류:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { 
        error: '블로그 포스트 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 