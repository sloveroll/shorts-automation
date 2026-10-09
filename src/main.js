import { generateScript, generateDynamicTopic } from './gemini.js';
import { generateAudioWithTimestamps } from './elevenlabs.js';
import { exec } from 'child_process';
import { generateBackgroundImage } from './image.js';
import util from 'util';
import path from 'path';
import fs from 'fs';

const execPromise = util.promisify(exec);

async function runPipeline(topic) {
  try {
    console.log(`\n🚀 [Step 1] 파이프라인 시작: 주제 "${topic}"`);
    
    // 1. 대본 생성 (Gemini)
    console.log('\n🧠 대본 생성 중 (Gemini)...');
    const scriptJson = await generateScript(topic);
    
    // Remotion 컴포넌트에서 활용할 수 있도록 전체 대본 저장
    fs.writeFileSync(path.join(process.cwd(), 'video', 'public', 'script.json'), JSON.stringify(scriptJson, null, 2));

    // 모든 나레이션을 하나의 텍스트로 합치기 (ElevenLabs 음성 생성용)
    const fullNarration = scriptJson.scenes.map(scene => scene.narration).join(' ');
    console.log('\n📝 생성된 전체 나레이션:\n', fullNarration);
    
    // 3. 각 씬의 시각 연출 지시문을 가져와서 배경 이미지 3장 각각 생성
    console.log('\n🎨 씬별 맞춤 배경 이미지 생성 중 (Pollinations AI)...');
    for (let i = 0; i < scriptJson.scenes.length; i++) {
      if (i >= 3) break; // 최대 3장까지만 처리
      console.log(`- 씬 ${i + 1} 생성 시작...`);
      await generateBackgroundImage(scriptJson.scenes[i].visual, i);
    }
    
    // 2. 음성 및 타임스탬프 추출 (ElevenLabs)
    console.log('\n🎙️ 음성 및 타임스탬프 생성 중 (ElevenLabs)...');
    await generateAudioWithTimestamps(fullNarration);
    
    // 3. 영상 렌더링 (Remotion)
    console.log('\n🎬 영상 렌더링 시작 (Remotion)...');
    const videoDir = path.join(process.cwd(), 'video');
    const outputPath = path.join(process.cwd(), 'final_shorts.mp4');
    
    let renderCommand = `npx remotion render src/index.ts MyComp ../final_shorts.mp4`;
    
    // 로컬 Mac 환경일 때만 내장 크롬 충돌을 피하기 위해 시스템 크롬 강제 할당
    if (process.platform === 'darwin') {
      renderCommand = `NODE_OPTIONS=--dns-result-order=ipv4first npx remotion render src/index.ts MyComp ../final_shorts.mp4 --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"`;
    } else if (process.platform === 'linux') {
      // GitHub Actions (Ubuntu) 에서는 기본 설치된 Chrome 사용
      renderCommand = `npx remotion render src/index.ts MyComp ../final_shorts.mp4 --browser-executable="/usr/bin/google-chrome"`;
    }

    const { stdout, stderr } = await execPromise(renderCommand, {
      cwd: videoDir
    });
    
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log(`\n🎉 모든 작업이 완료되었습니다! 최종 영상: ${outputPath}`);
    
  } catch (error) {
    console.error('\n❌ 파이프라인 실행 중 오류 발생:', error);
    process.exit(1);
  }
}

// 자동화 파이프라인 시작 (인자가 없으면 과거 내역을 바탕으로 AI가 새 주제를 뽑아냄)
async function startAutoPipeline() {
  let topic = process.argv[2];
  
  if (!topic) {
    const usedTopicsPath = path.join(process.cwd(), 'used_topics.txt');
    let usedTopics = [];
    if (fs.existsSync(usedTopicsPath)) {
      const fileContent = fs.readFileSync(usedTopicsPath, 'utf8');
      usedTopics = fileContent.split('\n').filter(t => t.trim() !== '');
    }
    
    // 중복을 피해 끝없이 새 주제를 구상
    topic = await generateDynamicTopic(usedTopics);
    
    // 방금 구상한 주제를 기록해두어 다음 번에 또 쓰지 않도록 방지
    fs.appendFileSync(usedTopicsPath, topic + '\n');
  }
  
  await runPipeline(topic);
}

startAutoPipeline();
