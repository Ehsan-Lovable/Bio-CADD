import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Star, Sparkles, Play, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

const gradientText = 'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent';

const sectionFade = {
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	transition: { duration: 0.6, ease: 'easeOut' }
};

const HomeHero = () => {
	return (
		<section className="relative overflow-hidden">
			{/* Animated background */}
			<div className="absolute inset-0 -z-10">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,58,237,0.25),transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(59,130,246,0.25),transparent_60%)]" />
				<motion.div
					className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gradient-to-tr from-violet-600/30 to-sky-500/30 blur-3xl"
					animate={{ y: [0, 20, 0] }}
					transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
				/>
				<motion.div
					className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-gradient-to-tr from-fuchsia-500/20 to-purple-500/20 blur-3xl"
					animate={{ y: [0, -20, 0] }}
					transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
				/>
			</div>

			<div className="container mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
				<motion.div {...sectionFade} className="mx-auto max-w-3xl text-center">
					<Badge variant="secondary" className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur border-white/20">
						<Sparkles className="h-3.5 w-3.5 text-primary" />
						<span className="text-xs">Trusted by 10,000+ learners</span>
					</Badge>
					<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
						<span className="block">The #1 Platform for</span>
						<span className={`block mt-2 ${gradientText}`}>Bioinformatics & Research Education Worldwide</span>
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
						Empowering scientists, researchers, and students with expert-led courses, hands-on projects, and career-driven learning paths.
					</p>

					<div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Button asChild size="lg" className="group relative overflow-hidden">
							<Link to="/courses">
								<span className="relative z-10">Explore Courses</span>
								<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								<span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 transition-opacity group-hover:opacity-100" />
							</Link>
						</Button>
						<Button asChild size="lg" variant="outline" className="group backdrop-blur">
							<Link to="/contact">
								<BookIcon className="mr-2 h-4 w-4" />
								Book Consultation
							</Link>
						</Button>
					</div>

					<div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
						<StatChip icon={Play} label="Courses" value="35+" />
						<StatChip icon={Calendar} label="Live Batches" value="8" />
						<StatChip icon={Users} label="Learners" value="10k+" />
						<StatChip icon={Star} label="Avg. Rating" value="4.9/5" />
					</div>
				</motion.div>
			</div>
		</section>
	);
};

function StatChip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
	return (
		<div className="rounded-xl border bg-card/60 p-4 shadow-sm backdrop-blur">
			<div className="flex items-center gap-3">
				<div className="rounded-lg border bg-background p-2 text-primary">
					<Icon className="h-4 w-4" />
				</div>
				<div>
					<p className="text-xs text-muted-foreground">{label}</p>
					<p className="text-sm font-semibold">{value}</p>
				</div>
			</div>
		</div>
	);
}

const FeaturedCourses = () => {
	const [courses, setCourses] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from('courses')
					.select('id, title, slug, course_type, duration_text, poster_url, difficulty, featured, start_date')
					.eq('status', 'published')
					.order('featured', { ascending: false })
					.order('created_at', { ascending: false })
					.limit(3);
				
				if (error) {
					console.error('Error fetching featured courses:', error);
				}
				setCourses(data || []);
			} catch (err) {
				console.error('Featured courses error:', err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<section className="container mx-auto px-6 py-16 md:py-20">
			<motion.div {...sectionFade} className="mb-10 flex items-end justify-between">
				<div>
					<h2 className="text-2xl font-bold sm:text-3xl">Featured Courses</h2>
					<p className="mt-2 text-muted-foreground">Premium courses designed by industry experts and researchers</p>
				</div>
				<Button asChild variant="ghost" className="group">
					<Link to="/courses">
						Browse all
						<ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</Button>
			</motion.div>

			{loading ? (
				<div className="text-center py-8">
					<p className="text-muted-foreground">Loading featured courses...</p>
				</div>
			) : courses.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-muted-foreground">No courses available yet.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{courses.map((course, i) => {
						const isUpcoming = course.start_date && new Date(course.start_date) > new Date();
						return (
							<motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }} viewport={{ once: true }}>
								<Card className="group relative overflow-hidden border-0 bg-gradient-to-b from-background/60 to-background/80 shadow-xl ring-1 ring-white/10">
									<div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_200px_at_0%_0%,rgba(124,58,237,0.08),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									<CardContent className="p-0">
										<div className="relative aspect-[4/3] overflow-hidden">
											<img src={course.poster_url || '/placeholder.svg'} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
											<div className="absolute left-3 top-3 flex gap-2">
												{course.featured && (
													<Badge variant="default" className="backdrop-blur font-bold bg-yellow-500 hover:bg-yellow-600">
														FEATURED
													</Badge>
												)}
												{isUpcoming && (
													<Badge variant="destructive" className="backdrop-blur font-bold bg-orange-500 hover:bg-orange-600">
														UPCOMING
													</Badge>
												)}
												<Badge variant="secondary" className="backdrop-blur uppercase">
													{course.course_type || 'COURSE'}
												</Badge>
											</div>
										</div>
										<div className="space-y-3 p-4">
											<h3 className="line-clamp-2 text-base font-semibold">{course.title}</h3>
											<p className="text-sm text-muted-foreground">
												{course.start_date ? new Date(course.start_date).toLocaleDateString() : course.duration_text || 'Available now'}
											</p>
											<div className="flex items-center justify-between">
												<p className="text-xs text-muted-foreground">
													{course.difficulty ? `Level: ${course.difficulty}` : course.duration_text}
												</p>
												<Button asChild size="sm" className="group">
													<Link to={`/courses/${course.slug}`}>
														Explore <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
													</Link>
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						);
					})}
				</div>
			)}
		</section>
	);
};

