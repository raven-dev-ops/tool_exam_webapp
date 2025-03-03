// app/layout.js (Server Component)
import "./globals.css";
import SessionProviderWrapper from "../components/session-provider-wrapper";

// Provide metadata for Next.js 13 => mobile responsiveness
export const metadata = {
  title: "Discipleship Assessment",
  description: "Your pathway to understanding faith.",
  viewport: "width=device-width, initial-scale=1.0", // Key for mobile scaling
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>
          <div className="fade-container">
            {children}
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
