import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Star, Play, ChevronRight, Quote, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import './CleanHero.css';

const CleanHero = () => {
  // Fetch featured courses
  const { data: featuredCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <main id="app" className="biogenius-homepage">
      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title font-pp-neue">
              Where data becomes<br/>insight and insight<br/>becomes discovery
            </h1>
            <p className="hero-subtitle font-pp-neue">
              Advance your research with practical, mentor-led programs designed by leading scientists.
            </p>
            <div className="hero-ctas">
              <Button asChild size="lg" className="cta-primary font-pp-neue">
                <Link to="/courses">
                  <Star className="mr-2 w-5 h-5" />
                  Explore Courses
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="cta-secondary font-pp-neue">
                <Link to="/contact">
                  <Play className="mr-2 w-5 h-5" />
                  Book Consultation
                </Link>
              </Button>
            </div>
            <p className="hero-meta font-pp-mono">
              Guided by researchers. Built for practitioners.
            </p>
          </div>
        </div>
      </section>



      {/* Featured Courses */}
      <section id="courses" className="courses-section">
        <div className="courses-container">
          <h2 className="section-title font-pp-neue">Featured Courses</h2>
          {coursesLoading ? (
            <div className="courses-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="course-card animate-pulse">
                  <div className="course-content">
                    <div className="h-6 bg-gray-700 rounded mb-4"></div>
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-700 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredCourses && featuredCourses.length > 0 ? (
            <div className="courses-grid">
              {featuredCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-content">
                    <h3 className="course-title font-pp-neue">{course.title}</h3>
                    <p className="course-description font-pp-neue">{course.description}</p>
                    <div className="course-meta">
                      <span className="course-tag font-pp-mono">
                        {course.difficulty || 'All levels'} • {course.duration_text || 'Self-paced'}
                      </span>
                      <Link to={`/courses/${course.slug}`} className="course-link font-pp-mono">
                        View course <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted font-pp-neue">No featured courses available yet.</p>
              <p className="text-sm text-muted opacity-70 font-pp-mono mt-2">
                Courses can be marked as featured from the admin panel.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section id="proof" className="reviews-section">
        <div className="reviews-container">
          <div className="reviews-grid">
            {/* Review 1 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "The bioinformatics course transformed my research capabilities. I can now analyze genomic data with confidence and have published two papers using the techniques I learned."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Advanced Bioinformatics Analysis</h4>
                <span className="course-batch font-pp-mono">Batch 3</span>
                <span className="course-type live font-pp-mono">Live Course</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">SC</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Dr. Sarah Chen</span>
                  <span className="reviewer-title font-pp-mono">Research Scientist<br/>Genomics Institute</span>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "Outstanding course! The instructors made complex ML concepts accessible for biologists. I've implemented several algorithms in my daily work."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Machine Learning in Life Sciences</h4>
                <span className="course-batch font-pp-mono">Batch 7</span>
                <span className="course-type live font-pp-mono">Live Course</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">MR</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Michael Rodriguez</span>
                  <span className="reviewer-title font-pp-mono">Data Analyst<br/>Biotech Solutions</span>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "This course filled a crucial gap in my skill set. The visualization techniques I learned have made my presentations much more impactful."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Genomic Data Visualization</h4>
                <span className="course-batch font-pp-mono">Batch 4</span>
                <span className="course-type recorded font-pp-mono">Recorded</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">EW</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Dr. Emily Watson</span>
                  <span className="reviewer-title font-pp-mono">Postdoctoral Fellow<br/>University Research Lab</span>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "As someone with no programming background, this course was perfect. The step-by-step approach and real-world examples made everything click."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Python for Bioinformatics</h4>
                <span className="course-batch font-pp-mono">Batch 2</span>
                <span className="course-type live font-pp-mono">Live Course</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">AT</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Alex Thompson</span>
                  <span className="reviewer-title font-pp-mono">Graduate Student<br/>Molecular Biology Dept</span>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "The statistical foundation I gained here has been invaluable for my clinical research. Highly recommend for anyone in medical genomics."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Statistical Analysis in Genomics</h4>
                <span className="course-batch font-pp-mono">Batch 5</span>
                <span className="course-type recorded font-pp-mono">Recorded</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">PP</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Dr. Priya Patel</span>
                  <span className="reviewer-title font-pp-mono">Clinical Researcher<br/>Medical Center</span>
                </div>
              </div>
            </div>

            {/* Review 6 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "Comprehensive coverage of NGS analysis. The hands-on projects gave me practical experience that directly applies to my work."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Next-Generation Sequencing Analysis</h4>
                <span className="course-batch font-pp-mono">Batch 6</span>
                <span className="course-type live font-pp-mono">Live Course</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">JW</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">James Wilson</span>
                  <span className="reviewer-title font-pp-mono">Bioinformatics Specialist<br/>Pharmaceutical Company</span>
                </div>
              </div>
            </div>

            {/* Review 7 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "The proteomics workflow course exceeded my expectations. The practical lab sessions and data analysis techniques are now essential to my research."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Proteomics Data Analysis</h4>
                <span className="course-batch font-pp-mono">Batch 4</span>
                <span className="course-type recorded font-pp-mono">Recorded</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">LM</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Dr. Lisa Martinez</span>
                  <span className="reviewer-title font-pp-mono">Protein Researcher<br/>Biotech Institute</span>
                </div>
              </div>
            </div>

            {/* Review 8 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "Excellent introduction to computational drug design. The molecular modeling techniques I learned have accelerated my thesis research significantly."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Computational Drug Design</h4>
                <span className="course-batch font-pp-mono">Batch 3</span>
                <span className="course-type live font-pp-mono">Live Course</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">RK</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Raj Kumar</span>
                  <span className="reviewer-title font-pp-mono">PhD Student<br/>Pharmaceutical Sciences</span>
                </div>
              </div>
            </div>

            {/* Review 9 */}
            <div className="review-card">
              <div className="review-header">
                <div className="batch-number font-pp-mono">99</div>
                <div className="star-rating">
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                  <Star className="star filled" />
                </div>
              </div>
              <p className="review-text font-pp-neue">
                "Perfect blend of theory and practice. The network analysis methods I learned here have opened new research directions for my lab."
              </p>
              <div className="course-info">
                <h4 className="course-name font-pp-neue">Biological Network Analysis</h4>
                <span className="course-batch font-pp-mono">Batch 8</span>
                <span className="course-type recorded font-pp-mono">Recorded</span>
              </div>
              <div className="reviewer-info">
                <div className="reviewer-avatar">DN</div>
                <div className="reviewer-details">
                  <span className="reviewer-name font-pp-neue">Dr. David Nguyen</span>
                  <span className="reviewer-title font-pp-mono">Systems Biologist<br/>Research University</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA Band */}
      <section id="cta" className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-title font-pp-neue">Start learning with BioGenius</h2>
            <Button asChild size="lg" className="cta-button font-pp-neue">
              <Link to="/courses">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CleanHero;
