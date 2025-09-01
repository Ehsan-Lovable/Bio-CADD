import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';

const ReviewsSection = () => {
  const reviews = [
    {
      id: 1,
      name: "Shafayet Rana",
      program: "UX/UI Batch 6",
      avatar: "SR",
      rating: 5,
      review: "Even though I come from a non-CS background, I felt that understanding data science would help me advance in my profession. In order to do so, I enrolled in an Ostad Data Science course. I believed it would be tough for me to understand without prior knowledge, but after taking the Ostad Data course, I learned that it is simple to crack and that they made it even easier."
    },
    {
      id: 2,
      name: "Faisal Azam Siddiqui",
      program: "Full Stack Web Development with MERN Batch 1",
      avatar: "FA",
      rating: 5,
      review: "This course has been one of the best courses I have ever taken. It is well structured, very practical and easy to understand. I would highly recommend this course to anyone who wants to learn web development."
    },
    {
      id: 3,
      name: "Jahid Hossain",
      program: "Full Stack Web Development with MERN Batch 2",
      avatar: "JH",
      rating: 5,
      review: "The course content is excellent and the instructors are very knowledgeable. The hands-on projects really helped me understand the concepts better. I'm now confident in building full-stack applications."
    },
    {
      id: 4,
      name: "MD Galib Hasan",
      program: "Data Science Certificate Program Batch 09",
      avatar: "MG",
      rating: 5,
      review: "The Data Science program delivered by Ostad is perfect for me. I would recommend to anyone who might be interested to take the course."
    },
    {
      id: 5,
      name: "Abu Hasan",
      program: "UX/UI Batch 17",
      avatar: "AH",
      rating: 5,
      review: "MERN course has been excellent. The instructors are highly skilled and the curriculum is well-designed. I've gained practical skills that I can immediately apply in my work."
    },
    {
      id: 6,
      name: "Md Ashfaque Ul Hoque",
      program: "UX/UI Batch 6",
      avatar: "MA",
      rating: 5,
      review: "The UX/UI course exceeded my expectations. The practical approach and real-world projects helped me build a strong portfolio. Highly recommended for anyone looking to start a career in design."
    },
    {
      id: 7,
      name: "Nayem Islam",
      program: "Full Stack Web Development with MERN Batch 2",
      avatar: "NI",
      rating: 5,
      review: "The MERN stack course provided comprehensive coverage of modern web development. The instructors were supportive and the learning materials were top-notch."
    },
    {
      id: 8,
      name: "ARM Salahuddin",
      program: "Data Science Certificate Program batch 19",
      avatar: "AS",
      rating: 5,
      review: "The Data Science program was well-structured and practical. I learned valuable skills in data analysis, machine learning, and visualization that are directly applicable to my career."
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Quote className="h-4 w-4" />
            Student Reviews
          </div>
          <h2 className="font-pp-neue font-bold text-4xl md:text-5xl mb-6 text-gray-900">
            What Our Students Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-pp-neue">
            Over <span className="font-semibold text-violet-600">2000+</span> students have transformed their careers with our courses. 
            Here's what they have to say about their learning experience.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="group hover:shadow-lg transition-all duration-300 border-violet-100 hover:border-violet-200 bg-white h-full">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center">
                    <Quote className="h-4 w-4 text-violet-600" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-gray-700 leading-relaxed mb-6 text-sm flex-grow font-pp-neue">
                  "{review.review}"
                </p>

                {/* Program Badge */}
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200 font-pp-mono">
                    {review.program}
                  </Badge>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3 mt-auto">
                  <Avatar className="h-10 w-10 ring-2 ring-violet-100">
                    <AvatarFallback className="bg-violet-600 text-white font-semibold text-sm font-pp-neue">
                      {review.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm font-pp-neue">{review.name}</h4>
                    <p className="text-xs text-violet-600 font-pp-mono">{review.program}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="text-3xl font-bold text-violet-600 mb-2 font-pp-neue">2000+</div>
            <div className="text-sm text-gray-600 font-pp-mono">Happy Students</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="text-3xl font-bold text-violet-600 mb-2 font-pp-neue">95%</div>
            <div className="text-sm text-gray-600 font-pp-mono">Success Rate</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="text-3xl font-bold text-violet-600 mb-2 font-pp-neue">4.9/5</div>
            <div className="text-sm text-gray-600 font-pp-mono">Average Rating</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-violet-100">
            <div className="text-3xl font-bold text-violet-600 mb-2 font-pp-neue">50+</div>
            <div className="text-sm text-gray-600 font-pp-mono">Courses</div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4 font-pp-neue">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-violet-100 mb-6 font-pp-neue">
              Start your learning journey today and become part of our growing community of successful graduates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-white text-violet-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 font-pp-neue">
                View All Courses
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-violet-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 font-pp-neue">
                Get Free Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
