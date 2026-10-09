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
주어진 주제를 바탕으로 기승전결이 완벽한, 눈물샘을 자극하는 감동적인 쇼츠(Shorts) 대본을 작성하세요.

[대본 작성 핵심 노하우]
1. 완벽한 기승전결 스토리텔링: 대본이 뚝뚝 끊기면 안 됩니다. 씬 1, 2, 3이 하나의 자연스럽고 감동적인 옛날이야기처럼 물 흐르듯 이어져야 합니다. 억지로 했던 말을 반복하지 마세요.
2. 미친 3초 후킹 (씬 1): 시청자의 공감을 확 끌어내는 질문이나 강렬한 상황 묘사로 시작하세요. (예: "70년대, 뼈 빠지게 일해 번 첫 월급을 통째로 날렸던 그날을 기억하십니까?")
3. 소름 돋는 디테일 (씬 2): 가난, 서러움, 따뜻한 정 등 오감이 느껴지도록 구체적으로 회상하세요.
4. 자연스러운 클로징과 댓글 유도 (씬 3): 감동적으로 이야기를 마무리 지으며, 극의 흐름을 깨지 않는 선에서 자연스럽게 "그 시절이 그립다면 댓글로 여러분의 이야기를 들려주세요"라고 유도하세요. (절대 첫 문장을 억지로 다시 붙여넣는 기계적인 무한 루프를 만들지 마세요!!)
5. 호흡과 구어체: 다큐멘터리 성우처럼 정중하지만 친근한 구어체(~습니다, ~하셨죠?)를 사용하세요. 

[시각 연출 (Visual 프롬프트) 절대 규칙]
- Fal.ai Flux가 넷플릭스 다큐멘터리급 압도적 실사 사진을 뽑아내도록 **매우 디테일한 영어 프롬프트** 작성.
- 필수 키워드: 1970s South Korea (또는 60s/80s), extreme photorealism, cinematic lighting, dramatic shadows, deeply emotional facial expression, tearful eyes, analog film grain, masterpiece
- 인물의 주름, 낡은 옷, 감정이 렌즈를 뚫고 나오도록 지시하세요.

4. 출력 형식: 무조건 아래 JSON 형식만 반환하세요. 배열 길이는 정확히 3이어야 합니다.
{
  "title": "클릭할 수밖에 없는 어그로 폭발 쇼츠 제목",
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
시니어들의 눈물샘(향수, 가난, 서러움, 어머니의 희생), 도파민(첫사랑, 금기, 일탈), 억눌린 한을 미친 듯이 자극하여 무조건 클릭하게 만드는 '초강력 어그로' 주제를 기획하세요.

[주제 기획 절대 원칙]
1. 단순하고 뻔한 사물("70년대 교복")은 안 됩니다. 반드시 스토리가 담긴 자극적이고 구체적인 상황이어야 합니다.
2. 강력한 예시:
   - "70년대 통행금지 야간열차에서 벌어진 숨 막히는 청춘들의 비밀"
   - "가난해서 쥐약을 먹여야 했던 60년대 보릿고개 어머니의 피눈물"
   - "촌지 안 준다고 마구잡이로 뺨 때리던 80년대 국민학교 호랑이 선생님"
   - "손발이 터지도록 연탄재 나르던 그 시절 며느리들의 서러운 시집살이"
3. 반드시 이전에 사용된 주제와 겹치지 않아야 합니다.

[이전에 사용된 주제들 - 절대 중복 금지]
${usedTopicsText}

다른 설명은 절대 하지 말고 반드시 아래 JSON 형식으로 딱 1문장만 반환하세요.
{ "topic": "초강력 자극적 추억 쇼츠 주제 1문장" }`
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
