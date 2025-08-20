import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DesignShowcase = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Black background */}
      <section className="bg-off-black text-near-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading font-bold text-5xl lg:text-6xl tracking-tight mb-6">
            Mustard & Black
            <span className="block text-mustard-500">Design System</span>
          </h1>
          <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
            A bold, accessible design system combining vibrant mustard with sophisticated black for maximum impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="mustard" size="lg">
              Get Started
            </Button>
            <Button variant="outline-light" size="lg">
              View Components
            </Button>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Color Palette</h2>
          
          {/* Mustard Scale */}
          <div className="mb-12">
            <h3 className="font-heading font-semibold text-xl mb-6">Mustard Scale</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => (
                <div key={weight} className="text-center">
                  <div 
                    className={`w-full h-20 rounded-2xl shadow-soft mb-2 bg-mustard-${weight}`}
                  />
                  <p className="text-sm font-medium">{weight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-success rounded-2xl mx-auto mb-4 shadow-soft" />
              <h3 className="font-heading font-semibold">Success</h3>
              <p className="text-muted-foreground">Positive actions</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-danger rounded-2xl mx-auto mb-4 shadow-soft" />
              <h3 className="font-heading font-semibold">Danger</h3>
              <p className="text-muted-foreground">Destructive actions</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-info rounded-2xl mx-auto mb-4 shadow-soft" />
              <h3 className="font-heading font-semibold">Info</h3>
              <p className="text-muted-foreground">Informational states</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Components Showcase */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Components</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Buttons */}
            <Card className="p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Buttons</h3>
              <div className="space-y-3">
                <Button variant="mustard" className="w-full">
                  Primary Action
                </Button>
                <Button variant="outline" className="w-full">
                  Secondary Action
                </Button>
                <Button variant="ghost" className="w-full">
                  Ghost Button
                </Button>
                <Button variant="destructive" className="w-full">
                  Destructive Action
                </Button>
              </div>
            </Card>

            {/* Cards */}
            <Card className="p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Card Styles</h3>
              <div className="space-y-4">
                <div className="p-4 bg-background rounded-2xl shadow-soft border">
                  <p className="text-sm">Default card with soft shadow</p>
                </div>
                <div className="p-4 bg-mustard-100 rounded-2xl shadow-mustard border-mustard-200 border">
                  <p className="text-sm">Mustard accent card</p>
                </div>
              </div>
            </Card>

            {/* Badges */}
            <Card className="p-6">
              <h3 className="font-heading font-semibold text-lg mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Error</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-3xl text-center mb-12">Typography</h2>
          
          <div className="space-y-8">
            <div>
              <h1 className="font-heading font-bold text-4xl tracking-tight mb-2">
                Heading 1 - Inter Bold
              </h1>
              <p className="text-muted-foreground">Used for main page titles and hero sections</p>
            </div>
            
            <div>
              <h2 className="font-heading font-bold text-3xl tracking-tight mb-2">
                Heading 2 - Inter Bold
              </h2>
              <p className="text-muted-foreground">Section headers and major content divisions</p>
            </div>
            
            <div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                Heading 3 - Inter Semibold
              </h3>
              <p className="text-muted-foreground">Subsection headers and component titles</p>
            </div>
            
            <div>
              <p className="font-body text-base leading-relaxed">
                Body text uses Inter Regular for optimal readability. This paragraph demonstrates 
                the standard body typography used throughout the design system. The line height 
                and spacing are carefully calibrated for comfortable reading across all device sizes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DesignShowcase;