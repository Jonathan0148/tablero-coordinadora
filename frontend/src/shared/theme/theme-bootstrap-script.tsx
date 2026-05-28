import { buildThemeBootstrapScript } from "@/shared/theme/apply-theme";

export function ThemeBootstrapScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }}
    />
  );
}
