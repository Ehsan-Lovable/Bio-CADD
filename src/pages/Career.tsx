import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Career = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold text-foreground mb-8">Career</h1>
          <p className="text-lg text-muted-foreground">
            Join our team and build your career with us. This page is coming soon.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Career;