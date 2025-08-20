import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Homepage from "@/components/Homepage";
import { SEOHead } from '@/components/SEOHead';
import { useAnalytics } from '@/lib/analytics';
import { useEffect } from 'react';

const Index = () => {
  const { page } = useAnalytics();

  useEffect(() => {
    page('Homepage');
  }, [page]);

  return (
    <>
      <SEOHead 
        title="Learn with Expert-Led Online Courses"
        description="Discover high-quality online courses and unlock your potential with expert instruction, hands-on projects, and recognized certifications."
        type="website"
        tags={['online courses', 'education', 'learning', 'certification', 'professional development']}
      />
      <Header />
      <Homepage />
      <Footer />
    </>
  );
};

export default Index;
