export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 24 }}>
        <header style={{ marginBottom: 16 }}>
          <a href="/" style={{ fontWeight: 700, textDecoration: 'none', color: 'black' }}>Buffett OS</a>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

