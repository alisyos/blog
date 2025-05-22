import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const promptsFilePath = path.join(process.cwd(), "src/data/prompts.json");

// 프롬프트 데이터 가져오기
export async function GET() {
  try {
    // 파일이 존재하는지 확인
    if (!fs.existsSync(promptsFilePath)) {
      return NextResponse.json({ error: "Prompts file not found" }, { status: 404 });
    }

    // 파일 읽기
    const fileContents = fs.readFileSync(promptsFilePath, "utf8");
    const promptsData = JSON.parse(fileContents);

    return NextResponse.json(promptsData);
  } catch (error) {
    console.error("Error reading prompts file:", error);
    return NextResponse.json(
      { error: "Failed to read prompts data" },
      { status: 500 }
    );
  }
}

// 프롬프트 저장하기
export async function POST(request: NextRequest) {
  try {
    const { key, system } = await request.json();

    // 유효성 검사
    if (!key || !system) {
      return NextResponse.json(
        { error: "Key and system content are required" },
        { status: 400 }
      );
    }

    // 현재 프롬프트 데이터 읽기
    if (!fs.existsSync(promptsFilePath)) {
      return NextResponse.json(
        { error: "Prompts file not found" },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(promptsFilePath, "utf8");
    const promptsData = JSON.parse(fileContents);

    // 존재하는 프롬프트 키인지 확인
    if (!promptsData[key]) {
      return NextResponse.json(
        { error: "Cannot create new prompts. Only existing prompts can be modified." },
        { status: 403 }
      );
    }

    // 프롬프트 업데이트
    promptsData[key] = { system };

    // 파일에 저장
    fs.writeFileSync(promptsFilePath, JSON.stringify(promptsData, null, 2));

    return NextResponse.json({ success: true, key });
  } catch (error) {
    console.error("Error saving prompt:", error);
    return NextResponse.json(
      { error: "Failed to save prompt" },
      { status: 500 }
    );
  }
} 