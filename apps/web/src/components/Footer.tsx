export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-dark-lighter/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Rapper Toon Sheet. All rights reserved.</p>
          <p className="text-sm mt-2">Generate stylized character reference sheets from your photos</p>
        </div>
      </div>
    </footer>
  );
}
