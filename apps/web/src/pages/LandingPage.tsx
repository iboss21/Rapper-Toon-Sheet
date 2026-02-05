import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, Palette, ChevronDown } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-light via-primary to-primary-dark bg-clip-text text-transparent">
              Rapper Toon Sheet
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Transform your photos into stunning character reference sheets for animated rap music videos
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/create" className="btn-primary text-lg px-8 py-4">
                <Sparkles className="w-5 h-5 mr-2 inline" />
                Create Your Sheet
              </Link>
              <a href="#examples" className="btn-secondary text-lg px-8 py-4">
                View Examples
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-12 animate-bounce">
          <ChevronDown className="w-8 h-8 mx-auto text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-dark-lighter/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Professional Character Sheets in Minutes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fast Generation</h3>
              <p className="text-gray-400">
                Get your complete character reference sheet in minutes, not hours
              </p>
            </div>
            <div className="card text-center">
              <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multiple Styles</h3>
              <p className="text-gray-400">
                Choose from cartoon realism, anime, comic ink, or cell-shade styles
              </p>
            </div>
            <div className="card text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Face Consistency</h3>
              <p className="text-gray-400">
                Advanced AI ensures your character looks the same from every angle
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Gallery */}
      <section id="examples" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Example Character Sheets
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card group cursor-pointer hover:border-primary transition-colors">
                <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-dark-light rounded-lg mb-4 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-primary/50 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-semibold">Example Character {i}</h3>
                <p className="text-sm text-gray-400">Cartoon Realism Style</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Placeholder */}
      <section className="py-20 px-4 bg-dark-lighter/50">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Simple Pricing</h2>
          <p className="text-xl text-gray-300 mb-8">
            Pay per generation or subscribe for unlimited access
          </p>
          <div className="card max-w-md mx-auto">
            <div className="text-4xl font-bold text-primary mb-2">Coming Soon</div>
            <p className="text-gray-400">
              Pricing details will be available at launch
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">What file formats are supported?</h3>
              <p className="text-gray-400">
                We accept JPG and PNG files up to 10MB each. You can upload 1-2 photos.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">What's included in the character sheet?</h3>
              <p className="text-gray-400">
                Each sheet includes head turnarounds (front/3-4/side), full body turnarounds (front/side/back), 
                and action poses. You can customize which elements to include.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">How long does generation take?</h3>
              <p className="text-gray-400">
                Most sheets are generated in 2-5 minutes depending on complexity and current server load.
              </p>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold mb-2">What is Face Consistency Lock?</h3>
              <p className="text-gray-400">
                This advanced feature generates a reference headshot first, then uses it to maintain 
                facial consistency across all views, reducing "face drift" significantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-t from-primary/20 to-transparent">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Your Character?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Start generating professional character reference sheets today
          </p>
          <Link to="/create" className="btn-primary text-lg px-8 py-4">
            <Sparkles className="w-5 h-5 mr-2 inline" />
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
