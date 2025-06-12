import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const promptsFilePath = path.join(process.cwd(), "src/data/prompts.json");

// 프롬프트 데이터 가져오기
export async function GET() {
  try {
    const data = fs.readFileSync(promptsFilePath, "utf-8");
    const prompts = JSON.parse(data);
    
    return NextResponse.json(prompts);
  } catch (error) {
    console.error("프롬프트 로딩 오류:", error);
    return NextResponse.json(
      { error: "프롬프트를 불러오는데 실패했습니다" },
      { status: 500 }
    );
  }
}

// 프롬프트 저장하기
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, system } = body;
    
    if (!key || !system) {
      return NextResponse.json(
        { error: "필수 데이터가 누락되었습니다" },
        { status: 400 }
      );
    }
    
    // 현재 프롬프트 데이터 로드
    const data = fs.readFileSync(promptsFilePath, "utf-8");
    const prompts = JSON.parse(data);
    
    // 프롬프트 업데이트
    prompts[key] = { system };
    
    // 파일 저장
    fs.writeFileSync(promptsFilePath, JSON.stringify(prompts, null, 2), "utf-8");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("프롬프트 저장 오류:", error);
    return NextResponse.json(
      { error: "프롬프트 저장에 실패했습니다" },
      { status: 500 }
    );
  }
} 