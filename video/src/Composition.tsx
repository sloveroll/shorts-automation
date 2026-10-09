import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import React from "react";
import { loadFont } from "@remotion/google-fonts/NotoSansKR";

const { fontFamily } = loadFont();
// JSON 데이터를 안전하게 불러옵니다.
const alignment = require("../public/alignment.json");
let scriptData = { title: "그 시절 우리가 사랑했던 추억" };
try {
  scriptData = require("../public/script.json");
} catch (e) {
  console.log("script.json not found, using default title");
}

export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  if (!alignment) {
    return <AbsoluteFill style={{ backgroundColor: "blue", color: "white", fontSize: 50, justifyContent: 'center', alignItems: 'center' }}>Loading Data...</AbsoluteFill>;
  }

  // Calculate current time in seconds
  const currentTime = frame / fps;
  const totalTime = durationInFrames / fps;

  return (
    <AbsoluteFill style={{ backgroundColor: "#111", justifyContent: "center", alignItems: "center" }}>
      {/* 1. 배경 이미지 슬라이드쇼 (3장이 시간에 따라 크로스페이드) */}
      {[0, 1, 2].map((i) => {
        const sectionTime = totalTime / 3;
        const startTime = i * sectionTime;
        const endTime = (i + 1) * sectionTime;
        
        // 부드러운 크로스페이드 효과
        let opacity = 0;
        if (currentTime >= startTime - 1 && currentTime <= endTime + 1) {
          const fadeIn = Math.min(1, currentTime - (startTime - 1));
          const fadeOut = Math.min(1, (endTime + 1) - currentTime);
          opacity = Math.min(fadeIn, fadeOut) * 0.7;
        }

        return (
          <Img 
            key={i}
            src={staticFile(`bg${i}.jpg`)} 
            style={{ 
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
              objectFit: "cover", opacity,
              transform: `scale(${1 + (currentTime * 0.015)})` // 천천히 줌인
            }} 
          />
        );
      })}
      
      {/* 2. 필름 그레인 및 비네팅 (빈티지 시네마틱 효과) */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
        boxShadow: "inset 0 0 300px rgba(0,0,0,0.9)", // 비네팅 (테두리 어둡게)
        background: "url(https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png)", // 무료 노이즈 텍스처
        opacity: 0.15,
        mixBlendMode: "overlay",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* 3-1. 상단 고정 시리즈 제목 (작게) */}
      <div style={{
        position: "absolute",
        top: "8%",
        width: "100%",
        textAlign: "center",
        color: "#FFD700",
        fontSize: "60px",
        fontWeight: "900",
        fontFamily: `${fontFamily}, sans-serif`,
        WebkitTextStroke: "2px black",
        zIndex: 2
      }}>
        [추억 극장] 시니어 공감 100%
      </div>

      {/* 3-2. 썸네일용 초대형 훅 제목 (첫 번째 씬에서만 화면 정중앙 노출!) */}
      <div style={{
        position: "absolute",
        top: "30%",
        width: "95%",
        textAlign: "center",
        color: "#FFD700",
        fontSize: "130px", // 시선을 확 끄는 압도적 크기
        fontWeight: "900",
        fontFamily: `${fontFamily}, sans-serif`,
        lineHeight: "1.3",
        WebkitTextStroke: "4px black", // 뚜렷한 가독성
        textShadow: "8px 8px 20px rgba(0,0,0,1)",
        zIndex: 4,
        // 첫 번째 사진(씬 1)이 나오는 시간 동안만 표시하고 서서히 사라짐
        opacity: currentTime < (totalTime / 3) - 1 ? 1 : 0,
        transition: "opacity 1s ease-in-out"
      }}>
        {scriptData.title}
      </div>

      {/* 4. 오디오 (나레이션 & BGM) */}
      <Audio src={staticFile("audio.mp3")} />
      {/* BGM: 무료 감성 피아노 브금 (볼륨 낮게) */}
      {/* ⚠️ 픽사베이 서버가 깃허브 로봇 접근을 차단(403 에러)하여 렌더링이 실패하므로 주석 처리함. 나중에 public 폴더에 직접 넣는 방식으로 변경 요망 */}
      {/*
      <Audio 
        src="https://cdn.pixabay.com/download/audio/2022/10/25/audio_21421f1d1d.mp3" 
        volume={0.15} 
      />
      */}
      
      {/* 5. 다큐멘터리 스타일 하단 자막 (문장 단위) */}
      <div style={{ position: "absolute", bottom: "12%", display: "flex", justifyContent: "center", alignItems: "center", width: "90%", zIndex: 3 }}>
        {(() => {
          // 1. 글자들을 구(Phrase) 단위로 묶기 (15글자 이상일 때 띄어쓰기에서 줄바꿈)
          const chunks: { text: string; start: number; end: number }[] = [];
          let currentChunk = "";
          let chunkStart = -1;
          const chars = alignment.characters as string[];
          
          for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const start = alignment.character_start_times_seconds[i] as number;
            const end = alignment.character_end_times_seconds[i] as number;
            
            if (char !== " " && char !== "\n") {
              if (currentChunk === "") chunkStart = start;
              currentChunk += char;
            } else if (currentChunk !== "") {
              currentChunk += char; // 띄어쓰기 포함
            }
            
            // 15글자가 넘고 띄어쓰기가 나오거나, 마침표/쉼표 등이 나오면 청크 자르기
            if (
              currentChunk !== "" && 
              ((char === " " && currentChunk.length > 15) || 
               char === "." || char === "," || char === "?" || char === "!" || 
               i === chars.length - 1)
            ) {
              chunks.push({ text: currentChunk.trim(), start: chunkStart, end });
              currentChunk = "";
            }
          }

          // 2. 현재 시간에 해당하는 구문 찾기 (조금 늦게 사라지도록 여유 0.5초 추가)
          const activeChunk = chunks.find(w => currentTime >= w.start && currentTime <= w.end + 0.5);
          
          if (!activeChunk) return null;

          return (
            <span
              style={{
                color: "#FFD700", // 노란색
                fontSize: "75px", // 읽기 편한 사이즈
                fontWeight: "900",
                fontFamily: `${fontFamily}, sans-serif`,
                textAlign: "center",
                WebkitTextStroke: "3px black", // 검은색 뚜렷한 테두리
                textShadow: "6px 6px 15px rgba(0,0,0,1)", // 강한 그림자
              }}
            >
              {activeChunk.text}
            </span>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};
