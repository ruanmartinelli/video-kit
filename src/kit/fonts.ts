import { cancelRender, continueRender, delayRender } from "remotion";
import { theme } from "./theme";

// DOM text (captions, code) must not be measured or drawn before its font is
// in, or renders fall back to a system font. 3D labels load theirs separately.
if (typeof document !== "undefined") {
  const hold = delayRender("Loading kit fonts");
  const faces = [
    new FontFace(theme.sans, `url(${theme.sansFile()})`, { weight: "600" }),
    new FontFace(theme.mono, `url(${theme.monoFile()})`, { weight: "500" }),
  ];
  Promise.all(faces.map((face) => face.load()))
    .then((loaded) => {
      for (const face of loaded) {
        document.fonts.add(face);
      }
      continueRender(hold);
    })
    .catch(cancelRender);
}
