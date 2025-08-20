import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CareerForm } from '@/components/CareerForm';

const Career = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <CareerForm />
      </main>
      <Footer />
    </>
  );
};

export default Career;