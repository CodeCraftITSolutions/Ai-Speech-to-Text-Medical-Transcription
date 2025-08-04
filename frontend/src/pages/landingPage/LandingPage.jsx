import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Mic,
  Shield,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Play,
  Menu,
  X,
  Zap,
  Lock,
  BarChart3,
  Headphones,
  Globe,
  Award,
} from "lucide-react";
import { Badge, Button, Card, Col, Input, Row, Flex, Rate, Space } from "antd";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

const handleGetStarted = () => {
  navigate("/signup");
};
const handleSignIn = () => {
  navigate("/login");
};

  const handleWatchDemo = () => {
    // Open demo video or modal
    alert("Demo video would open here");
  };

  const handleNewsletterSignup = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing with ${email}!`);
    setEmail("");
  };

  const features = [
    {
      icon: <Mic />,
      title: "Real-Time Transcription",
      description:
        "Instant speech-to-text with medical terminology recognition and specialty-specific vocabularies.",
      color: "text-emerald-600",
    },
    {
      icon: <Shield />,
      title: "HIPAA Compliant",
      description:
        "End-to-end encryption, audit trails, and full compliance with healthcare privacy regulations.",
      color: "text-blue-600",
    },
    {
      icon: <Users />,
      title: "Multi-Role Support",
      description:
        "Designed for doctors, transcriptionists, and administrators with role-based access controls.",
      color: "text-purple-600",
    },
    {
      icon: <Zap />,
      title: "AI-Powered Accuracy",
      description:
        "Advanced machine learning models trained specifically on medical conversations and terminology.",
      color: "text-orange-600",
    },
    {
      icon: <FileText />,
      title: "Smart Formatting",
      description:
        "Automatic formatting, punctuation, and medical term highlighting for professional documentation.",
      color: "text-teal-600",
    },
    {
      icon: <BarChart3 />,
      title: "Analytics & Insights",
      description:
        "Track productivity, accuracy metrics, and usage patterns to optimize your workflow.",
      color: "text-red-600",
    },
  ];

  const roles = [
    {
      role: "Doctors & Clinicians",
      icon: Stethoscope,
      benefits: [
        "Reduce documentation time by 75%",
        "Focus more on patient care",
        "Real-time transcription during consultations",
        "Specialty-specific medical vocabularies",
        "Seamless EHR integration",
      ],
      color: "emerald",
    },
    {
      role: "Medical Transcriptionists",
      icon: Headphones,
      benefits: [
        "Advanced editing and review tools",
        "Quality assurance workflows",
        "Collaborative review process",
        "Productivity tracking and metrics",
        "Automated formatting and corrections",
      ],
      color: "blue",
    },
    {
      role: "Healthcare Administrators",
      icon: BarChart3,
      benefits: [
        "Comprehensive user management",
        "Usage analytics and reporting",
        "Cost reduction and ROI tracking",
        "Compliance monitoring and auditing",
        "Scalable enterprise deployment",
      ],
      color: "purple",
    },
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Cardiologist, Metro General Hospital",
      content:
        "MedTranscribe has revolutionized my documentation process. I can now spend 30% more time with patients instead of typing notes.",
      rating: 5,
    },
    {
      name: "Michael Chen, MD",
      role: "Emergency Medicine, City Medical Center",
      content:
        "The accuracy is incredible, even in noisy ER environments. The medical terminology recognition is spot-on.",
      rating: 5,
    },
    {
      name: "Lisa Rodriguez",
      role: "Medical Transcriptionist, HealthScribe Inc.",
      content:
        "The review and editing tools are fantastic. Quality has improved while reducing our turnaround time significantly.",
      rating: 5,
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "per user/month",
      description: "Perfect for individual practitioners",
      features: [
        "Up to 100 hours/month",
        "Real-time transcription",
        "Basic medical vocabulary",
        "PDF/Word export",
        "Email support",
      ],
      popular: false,
    },
    {
      name: "Professional",
      price: "$99",
      period: "per user/month",
      description: "Ideal for small to medium practices",
      features: [
        "Up to 300 hours/month",
        "Advanced medical vocabularies",
        "Transcriptionist collaboration",
        "EHR integration",
        "Priority support",
        "Analytics dashboard",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large healthcare organizations",
      features: [
        "Unlimited transcription hours",
        "Custom medical vocabularies",
        "Advanced admin controls",
        "SSO integration",
        "Dedicated support",
        "Custom integrations",
      ],
      popular: false,
    },
  ];

  const securityFeatures = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description:
        "Full compliance with healthcare privacy regulations and data protection standards.",
    },
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description:
        "All data encrypted in transit and at rest using AES-256 encryption standards.",
    },
    {
      icon: Award,
      title: "SOC 2 Certified",
      description:
        "Independently audited and certified for security, availability, and confidentiality.",
    },
    {
      icon: Globe,
      title: "Global Infrastructure",
      description:
        "Secure data centers with 99.9% uptime SLA and disaster recovery protocols.",
    },
  ];
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                MedTranscribe
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <a
                href="#security"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Security
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </a>
              <div className="md:flex items-center space-x-4">
                <Button variant="outline" onClick={handleSignIn}>
                  Sign In
                </Button>
                <Button onClick={handleGetStarted}>Get Started</Button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <div className="flex flex-col space-y-4">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Pricing
                </a>
                <a
                  href="#security"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Security
                </a>
                <a
                  href="#contact"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Contact
                </a>
                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                  <Button onClick={handleGetStarted} className="w-full">
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#e5edff] to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-200 text-[#1d4ed8] text-sm font-semibold">
                  HIPAA Compliant • SOC 2 Certified
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Medical Documentation with{" "}
                  <span className="text-blue-600">
                    AI-Powered Transcription
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Reduce documentation time by 75% with real-time medical
                  transcription. HIPAA-compliant, specialty-trained AI that
                  understands medical terminology and workflows.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                type="primary"
                  size="lg"
                  onClick={handleGetStarted}
                //   className="bg-[#1d4ed8] hover:bg-emerald-700"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={handleWatchDemo}>
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#1d4ed8]" />
                  <span>No setup required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#1d4ed8]" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#1d4ed8]" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Live Transcription
                    </h3>
                    <Badge className="bg-green-100 text-green-800">
                      Recording
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">00:02:34</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-gray-800">
                        Patient presents with{" "}
                        <span className="bg-blue-200 px-1 rounded">
                          chest pain
                        </span>{" "}
                        and
                        <span className="bg-blue-200 px-1 rounded ml-1">
                          shortness of breath
                        </span>
                        .
                        <span className="bg-green-200 px-1 rounded ml-1">
                          Blood pressure
                        </span>{" "}
                        is 140 over 90.
                      </p>
                      <p className="text-sm text-gray-800">
                        Heart rate is regular at 72 beats per minute. Lungs are
                        clear to auscultation bilaterally...
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled>
                        Save Draft
                      </Button>
                      <Button size="sm" disabled>
                        Send to Review
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-[#1d4ed8] text-white p-3 rounded-full shadow-lg">
                <Mic className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-3 rounded-full shadow-lg border">
                <Shield className="w-6 h-6 text-[#1d4ed8]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                75%
              </div>
              <div className="text-gray-600 mt-2">Time Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                99.2%
              </div>
              <div className="text-gray-600 mt-2">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                10K+
              </div>
              <div className="text-gray-600 mt-2">Healthcare Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                50M+
              </div>
              <div className="text-gray-600 mt-2">Transcriptions Processed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Everything You Need for Medical Documentation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive features designed specifically for healthcare
              professionals and medical workflows.
            </p>
          </div>

          <Row gutter={[24, 24]}>
            {features.map((feature, index) => (
              <Col key={index} xs={24} sm={12} lg={8}>
                <Card hoverable className="shadow-lg">
                  <div className="flex flex-col gap-2">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xl ${feature.color}`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mt-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Benefits by Role Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Built for Every Healthcare Professional
            </h2>
            <p className="text-xl text-gray-600">
              Tailored features for doctors, transcriptionists, and healthcare
              administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roles.map((section, index) => (
              <Card
                key={index}
                // bordered={false}
                className="shadow-lg"
                // bodyStyle={{ padding: "1.5rem" }}
              >
                <div className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full bg-${section.color}-100 flex items-center justify-center mb-4`}
                  >
                    <section.icon
                      className={`w-8 h-8 text-${section.color}-600`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{section.role}</h3>
                </div>
                <ul className="space-y-3">
                  {section.benefits.map((benefit, benefitIndex) => (
                    <li
                      key={benefitIndex}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <CheckCircle
                        className={`w-5 h-5 text-${section.color}-600 mt-0.5 flex-shrink-0`}
                      />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what doctors and medical professionals are saying about
              MedTranscribe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg border-0">
                <div className="pt-6">
                  <Space size="small" className="mb-4">
                    <Rate disabled defaultValue={testimonial.rating} />
                  </Space>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your practice size and needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card
                key={index}
                // bordered={true}
                className={`relative border-2 h-full ${
                  plan.popular ? "border-emerald-600" : "border-gray-200"
                } shadow-lg`}
                // bodyStyle={{ padding: "1.5rem" }}
                styles={{ padding: "1.5rem" }}
              >
                {plan.popular && (
                  <Badge
                    color="success"
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 text-white"
                  >
                    Most Popular
                  </Badge>
                )}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold">{plan.name}</h2>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-gray-700"
                    >
                      <CheckCircle className="text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  type={plan.popular ? "primary" : "default"}
                  block
                  onClick={handleGetStarted}
                  className={
                    plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : ""
                  }
                >
                  {plan.name === "Enterprise"
                    ? "Contact Sales"
                    : "Start Free Trial"}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Enterprise-Grade Security & Compliance
            </h2>
            <p className="text-xl text-gray-600">
              Your patient data is protected with the highest security
              standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityFeatures.map((item, index) => (
              <Card
                key={index}
                className="text-center shadow-lg border-0"
                // bodyStyle={{ padding: "1.5rem" }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                  <item.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1d4ed8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Ready to Transform Your Medical Documentation?
            </h2>
            <p className="text-xl text-emerald-100">
              Join thousands of healthcare professionals who have already
              reduced their documentation time by 75%.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100"
                onClick={handleGetStarted}
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-emerald-600 bg-transparent"
              >
                Schedule a Demo
              </Button>
            </div>
            <p className="text-emerald-100 text-sm">
              No credit card required • 14-day free trial • Setup in under 5
              minutes
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Stay Updated
              </h3>
              <p className="text-gray-400">
                Get the latest updates on medical transcription technology and
                healthcare documentation best practices.
              </p>
            </div>
            <form
              onSubmit={handleNewsletterSignup}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                required
              />
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">MedTranscribe</span>
              </div>
              <p className="text-gray-400">
                Transforming medical documentation with AI-powered transcription
                technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#security"
                    className="hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © 2024 MedTranscribe. All rights reserved.
            </p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="text-gray-400">Follow us:</span>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
