import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI SDK를 사용하여 Gemini API 호출 (Gemini도 OpenAI 호환 API 제공)
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export async function generateScript(topic) {
  try {
    console.log(`[Gemini] "${topic}" 주제로 대본 생성 중...`);
    
    const response = await openai.chat.completions.create({
      model: "gemini-3.5-flash-lite",
      messages: [
        {
          role: "system",
          content: `당신은 월 수익 1억 원을 찍는 5070 시니어 타겟 추억 회상 유튜브 채널의 천재 대본 작가입니다.
주어진 주제를 바탕으로 기승전결이 완벽한, 아련하고 마음이 따뜻해지는 감성적인 추억 회상 쇼츠(Shorts) 대본을 작성하세요.

[대본 작성 핵심 노하우]
1. 완벽한 기승전결 스토리텔링: 대본이 뚝뚝 끊기면 안 됩니다. 씬 1, 2, 3이 하나의 자연스럽고 따뜻한 옛날이야기처럼 물 흐르듯 이어져야 합니다. 억지로 했던 말을 반복하지 마세요.
2. 미친 3초 후킹 (씬 1): 시청자의 공감을 확 끌어내는 질문이나 강렬한 추억 소환으로 시작하세요. (예: "70년대, 해질녘 골목길에서 엄마가 부를 때까지 뛰놀던 그 시절을 기억하십니까?")
3. 생생한 디테일 (씬 2): 그 시절의 정겨운 소리, 냄새, 순수했던 장난(고무줄놀이, 딱지치기 등) 등 오감이 느껴지도록 구체적으로 회상하세요.
4. 자연스러운 클로징과 댓글 유도 (씬 3): 감동적으로 이야기를 마무리 지으며, 극의 흐름을 깨지 않는 선에서 자연스럽게 "그 시절이 그립다면 댓글로 여러분의 이야기를 들려주세요"라고 유도하세요. (절대 첫 문장을 억지로 다시 붙여넣는 기계적인 무한 루프를 만들지 마세요!!)
5. 호흡과 구어체: 정중하면서도 친근하고 그리움이 묻어나는 구어체(~습니다, ~하셨죠?)를 사용하세요. 

[시각 연출 (Visual 프롬프트) 절대 규칙]
- Fal.ai Flux가 넷플릭스 다큐멘터리급 압도적 실사 사진을 뽑아내도록 **매우 디테일한 영어 프롬프트** 작성.
- 필수 키워드: 1970s South Korea (또는 60s/80s), extreme photorealism, cinematic lighting, warm sunlight, nostalgic and happy atmosphere, smiling children or warm neighbors, analog film grain, masterpiece
- 인물들의 천진난만한 표정, 옛날 골목길이나 교실의 정겨운 분위기가 렌즈를 뚫고 나오도록 지시하세요.

4. 출력 형식: 무조건 아래 JSON 형식만 반환하세요. 배열 길이는 정확히 3이어야 합니다.
{
  "title": "클릭할 수밖에 없는 감성 폭발 쇼츠 제목",
  "scenes": [
    { "visual": "씬 1 영어 프롬프트", "narration": "씬 1 한국어 나레이션 (자연스러운 시작)" },
    { "visual": "씬 2 영어 프롬프트", "narration": "씬 2 한국어 나레이션 (깊이 있는 회상)" },
    { "visual": "씬 3 영어 프롬프트", "narration": "씬 3 한국어 나레이션 (감동적인 마무리와 자연스러운 질문)" }
  ]
}`
        },
        {
          role: "user",
          content: `주제: ${topic}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const jsonResult = JSON.parse(content);
    
    console.log('[Gemini] 대본 생성 완료');
    return jsonResult;
  } catch (error) {
    console.error('[Gemini] 대본 생성 에러:', error);
    throw error;
  }
}

export async function generateDynamicTopic(usedTopics) {
  try {
    console.log('[Gemini] 새로운 자극적인 추억 쇼츠 주제를 구상 중...');
    
    let usedTopicsText = "사용한 적 없음";
    if (usedTopics && usedTopics.length > 0) {
      usedTopicsText = usedTopics.join(", ");
    }
    
    const response = await openai.chat.completions.create({
      model: "gemini-3.5-flash-lite",
      messages: [
        {
          role: "system",
          content: `당신은 월 수익 1억 원을 찍는 5070 타겟 전문 유튜브 기획자입니다.
시니어들의 가슴 뭉클한 향수와 어린 시절의 아름다운 추억(고무줄놀이, 숨바꼭질, 난로 위 양은 도시락, 골목길 팽이치기 등)을 끄집어내어 무조건 클릭하게 만드는 '따뜻하고 정겨운' 주제를 기획하세요.

[주제 기획 절대 원칙]
1. 너무 무겁거나 비극적인 내용(가난, 서러움, 피눈물 등)은 피하고, 그 시절의 순수함, 정겨움, 소소한 장난거리, 따뜻했던 이웃들의 모습 등 스토리가 담긴 구체적인 상황이어야 합니다.
2. 강력한 예시:
   - "해질녘 엄마가 밥 먹으라고 부를 때까지 시간 가는 줄 몰랐던 골목길 숨바꼭질"
   - "겨울철 교실 난로 위에 올려두었던 누룽지가 섞인 따뜻한 양은 도시락의 추억"
   - "동네 골목 대장을 가리던 치열했던 딱지치기와 팽이싸움"
   - "고무줄 끊고 도망가던 남학생들을 끝까지 쫓아가던 그 시절 왈가닥 소녀들"
3. 반드시 이전에 사용된 주제와 겹치지 않아야 합니다.

[이전에 사용된 주제들 - 절대 중복 금지]
${usedTopicsText}

다른 설명은 절대 하지 말고 반드시 아래 JSON 형식으로 딱 1문장만 반환하세요.
{ "topic": "가슴 따뜻해지는 감성 추억 쇼츠 주제 1문장" }`
        },
        {
          role: "user",
          content: "새롭고 미친듯이 자극적인 쇼츠 주제를 딱 하나만 뽑아주세요."
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const jsonResult = JSON.parse(content);
    console.log(`[Gemini] 구상된 새 주제: "${jsonResult.topic}"`);
    return jsonResult.topic;
  } catch (error) {
    console.error('[Gemini] 주제 구상 에러:', error);
    throw error;
  }
}
