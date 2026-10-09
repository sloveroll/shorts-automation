# AI 숏폼 영상 자동화 프로젝트 (Shorts Automation)

## 📌 프로젝트 개요
LLM(대본 생성) ➔ ElevenLabs(음성 및 타임스탬프 추출) ➔ Remotion(영상 렌더링) 파이프라인을 코드로 구축하여, 유튜브 쇼츠 영상 제작을 100% 자동화하는 프로젝트입니다.

---

## 🚀 핵심 아키텍처 (파이프라인)

### 1. 대본 자동화 (Gemini / OpenAI API)
- 프롬프트를 통해 40~60초 분량의 쇼츠 대본(후킹, 본문, 클로징) 자동 생성
- AI가 생성한 결과물에서 지시문(화면 연출)과 나레이션 텍스트를 분리하여 JSON 형태로 반환

### 2. 음성 & 타임스탬프 추출 (ElevenLabs API)
- 나레이션 텍스트를 ElevenLabs API로 전송하여 고품질 AI 음성(`.mp3`) 파일 획득
- **핵심 포인트**: 텍스트의 각 단어/글자별 발음 시간(**Timestamps**) 데이터를 함께 받아옵니다. 캡컷의 부정확한 자동 자막(STT)을 완벽하게 대체할 수 있습니다.

### 3. 영상 렌더링 및 자막 싱크 (Remotion)
- React 기반 영상 렌더링 라이브러리인 **Remotion** 사용
- ElevenLabs에서 받아온 Timestamps 배열을 React 컴포넌트(자막 UI)에 매핑하여 정확한 시간에 화면에 노출
- 배경 이미지와 목소리, 자막을 합쳐서 최종 `.mp4` 파일로 자동 추출

---

## 🛠️ 개발 진행 마일스톤 (Next Steps)

- [x] **Step 1:** 프로젝트 폴더 생성 및 초기 세팅 (Node.js / React)
- [x] **Step 2:** ElevenLabs API 연동 (mp3 파일 및 Timestamps 데이터 받아오기 테스트)
- [x] **Step 3:** Remotion 프로젝트 셋업 및 빈 화면 렌더링 테스트
- [x] **Step 4:** Timestamps 데이터를 기반으로 Remotion 자막 컴포넌트 동적 싱크 맞추기
- [x] **Step 5:** Gemini API를 붙여서 대본부터 영상까지 한 번에 뽑히는 전체 파이프라인 통합
