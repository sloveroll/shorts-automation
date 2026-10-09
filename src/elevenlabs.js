import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
export async function generateAudioWithTimestamps(text, voiceId = "jhRwPcHZjcfER84hHhYm") { // 대표님이 선택하신 한국인 성우 목소리
  try {
    console.log('ElevenLabs API 호출 중...');
    
    // ElevenLabs SDK를 사용하여 음성 및 타임스탬프 생성
    // Note: 일부 SDK 버전에서는 with-timestamps가 직관적이지 않을 수 있으므로,
    // 최신 SDK 문서에 따라 사용하거나 fetch API로 대체할 수 있습니다.
    // 여기서는 최신 SDK를 가정합니다.
    
    // 이 방식은 SDK 지원 여부에 따라 달라질 수 있습니다. 
    // SDK 문서가 확실치 않은 경우 fetch API를 사용하는 것이 안전할 수 있습니다.
    // 먼저 SDK 방식으로 시도합니다.
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.35, // 감정 표현을 위해 안정성을 낮춤 (덜 로봇같음)
          similarity_boost: 0.85
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 에러 응답:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // data.audio_base64
    // data.alignment (characters, character_start_times_seconds, character_end_times_seconds)
    
    const audioBuffer = Buffer.from(data.audio_base64, 'base64');
    
    const outputDir = path.join(process.cwd(), 'video', 'public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const audioPath = path.join(outputDir, 'audio.mp3');
    fs.writeFileSync(audioPath, audioBuffer);
    
    const alignmentPath = path.join(outputDir, 'alignment.json');
    fs.writeFileSync(alignmentPath, JSON.stringify(data.alignment, null, 2));
    
    console.log('음성 및 타임스탬프 저장 완료:', { audioPath, alignmentPath });
    
    return { audioPath, alignmentPath, alignment: data.alignment };

  } catch (error) {
    console.error('ElevenLabs 에러:', error);
    throw error;
  }
}

