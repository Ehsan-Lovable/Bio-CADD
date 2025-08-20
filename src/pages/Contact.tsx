import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';

const Contact = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-16">
        <ContactForm />
      </main>
      <Footer />
    </>
  );
};

export default Contact;