import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, Star, Sparkles, Play, Calendar, Users } from 'lucide-react';

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
	const courses = [
		{ id: 1, title: 'Genomics Masterclass', type: 'LIVE', batch: 'Batch 07 • Nov 2025', image: '/placeholder.svg', level: 'Intermediate' },
		{ id: 2, title: 'Drug Discovery with CADD', type: 'RECORDED', batch: 'Self-paced • 18h', image: '/placeholder.svg', level: 'Advanced' },
		{ id: 3, title: 'Proteomics with DIA/DDA', type: 'LIVE', batch: 'Batch 04 • Oct 2025', image: '/placeholder.svg', level: 'Advanced' },
		{ id: 4, title: 'ML for Omics', type: 'RECORDED', batch: 'Self-paced • 22h', image: '/placeholder.svg', level: 'Intermediate' },
	];

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

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{courses.map((course, i) => (
					<motion.div key={course.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.5 }} viewport={{ once: true }}>
						<Card className="group relative overflow-hidden border-0 bg-gradient-to-b from-background/60 to-background/80 shadow-xl ring-1 ring-white/10">
							<div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_200px_at_0%_0%,rgba(124,58,237,0.08),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
							<CardContent className="p-0">
								<div className="relative aspect-[4/3] overflow-hidden">
									<img src={course.image} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
									<div className="absolute left-3 top-3">
										<Badge variant="secondary" className="backdrop-blur">
											{course.type}
										</Badge>
									</div>
								</div>
								<div className="space-y-3 p-4">
									<h3 className="line-clamp-2 text-base font-semibold">{course.title}</h3>
									<p className="text-sm text-muted-foreground">{course.batch}</p>
									<div className="flex items-center justify-between">
										<p className="text-xs text-muted-foreground">Level: {course.level}</p>
										<Button asChild size="sm" className="group">
											<Link to={`/courses`}>
												Explore <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
											</Link>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>
		</section>
	);
};

const Testimonials = () => {
	const items = [
		{ id: 1, name: 'Ayesha Khan', role: 'MSc Bioinformatics', avatar: '/placeholder.svg', rating: 5, text: 'The courses are incredibly well-structured and practical. I got my first research internship after completing the Genomics track.' },
		{ id: 2, name: 'Rahul Mehta', role: 'PhD Candidate', avatar: '/placeholder.svg', rating: 5, text: 'Expert mentors and hands-on projects. The CADD course was a game-changer for my thesis.' },
		{ id: 3, name: 'Sara Lee', role: 'Data Scientist', avatar: '/placeholder.svg', rating: 4, text: 'Loved the ML for Omics course. Real datasets and guided notebooks helped me transition roles.' },
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
			<FeaturedCourses />
			<Testimonials />
			<WhyUs />
			<BigCTA />
		</div>
	);
};

export default Homepage;