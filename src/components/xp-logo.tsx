import Svg, { Path } from 'react-native-svg';

/** Compact RightCom XP-inspired mark, drawn locally to avoid a remote logo dependency. */
export function XpLogo({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Path d="M15 16 H39 L27 34 Z M15 84 H39 L27 66 Z M40 16 H62 L40 84 H18 Z" fill="#0877ED" />
      <Path d="M48 16 H70 C91 16 91 53 70 53 H61 V84 H48 Z M61 32 V38 H69 C74 38 74 32 69 32 Z" fill="#0877ED" />
    </Svg>
  );
}