const LatestCourses = () => {
	const [items, setItems] = useState<Array<any>>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const { data, error } = await supabase
					.from('courses')
					.select('id, title, slug, course_type, start_date, duration_text, poster_url, created_at')
					.eq('status', 'published')
					.order('start_date', { ascending: true, nullsFirst: false })
					.order('created_at', { ascending: false })
					.limit(3);
				
				if (error) {
					console.error('Error fetching latest courses:', error);
				}
				console.log('Latest courses data:', data);
				setItems(data || []);
			} catch (err) {
				console.error('Latest courses error:', err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Always show the section for now during development
	// if (!items.length) return null;

	return (
		<section className="container mx-auto px-6 pt-6 md:pt-10">
			<motion.div {...sectionFade} className="mb-6 flex items-end justify-between">
				<div>
					<h2 className="text-2xl font-bold sm:text-3xl">Latest Courses</h2>
					<p className="mt-2 text-muted-foreground">Newest and upcoming courses from our catalog</p>
				</div>
				<Button asChild variant="ghost" className="group">
					<Link to="/courses">
						Browse all
						<ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</Button>
			</motion.div>

			{loading ? (
				<div className="text-center py-8">
					<p className="text-muted-foreground">Loading latest courses...</p>
				</div>
			) : items.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-muted-foreground">No courses available yet. Check back soon!</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{items.map((course, i) => {
						const isUpcoming = course.start_date && new Date(course.start_date) > new Date();
						return (
							<motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.45 }} viewport={{ once: true }}>
								<Card className="group relative overflow-hidden border-0 bg-gradient-to-b from-background/60 to-background/80 shadow-xl ring-1 ring-white/10">
									<CardContent className="p-0">
										<div className="relative aspect-[4/3] overflow-hidden">
											<img src={course.poster_url || '/placeholder.svg'} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
											<div className="absolute left-3 top-3 flex gap-2">
												{isUpcoming && (
													<Badge variant="destructive" className="backdrop-blur uppercase font-bold bg-orange-500 hover:bg-orange-600 text-white">
														UPCOMING
													</Badge>
												)}
												<Badge variant="secondary" className="backdrop-blur uppercase">
													{course.course_type || 'LIVE'}
												</Badge>
											</div>
										</div>
									<div className="space-y-3 p-4">
										<h3 className="line-clamp-2 text-base font-semibold">{course.title}</h3>
										<p className="text-sm text-muted-foreground">
											{course.start_date ? new Date(course.start_date).toLocaleDateString() : course.duration_text || 'Starting soon'}
										</p>
										<div className="flex items-center justify-between">
											<p className="text-xs text-muted-foreground">{course.duration_text}</p>
											<Button asChild size="sm" className="group">
												<Link to={`/courses/${course.slug}`}>
													Explore <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
												</Link>
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
						);
					})}
				</div>
			)}
		</section>
	);
};

