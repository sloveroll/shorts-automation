import { Composition } from "remotion";
import { MyComponent } from "./Composition";

// JSON 파일에서 오디오 길이 계산 (가장 마지막 글자가 끝나는 시간 기준 + 1초 여유)
const alignment = require("../public/alignment.json");
const lastEndTime = alignment?.character_end_times_seconds?.slice(-1)[0] || 5;
const totalFrames = Math.ceil((lastEndTime + 1.5) * 30); // 1.5초 여유시간 포함 (30fps)

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComponent}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
