import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export async function generateBackgroundImage(visualPrompt, index = 0) {
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-3.5-flash-lite",
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineer for AI image generation. Convert the following Korean scene description into a highly detailed English prompt suitable for generating a nostalgic 1970s-1980s South Korean vintage photo.\n\nCRITICAL RULE: The image MUST look like an authentic, unedited amateur photograph taken with a cheap 35mm disposable camera in the 70s. It MUST NOT look like an AI generated image, 3D render, or professional glossy photography. Include keywords: extreme photorealism, amateur photography, blurry motion, harsh flash, faded polaroid, bad lighting, authentic historical snapshot, gritty, raw, unedited, not AI."
        },
        {
          role: "user",
          content: visualPrompt
        }
      ]
    });

    const messageContent = response.choices[0].message?.content || "";
    if (!messageContent) {
      console.log(`[Image ${index}] API 응답 본문이 비어있거나 차단되었습니다. 응답 객체:`, JSON.stringify(response, null, 2));
      throw new Error("Gemini 응답 텍스트가 비어있습니다.");
    }
    const englishPrompt = messageContent.trim();
    console.log(`[Image ${index}] 번역된 프롬프트: ${englishPrompt}`);

    const outputDir = path.join(process.cwd(), 'video', 'public');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`[Image ${index}] AI 실사 이미지 생성 중 (Fal.ai Flux 1.Dev)...`);
    
    // 실사화 퀄리티를 극대화하기 위한 프롬프트 보정
    const fluxPrompt = englishPrompt + ", Extreme photorealism, visible skin pores, heavy analog film grain, faded retro colors, nostalgic vintage 35mm photography, cinematic lighting, masterpiece";

    const falResponse = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: fluxPrompt,
        image_size: "portrait_16_9",
        num_inference_steps: 28,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: false
      })
    });

    if (!falResponse.ok) {
      const errorText = await falResponse.text();
      console.log(`[Image ${index}] Fal API 에러:`, errorText);
      throw new Error(`Fal API 거부됨 (${falResponse.status})`);
    }

    const falData = await falResponse.json();
    const imageUrl = falData.images[0].url;
    
    const imageResponse = await fetch(imageUrl);
    const buffer = await imageResponse.arrayBuffer();
    const bgPath = path.join(outputDir, `bg${index}.jpg`);
    fs.writeFileSync(bgPath, Buffer.from(buffer));
    
    console.log(`[Image ${index}] 배경 이미지 저장 완료: ${bgPath}`);
    return bgPath;
    
  } catch (error) {
    console.error(`[Image ${index}] 에러:`, error);
    throw error;
  }
}