const Testimonials = () => {
	const items = [
		{ id: 1, name: 'Ayesha Khan', role: 'MSc Bioinformatics', avatar: '/placeholder.svg', rating: 5, text: 'The courses are incredibly well-structured and practical. I got my first research internship after completing the Genomics track.' },
		{ id: 2, name: 'Rahul Mehta', role: 'PhD Candidate', avatar: '/placeholder.svg', rating: 5, text: 'Expert mentors and hands-on projects. The CADD course was a game-changer for my thesis.' },
		{ id: 3, name: 'Sara Lee', role: 'Data Scientist', avatar: '/placeholder.svg', rating: 4, text: 'Loved the ML for Omics course. Real datasets and guided notebooks helped me transition roles.' },
		{ id: 4, name: 'David Chen', role: 'Biotech Researcher', avatar: '/placeholder.svg', rating: 5, text: 'The protein structure analysis course opened new research directions for my work. Excellent hands-on tutorials.' },
		{ id: 5, name: 'Maria Rodriguez', role: 'Computational Biologist', avatar: '/placeholder.svg', rating: 5, text: 'Outstanding curriculum design. The RNA-seq analysis module helped me publish my first paper as lead author.' },
		{ id: 6, name: 'Ahmed Hassan', role: 'Bioinformatics Analyst', avatar: '/placeholder.svg', rating: 4, text: 'Great practical approach to learning. The pathway analysis course directly applies to my daily work at the hospital.' },
	];
	return (
		<section className="bg-gradient-to-b from-background to-background/50">
			<div className="container mx-auto px-6 py-16 md:py-20">
				<motion.div {...sectionFade} className="mb-10 text-center">
					<h2 className="text-2xl font-bold sm:text-3xl">What Learners Say</h2>
					<p className="mt-2 text-muted-foreground">Stories from our global community</p>
				</motion.div>
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
					{items.map((t, i) => (
						<motion.div key={t.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.45 }} viewport={{ once: true }}>
							<Card className="bg-card/60 backdrop-blur">
								<CardContent className="p-6">
									<div className="mb-4 flex items-center gap-3">
										<Avatar className="h-10 w-10">
											<AvatarImage src={t.avatar} />
											<AvatarFallback>{t.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
										</Avatar>
										<div>
											<p className="text-sm font-semibold">{t.name}</p>
											<p className="text-xs text-muted-foreground">{t.role}</p>
										</div>
									</div>
									<div className="mb-2 flex items-center gap-1 text-yellow-500">
										{Array.from({ length: 5 }).map((_, idx) => (
											<Star key={idx} className={`h-4 w-4 ${idx < t.rating ? 'fill-yellow-500' : 'opacity-30'}`} />
										))}
									</div>
									<p className="text-sm text-muted-foreground">“{t.text}”</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

const WhyUs = () => {
	const features = [
		{ title: 'Expert-Led', desc: 'Learn from researchers and industry professionals', icon: Sparkles },
		{ title: 'Research-Driven', desc: 'Curriculum built on real-world datasets and case studies', icon: BookIcon },
		{ title: 'Career-Focused', desc: 'Projects and mentoring that accelerate your journey', icon: Users },
		{ title: 'Community', desc: 'Join a supportive global network of learners', icon: Star },
	];
	return (
		<section className="container mx-auto px-6 py-16 md:py-20">
			<motion.div {...sectionFade} className="mb-10 text-center">
				<h2 className="text-2xl font-bold sm:text-3xl">Why Choose BioGenius</h2>
				<p className="mt-2 text-muted-foreground">Designed to help you learn, build, and grow</p>
			</motion.div>
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{features.map((f, i) => (
					<motion.div key={f.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45 }} viewport={{ once: true }}>
						<Card className="group bg-card/60 backdrop-blur">
							<CardContent className="p-6">
								<div className="mb-4 inline-flex rounded-lg border bg-background p-3 text-primary transition-transform group-hover:scale-105">
									<f.icon className="h-5 w-5" />
								</div>
								<p className="text-base font-semibold">{f.title}</p>
								<p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
};

const BigCTA = () => {
	return (
		<section className="relative overflow-hidden py-16 md:py-24">
			<div className="absolute inset-0 -z-10 bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-cyan-500/20" />
			<div className="container mx-auto px-6">
				<Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background/70 to-background/40 p-0 shadow-xl ring-1 ring-white/10">
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_200px_at_10%_10%,rgba(124,58,237,0.2),transparent_70%)]" />
					<CardContent className="relative z-10 grid gap-6 p-8 md:grid-cols-3 md:p-12">
						<div className="md:col-span-2">
							<h3 className="text-2xl font-bold sm:text-3xl">Start learning with BioGenius today</h3>
							<p className="mt-2 max-w-2xl text-muted-foreground">Join thousands of learners mastering genomics, proteomics, drug discovery, and more—through expert-led, hands-on courses.</p>
						</div>
						<div className="flex items-center gap-3 md:justify-end">
							<Button asChild size="lg" className="group">
								<Link to="/courses">
									Explore Courses
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
};

function BookIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M20 22V4a2 2 0 0 0-2-2H6.5A2.5 2.5 0 0 0 4 4.5v15"/></svg>
	);
}

const Homepage = () => {
  return (
		<div className="min-h-screen bg-background">
			<HomeHero />
			<LatestCourses />
			<FeaturedCourses />
			<Testimonials />
			<WhyUs />
			<BigCTA />
    </div>
  );
};

export default Homepage;