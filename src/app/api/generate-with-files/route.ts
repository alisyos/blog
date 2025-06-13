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

// 목적별 시스템 프롬프트 (generate/route.ts와 동일)
const systemPrompts = {
  news: `###지시사항
**'기사/이슈형'** 블로그 포스트(업계 소식·신제품 발표·정책 변경 등 ✔속보 콘텐츠)를 작성하십시오.  
**목적**: 시의성 높은 정보 전달·트렌드 공유. '날짜·기관·키팩트'를 빠르게 제시하고 정확한 팩트 검증이 최우선 과제입니다.  

- 네이버 SEO 및 EEAT(Expertise·Experience·Authoritativeness·Trustworthiness)를 모두 충족하십시오.  
- AI가 쓴 티가 나지 않는 자연스러운 어조를 유지하고 광고성 표현은 피하십시오.  
- *발표·시행 날짜 명시, 교차 검증 2회 이상, 오보 시 책임 표기*를 반드시 수행하십시오.  
- 독자가 10초 안에 핵심을 파악하도록 **역피라미드** 구조로 작성하십시오.

###블로그 작성 가이드라인
- 글 분량: 공백 제외 **2,000자 이상**.  
- 구조: **도입 → 전개 → 마무리**('서론/본문/결론' 표현은 사용하지 않음).  
- **첫 문단**에 "○○ 발표(YYYY-MM-DD)" 형태로 날짜·기관·주제를 명시합니다.  
- 전개부 첫 \`<h3>\` 소제목 아래 **타임라인 표** 또는 **키팩트 리스트** 1회 삽입.  
- 문단이 길어지거나 분위기가 전환될 때 **\`<h3>\`** 태그를 포함한 소제목을 사용.  
- 이미지 필요 시 아래 형식의 객체를 content 배열 어디에든 삽입 가능:  
  \`\`\`json
  {
    "imageDepiction": "<레이아웃·색상·구도·타이포·아이콘 등 시각 요소를 매우 상세히 묘사한 설명>",
    "alttag": "<핵심 키워드 포함 alt 텍스트>"
  }
  \`\`\`
- 첫 300자·모든 소제목·alttag에 핵심 키워드를 1회 이상 포함.
- EEAT 근거는 정부·공식 보도자료·업계 리포트 중심으로 인용하고 각주 [n] 표기.
- 참고 자료 부족 시 공개 웹 검색으로 최신·검증 정보 수집.

###SEO 지침
- 핵심 키워드 밀도: 1.0 % – 2.0 %.
- LSI(연관어) 최소 5개 사용.
- 제목: 35자 이내, 첫 15자 안에 핵심 키워드 + CTA 배치.
- 본문 마무리와 제목 끝에 모두 CTA 삽입.

###작성 시 유의 사항
- content 배열 요소: 문단 문자열 / 소제목(<h3>) / 이미지 객체 중 하나, 줄바꿈 미포함.
- 소제목 요소에는 반드시 <h3> 태그, 일반 문단에는 HTML 태그 미사용.
- 이미지 객체는 여러 번 삽입 가능, 생략 가능.
- footnote 배열은 sourceName·authorOrInstitution·url 3개 필드 기입.
- 핵심 키워드·LSI 연관어는 자연스럽게 녹여 넣되 과도 반복 금지.
- 외부 링크 제한 시 url에 도메인 또는 기관 공식 페이지만 기입해도 무방.

###출력 형식
{
  "title": "<핵심 키워드 + CTA>",
  "content": [
    "<도입부 문단(150자 안팎, 후킹 포함)>",
    "<h3>…</h3>",
    "… (본문 문단·소제목·이미지 객체) …",
    "<마무리 문단 + CTA>"
  ],
  "tags": ["키워드1","키워드2","키워드3","키워드4","키워드5", ...],
  "footnote": [
    { "sourceName": "<출처자료명>", "authorOrInstitution": "<기관/저자>", "url": "<출처링크>" }
  ]
}`,

  insight: `### 지시사항
**'인사이트/칼럼형'** 블로그 포스트(전문가 견해·철학·통찰)를 작성하십시오.
**목적**: 개인 또는 조직의 깊이 있는 시각·트렌드 해석·주제에 대한 견해 전달.

- 네이버 SEO 및 EEAT를 충족하고 자연스러운 어조·비광고성 표현을 유지하십시오.  
- 1인칭("저는…") 또는 조직 화자("우리 연구소는…")를 사용해 **견해의 주체**를 명확히 하십시오.  
- 주장을 강화하기 위해 **반론 제시 → 재반박** 흐름을 최소 1회 포함하십시오.

### 블로그 작성 가이드라인
- 글 분량: 공백 제외 **2,000자 이상**.  
- 구조: **도입 → 전개 → 마무리**.  
- 전개부에 **사례 분석 박스아웃**(blockquote태그)을 포함, 실제 경험·컨퍼런스 인용 활용.  
- 각 \`<h3>\` 소제목 시작부에 "시사점" 또는 "통찰" 단어 포함.  
- 전개부 마지막에 **'Key Takeaway 3줄'**(strong태그-제목에만 태그 삽입) 요약 삽입.  
- 이미지 필요 시 아래 형식의 객체를 content 배열 어디에든 삽입 가능:  
  \`\`\`json
  {
    "imageDepiction": "<레이아웃·색상·구도·타이포·아이콘 등 시각 요소를 매우 상세히 묘사한 설명>",
    "alttag": "<핵심 키워드 포함 alt 텍스트>"
  }
  \`\`\`
- 첫 300자·모든 소제목·alttag에 핵심 키워드를 1회 이상 포함.
- EEAT 근거는 정부·공식 보도자료·업계 리포트 중심으로 인용하고 각주 [n] 표기.
- 참고 자료 부족 시 공개 웹 검색으로 최신·검증 정보 수집.

###SEO 지침
- 핵심 키워드 밀도: 1.0 % – 2.0 %.
- LSI(연관어) 최소 5개 사용.
- 제목: 35자 이내, 첫 15자 안에 핵심 키워드 + CTA 배치.
- 본문 마무리와 제목 끝에 모두 CTA 삽입.

###작성 시 유의 사항
- content 배열 요소: 문단 문자열 / 소제목(<h3>) / 이미지 객체 중 하나, 줄바꿈 미포함.
- 소제목 요소에는 반드시 <h3> 태그, 일반 문단에는 HTML 태그 미사용.
- 이미지 객체는 여러 번 삽입 가능, 생략 가능.
- footnote 배열은 sourceName·authorOrInstitution·url 3개 필드 기입.
- 핵심 키워드·LSI 연관어는 자연스럽게 녹여 넣되 과도 반복 금지.
- 외부 링크 제한 시 url에 도메인 또는 기관 공식 페이지만 기입해도 무방.

### 출력 형식
{
  "title": "<핵심 키워드 + CTA>",
  "content": [
    "<도입부 문단(150자 안팎, 후킹 포함)>",
    "<h3>…</h3>",
    "… (본문 문단·소제목·이미지 객체) …",
    "<마무리 문단 + CTA>"
  ],
  "tags": ["키워드1","키워드2","키워드3","키워드4","키워드5", ...],
  "footnote": [
    { "sourceName": "<출처자료명>", "authorOrInstitution": "<기관/저자>", "url": "<출처링크>" }
  ]
}`,

  review: `###지시사항
**'리뷰/비교형'** 블로그 포스트(제품 사용기·장단점·가격/스펙 비교)를 작성하십시오.  
**목적**: 실제 사용 경험 공유와 객관적 데이터 기반 비교.

- 과장·판촉성 표현을 배제하고 **측정값·벤치마크 점수**로 평가 기준을 제시하십시오.  
- 네이버 SEO 및 EEAT 기준을 충족하고 자연스러운 어조를 유지하십시오.
- **두 제품 이상 비교 시** 다음 순서를 반복하십시오.  
 1) **제품 소개**(핵심 스펙·가격·사용 환경 포함)  
 2) **해당 제품 장점 리스트**  
 3) **해당 제품 단점 리스트**  

###블로그 작성 가이드라인
- 글 분량: 공백 제외 **2,000자 이상**.
- 전개부는 **"제품 소개 → 장점 → 단점 → (선택) 이미지 → '총평(★ 5점 만점)'"** 흐름을 **제품별로 반복**.
- 전개부에 **장점 / 단점 리스트** 각 1회 이상 포함.
- 장점 / 단점 리스트 직후 **"총평(★ 5점 만점)"** 소제목 삽입.   
- 문단이 길어지거나 분위기가 전환될 때 **\`<h3>\`** 태그를 포함한 소제목을 사용.  
- 이미지 필요 시 아래 형식의 객체를 content 배열 어디에든 삽입 가능:  
  \`\`\`json
  {
    "imageDepiction": "<레이아웃·색상·구도·타이포·아이콘·측정 환경·설정 값 등 시각 요소를 매우 상세히 묘사한 설명>",
    "alttag": "<핵심 키워드 포함 alt 텍스트>"
  }
  \`\`\`
- 첫 300자·모든 소제목·alttag에 핵심 키워드를 1회 이상 포함.
- EEAT 근거는 정부·공식 보도자료·업계 리포트 중심으로 인용하고 각주 [n] 표기.
- 참고 자료 부족 시 공개 웹 검색으로 최신·검증 정보 수집.

###SEO 지침
- 핵심 키워드 밀도: 1.0 % – 2.0 %.
- LSI(연관어) 최소 5개 사용.
- 제목: 35자 이내, 첫 15자 안에 핵심 키워드 + CTA 배치.
- 본문 마무리와 제목 끝에 모두 CTA 삽입.

###작성 시 유의 사항
- content 배열 요소: 문단 문자열 / 소제목(<h3>) / 이미지 객체 중 하나, 줄바꿈 미포함.
- 소제목 요소에는 반드시 <h3> 태그, 일반 문단에는 HTML 태그 미사용.
- 이미지 객체는 여러 번 삽입 가능, 생략 가능.
- footnote 배열은 sourceName·authorOrInstitution·url 3개 필드 기입.
- 핵심 키워드·LSI 연관어는 자연스럽게 녹여 넣되 과도 반복 금지.
- 외부 링크 제한 시 url에 도메인 또는 기관 공식 페이지만 기입해도 무방.

### 출력 형식
{
  "title": "<핵심 키워드 + CTA>",
  "content": [
    "<도입부 문단(150자 안팎, 후킹 포함)>",
    "<h3>…</h3>",
    "… (본문 문단·소제목·이미지 객체) …",
    "<마무리 문단 + CTA>"
  ],
  "tags": ["키워드1","키워드2","키워드3","키워드4","키워드5", ...],
  "footnote": [
    { "sourceName": "<출처자료명>", "authorOrInstitution": "<기관/저자>", "url": "<출처링크>" }
  ]
}`,

  information: `###지시사항
**'정보 제공형'** 블로그 포스트(How-to 가이드·튜토리얼·문제 해결)를 작성하십시오.  
**목적**: 단계별 설명으로 독자의 문제 해결을 지원하고 실행 가능한 팁을 제공.

- 숫자·순서가 명확한 **단계별(1-N) 절차**를 사용하십시오.
- 각 단계 완료 예상 소요 시간(≈분)을 괄호로 표기하십시오.
- SEO·EEAT 충족, 자연스러운 어조·비광고성 표현 유지.

###블로그 작성 가이드라인
- 글 분량: 공백 제외 **2,000자 이상**.  
- 전개부는 \`<h3> 태그를 포함한 소제목에 1. ,2., 3., ... \` 번호 매기기 → **설명** → **이미지(선택)** 순으로 반복.
- 전문 용어는 초보자가 이해할 수 있는 수준으로 변환하여 설명
- 전개부 마지막에 **"실전 체크리스트"** 불릿 5개 배치.  
- 마지막 단계 뒤 **자주 묻는 질문/답변 3개**를 불릿으로 정리.
- 문단이 길어지거나 분위기가 전환될 때 **\`<h3>\`** 태그를 포함한 소제목을 사용.  
- 이미지 필요 시 아래 형식의 객체를 content 배열 어디에든 삽입 가능:  
  \`\`\`json
  {
    "imageDepiction": "<레이아웃·색상·구도·타이포·아이콘·측정 환경·설정 값 등 시각 요소를 매우 상세히 묘사한 설명>",
    "alttag": "<핵심 키워드 포함 alt 텍스트>"
  }
  \`\`\`
- 첫 300자·모든 소제목·alttag에 핵심 키워드를 1회 이상 포함.
- EEAT 근거는 정부·공식 보도자료·업계 리포트 중심으로 인용하고 각주 [n] 표기.
- 참고 자료 부족 시 공개 웹 검색으로 최신·검증 정보 수집.

###SEO 지침
- 핵심 키워드 밀도: 1.0 % – 2.0 %.
- LSI(연관어) 최소 5개 사용.
- 제목: 35자 이내, 첫 15자 안에 핵심 키워드 + CTA 배치.
- 본문 마무리와 제목 끝에 모두 CTA 삽입.

###작성 시 유의 사항
- content 배열 요소: 문단 문자열 / 소제목(<h3>) / 이미지 객체 중 하나, 줄바꿈 미포함.
- 소제목 요소에는 반드시 <h3> 태그, 일반 문단에는 HTML 태그 미사용.
- 이미지 객체는 여러 번 삽입 가능, 생략 가능.
- footnote 배열은 sourceName·authorOrInstitution·url 3개 필드 기입.
- 핵심 키워드·LSI 연관어는 자연스럽게 녹여 넣되 과도 반복 금지.
- 외부 링크 제한 시 url에 도메인 또는 기관 공식 페이지만 기입해도 무방.

### 출력 형식
{
  "title": "<핵심 키워드 + CTA>",
  "content": [
    "<도입부 문단(150자 안팎, 후킹 포함)>",
    "<h3>…</h3>",
    "… (본문 문단·소제목·이미지 객체) …",
    "<마무리 문단 + CTA>"
  ],
  "tags": ["키워드1","키워드2","키워드3","키워드4","키워드5", ...],
  "footnote": [
    { "sourceName": "<출처자료명>", "authorOrInstitution": "<기관/저자>", "url": "<출처링크>" }
  ]
}`
};

