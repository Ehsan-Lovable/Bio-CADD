import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Terms = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">
            Our terms of service content will be available here soon.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Terms;