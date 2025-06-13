"use client";

import React, { useState } from "react";
import { ArrowPathIcon, ClipboardIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";

type BlogContent = {
  title: string;
  content: string[] | string;
  tags: string[];
  footnote?: { sourceName: string; authorOrInstitution: string; url: string; }[];
  contentPurpose?: string;
  cta?: string; // 기존 호환성 유지
} | null;

type BlogResultProps = {
  blogContent: BlogContent;
  onReset: () => void;
};

// 이미지 객체 타입 정의
type ImageContent = {
  imageDepiction: string;
  alttag: string;
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

  // 콘텐츠가 배열인지 문자열인지 확인
  const contentArray = Array.isArray(blogContent.content) ? blogContent.content : [blogContent.content];

  const handleCopy = () => {
    let fullContent = `# ${blogContent.title}\n\n`;
    
    // 콘텐츠 처리
    contentArray.forEach(item => {
      if (typeof item === 'string') {
        fullContent += `${item}\n\n`;
      }
    });
    
    // 각주 추가
    if (blogContent.footnote && blogContent.footnote.length > 0) {
      fullContent += `## 참고자료\n`;
      blogContent.footnote.forEach((ref, index) => {
        fullContent += `[${index + 1}] ${ref.sourceName} - ${ref.authorOrInstitution}\n`;
        if (ref.url) fullContent += `    ${ref.url}\n`;
      });
      fullContent += '\n';
    }
    
    // 태그 추가
    fullContent += `태그: ${blogContent.tags.join(", ")}`;
    
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      // 문서 요소들을 저장할 배열
      const docElements: (Paragraph | Table)[] = [];

      // 제목 추가
      docElements.push(
        new Paragraph({
          text: blogContent.title,
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 }
        })
      );

      // 콘텐츠 처리
      contentArray.forEach(item => {
        if (typeof item === 'string') {
          // h3 태그 처리
          if (item.includes('<h3>')) {
            const h3Match = item.match(/<h3>(.*?)<\/h3>/);
            if (h3Match) {
              const h3Content = h3Match[1];
              docElements.push(
                new Paragraph({
                  text: h3Content,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 300, after: 200 }
                })
              );
            }
          } else if (item.trim()) {
            // 일반 텍스트 문단
            docElements.push(
              new Paragraph({
                children: [new TextRun(item)],
                spacing: { after: 200 }
              })
            );
          }
        } else if (typeof item === 'object' && item !== null && 'imageDepiction' in item && 'alttag' in item) {
          // 이미지 설명 추가 - 1x1 표로 박스 효과
          const imageItem = item as ImageContent;
          
          const imageTable = new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "[이미지 생성 프롬프트]",
                            bold: true,
                            color: "0066CC"
                          })
                        ],
                        spacing: { after: 100 }
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: imageItem.imageDepiction,
                            italics: true,
                            color: "333333"
                          })
                        ]
                      })
                    ],
                    width: {
                      size: 100,
                      type: WidthType.PERCENTAGE
                    },
                    borders: {
                      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
                    },
                    shading: {
                      fill: "F8F9FA"
                    }
                  })
                ]
              })
            ],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE
            }
          });
          
          docElements.push(imageTable);
          
          // 표 다음에 간격 추가
          docElements.push(
            new Paragraph({
              text: "",
              spacing: { after: 200 }
            })
          );
        }
      });

      // 각주 섹션 추가
      if (blogContent.footnote && blogContent.footnote.length > 0) {
        docElements.push(
          new Paragraph({
            text: "참고자료",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          })
        );

        blogContent.footnote.forEach((ref, index) => {
          docElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `[${index + 1}] `,
                  bold: true
                }),
                new TextRun(`${ref.sourceName} - ${ref.authorOrInstitution}`),
                ...(ref.url ? [new TextRun({ text: ` (${ref.url})`, italics: true })] : [])
              ],
              spacing: { after: 100 }
            })
          );
        });
      }

      // 태그 섹션 추가
      if (blogContent.tags && blogContent.tags.length > 0) {
        docElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "태그: ",
                bold: true
              }),
              new TextRun(blogContent.tags.join(", "))
            ],
            spacing: { before: 300 }
          })
        );
      }

      // 문서 생성
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: docElements
          }
        ]
      });

      // 파일 생성 및 다운로드
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      });
      
      const fileName = `${blogContent.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_')}.docx`;
      saveAs(blob, fileName);
      
    } catch (error) {
      console.error('DOCX 다운로드 오류:', error);
      alert('파일 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 콘텐츠 타입별 아이콘과 색상 설정
  const getContentTypeInfo = (purpose?: string) => {
    switch (purpose) {
      case 'news':
        return { 
          label: '기사/이슈형', 
          icon: '📰', 
          bgColor: 'bg-red-50 dark:bg-red-900/30', 
          borderColor: 'border-red-100 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-300'
        };
      case 'insight':
        return { 
          label: '인사이트/칼럼형', 
          icon: '💡', 
          bgColor: 'bg-purple-50 dark:bg-purple-900/30', 
          borderColor: 'border-purple-100 dark:border-purple-800',
          textColor: 'text-purple-800 dark:text-purple-300'
        };
      case 'review':
        return { 
          label: '리뷰/비교형', 
          icon: '⭐', 
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30', 
          borderColor: 'border-yellow-100 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-300'
        };
      case 'information':
        return { 
          label: '정보 제공형', 
          icon: '📖', 
          bgColor: 'bg-green-50 dark:bg-green-900/30', 
          borderColor: 'border-green-100 dark:border-green-800',
          textColor: 'text-green-800 dark:text-green-300'
        };
      default:
        return { 
          label: '일반형', 
          icon: '📝', 
          bgColor: 'bg-blue-50 dark:bg-blue-900/30', 
          borderColor: 'border-blue-100 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-300'
        };
    }
  };

  const contentTypeInfo = getContentTypeInfo(blogContent.contentPurpose);

  // 이미지 객체인지 확인하는 함수
  const isImageContent = (item: any): item is ImageContent => {
    return typeof item === 'object' && item !== null && 'imageDepiction' in item && 'alttag' in item;
  };

  // HTML 콘텐츠를 렌더링하는 함수
  const renderContent = (item: string | ImageContent) => {
    if (isImageContent(item)) {
      return (
        <div className="my-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center mb-3">
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">📷 [이미지 생성 프롬프트]</span>
          </div>
          <div className="pl-4 border-l-2 border-blue-300 dark:border-blue-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">{item.imageDepiction}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Alt 텍스트: {item.alttag}</p>
          </div>
        </div>
      );
    }

    if (typeof item === 'string') {
              // h3 태그 처리 - 볼드처리와 음영처리 적용
        if (item.includes('<h3>')) {
          // h3 태그 내용 추출
          const h3Match = item.match(/<h3>(.*?)<\/h3>/);
          if (h3Match) {
            const h3Content = h3Match[1];
            return (
              <div className="my-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800/50 dark:to-blue-900/30 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-0 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {h3Content}
                </h3>
              </div>
            );
          }
          // 매치되지 않으면 기본 처리
          return <div className="my-4" dangerouslySetInnerHTML={{ __html: item }} />;
        }
      
      // 일반 텍스트 문단
      return <p className="mb-4 leading-relaxed">{item}</p>;
    }

    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">생성된 블로그</h2>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contentTypeInfo.bgColor} ${contentTypeInfo.textColor}`}>
            {contentTypeInfo.icon} {contentTypeInfo.label}
          </span>
        </div>
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
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{blogContent.title}</h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {contentArray.map((item, index) => (
            <div key={index}>
              {renderContent(item)}
            </div>
          ))}
        </div>
        
        {/* 각주 섹션 */}
        {blogContent.footnote && blogContent.footnote.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">참고자료</h3>
            <div className="space-y-2">
              {blogContent.footnote.map((ref, index) => (
                <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">[{index + 1}]</span> {ref.sourceName} - {ref.authorOrInstitution}
                  {ref.url && (
                    <a 
                      href={ref.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      🔗 링크
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 기존 CTA 지원 (하위 호환성) */}
        {blogContent.cta && (
          <div className={`mt-6 p-4 rounded-lg border ${contentTypeInfo.bgColor} ${contentTypeInfo.borderColor}`}>
            <p className={contentTypeInfo.textColor}>{blogContent.cta}</p>
          </div>
        )}
        
        <div className="mt-6 flex flex-wrap gap-2">
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