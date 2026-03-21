import { Composition } from "remotion";
import { PolicyMotion } from "./PolicyMotion";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PolicyMotion"
      component={PolicyMotion}
      durationInFrames={870}
      fps={30}
      width={300}
      height={400}
    />
  );
};