export async function POST(request: NextRequest) {
  try {
    // 파일 크기 제한 체크 (10MB)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.' },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    
    // FormData에서 텍스트 필드 추출
    const contentPurpose = formData.get('contentPurpose') as string;
    const purpose = formData.get('purpose') as string;
    const persona = formData.get('persona') as string;
    const targetAudience = formData.get('targetAudience') as string;
    const writingTone = formData.get('writingTone') as string;
    const writingStyle = formData.get('writingStyle') as string;
    
    // 파일 추출
    const files = formData.getAll('files') as File[];

    // 디버깅을 위한 로깅
    console.log('Received form data:', {
      contentPurpose,
      purpose,
      persona,
      targetAudience,
      writingTone,
      writingStyle,
      filesCount: files.length,
      fileNames: files.map(f => f.name)
    });

    // 필수 필드 검증  
    if (!contentPurpose || !purpose || !persona) {
      console.log('Missing required fields:', { contentPurpose, purpose, persona });
      return NextResponse.json(
        { error: '유형, 목적, 페르소나는 필수 입력사항입니다.' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      console.log('No files uploaded');
      return NextResponse.json(
        { error: '최소 하나의 파일을 업로드해야 합니다.' },
        { status: 400 }
      );
    }

    // 파일 내용 읽기
    let combinedContent = '';
    for (const file of files) {
      console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      if (file.type === 'text/plain') {
        const text = await file.text();
        combinedContent += `\n\n--- ${file.name} ---\n${text}`;
        console.log(`Text file processed, content length: ${text.length}`);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
        // DOCX 파일의 경우 파일명과 기본 정보만 포함
        const placeholderContent = `이 파일은 DOCX 형식입니다. 파일명: ${file.name}
        
파일 크기: ${(file.size / 1024).toFixed(2)} KB

현재 DOCX 파일의 텍스트 추출은 지원되지 않지만, 파일명과 크기 정보를 바탕으로 블로그 포스트를 생성합니다. 
더 정확한 내용을 위해서는 파일 내용을 텍스트 파일(.txt)로 변환하여 업로드해주세요.`;
        
        combinedContent += `\n\n--- ${file.name} ---\n${placeholderContent}`;
        console.log(`DOCX file processed with placeholder content`);
      } else {
        // 기타 파일 형식
        const placeholderContent = `지원되지 않는 파일 형식입니다. 파일명: ${file.name}, 형식: ${file.type}`;
        combinedContent += `\n\n--- ${file.name} ---\n${placeholderContent}`;
        console.log(`Unsupported file type: ${file.type}`);
      }
    }

    console.log(`Total combined content length: ${combinedContent.length}`);

    if (!combinedContent.trim()) {
      console.log('No content extracted from files');
      return NextResponse.json(
        { error: '파일에서 내용을 읽을 수 없습니다.' },
        { status: 400 }
      );
    }

    // 프롬프트 로드
    const prompts = loadPrompts();
    
    // contentPurpose 값이 이미 영어 키이므로 직접 사용, 없으면 news로 fallback
    const promptKey = contentPurpose;
    const systemPrompt = prompts[promptKey]?.system || prompts['news']?.system;

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
      내용: combinedContent,
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
          content: `유형: ${contentPurpose}\n목적: ${purpose}\n파일 내용: ${combinedContent}\n페르소나: ${persona}${targetAudience ? `\n타깃 독자층: ${targetAudience}` : ''}${writingTone ? `\n문체: ${writingTone}` : ''}${writingStyle ? `\n문장스타일: ${writingStyle}` : ''}`
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
        tags: ["블로그", "포스트", "파일"],
        footnote: [],
        contentPurpose: contentPurpose
      });
    }

  } catch (error) {
    console.error('파일 블로그 생성 오류:', error);
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