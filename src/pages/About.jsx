import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";

const About = () => {
  const { appLogo } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-500 selection:text-white relative">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-[11px] sm:text-xs font-bold py-2.5 px-4 text-center tracking-wide uppercase">
        Independent, accessible and timely news for readers.
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90">
            <img
              src={appLogo || "/logo-dark.png"}
              alt="INMinut"
              className="h-9 object-contain rounded-lg"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <a href="#about" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">About</a>
            <a href="#mission" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">Mission</a>
            <a href="#editorial" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">Editorial Standards</a>
            <a href="#publisher" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">Publisher</a>
            <a href="#contact" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full border-[40px] border-white/5 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] sm:text-xs font-black uppercase tracking-wider">
            About INMinut
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            News that keeps you <span className="text-red-500">informed.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg lg:text-xl font-medium leading-relaxed">
            INMinut is a free news application created to help readers discover,
            read and share relevant news, images, videos and documents in a simple
            and accessible mobile experience.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <a
              href="#publisher"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-red-50 hover:text-red-600 shadow-lg shadow-black/30 hover:scale-105 transition-all text-sm"
            >
              Publisher Information
            </a>
            <a
              href="#contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-white/40 hover:border-white text-white font-black bg-white/5 rounded-xl hover:bg-white/10 hover:scale-105 transition-all text-sm"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-20 relative z-20 space-y-8">
        
        {/* About Section */}
        <section id="about" className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 space-y-5">
          <div className="text-xs font-black uppercase tracking-widest text-red-500">Who we are</div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">About INMinut</h2>
          <p className="text-base sm:text-lg font-bold text-slate-500 leading-relaxed">
            INMinut is an independently operated news and information platform managed by <strong className="text-slate-900">Hiren Joshi</strong>, an independent publisher.
          </p>
          <div className="text-slate-600 font-medium space-y-4 leading-relaxed text-sm sm:text-base">
            <p>
              Our application allows users to browse news without creating an account.
              Readers can view articles, images, videos and PDF documents, receive
              optional news notifications, share stories and download supported media
              where available.
            </p>
            <p>
              We aim to provide a clear and convenient way for users to access news and
              public-interest information. Content published in INMinut is managed by
              our authorised editorial and administrative team.
            </p>
            <p>
              INMinut is not currently operated through a registered company. The app is
              independently published and managed by its owner, who is responsible for
              editorial operations, application management and user support.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-widest text-red-500">Our purpose</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Our mission</h2>
            <p className="text-sm sm:text-base font-bold text-slate-500">
              To make important and relevant news easier to access, understand and share.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <article className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-lg shadow-sm">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Accessible information</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                We design our app so readers can quickly browse news without a mandatory
                registration or paid subscription.
              </p>
            </article>

            <article className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-lg shadow-sm">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Timely updates</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Our publishing team works to provide useful updates and notifications
                about relevant stories.
              </p>
            </article>

            <article className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-lg shadow-sm">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Responsible publishing</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                We aim to identify the source, publisher or author of news content wherever
                applicable and correct significant errors when they are brought to our attention.
              </p>
            </article>
          </div>
        </section>

        {/* Editorial Standards */}
        <section id="editorial" className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 space-y-8">
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-widest text-red-500">How we publish</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Editorial standards</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-sm sm:text-base font-medium">
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-100 pb-2">Content principles</h3>
              <ul className="list-disc pl-5 space-y-2.5 text-slate-600">
                <li>We aim to publish accurate and relevant information.</li>
                <li>We make reasonable efforts to verify important claims before publication.</li>
                <li>We distinguish news content from promotional or sponsored content.</li>
                <li>We avoid intentionally misleading headlines or manipulated context.</li>
                <li>We review correction requests and update content when appropriate.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-950 border-b border-slate-100 pb-2">Sources and attribution</h3>
              <p className="text-slate-600 leading-relaxed">
                News may be created by our internal team, authorised contributors,
                official public sources or other content partners. Where content is
                sourced from another publisher or authority, we aim to provide clear
                attribution or a source reference where applicable.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Sponsored content or advertisements may contain links to third-party
                websites. Such content should be visually identifiable as advertising,
                sponsored or promotional content.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-sm font-semibold">
            <strong className="text-amber-950 font-black">Correction requests:</strong>
            {" "}To report an error, misleading information or an attribution concern, email
            {" "}<a href="mailto:inminut@gmail.com" className="text-red-600 hover:underline">inminut@gmail.com</a>
            {" "}with the article title, publication date and a description of the requested correction.
          </div>
        </section>

        {/* Publisher and Operator */}
        <section id="publisher" className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-widest text-red-500">Transparency</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Publisher and operator information</h2>
            <p className="text-sm font-bold text-slate-500">
              The following details identify the independent owner and publisher responsible for INMinut.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Application name</div>
              <div className="font-extrabold text-slate-900">INMinut</div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Owner and operator</div>
              <div className="font-extrabold text-slate-900">Hiren Joshi</div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Publisher name</div>
              <div className="font-extrabold text-slate-900">INMinut</div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Business type</div>
              <div className="font-extrabold text-slate-900">Independent Publisher</div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Country of operation</div>
              <div className="font-extrabold text-slate-900">India</div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Registered / business address</div>
              <div className="font-extrabold text-slate-900">Ahmedabad – 380052, Gujarat, India</div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">General contact email</div>
              <div className="font-extrabold text-red-600">
                <a href="mailto:inminut@gmail.com" className="hover:underline">inminut@gmail.com</a>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Editorial contact email</div>
              <div className="font-extrabold text-red-600">
                <a href="mailto:inminut@gmail.com" className="hover:underline">inminut@gmail.com</a>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Contact number</div>
              <div className="font-extrabold text-red-600">
                <a href="tel:+918000801315" className="hover:underline">+91 8000801315</a>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Privacy policy</div>
              <div className="font-extrabold text-red-600">
                <Link to="/policy" className="hover:underline">Privacy Policy</Link>
              </div>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 space-y-1 sm:col-span-2">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">App support</div>
              <div className="font-extrabold text-red-600">
                <a href="mailto:inminut@gmail.com" className="hover:underline">inminut@gmail.com</a>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12 space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-black uppercase tracking-widest text-red-500">Get in touch</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">Contact us</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-50/80 to-white border border-red-100 rounded-2xl p-6 space-y-3">
              <h3 className="font-black text-slate-900 text-lg">General support</h3>
              <p className="text-sm text-slate-500 font-medium">
                For app support, technical problems, privacy questions or general inquiries:
              </p>
              <div className="space-y-1.5 text-sm font-semibold">
                <p><strong className="text-slate-700">Email:</strong> <a href="mailto:inminut@gmail.com" className="text-red-600 hover:underline">inminut@gmail.com</a></p>
                <p><strong className="text-slate-700">Phone:</strong> <a href="tel:+918000801315" className="text-red-600 hover:underline">+91 8000801315</a></p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50/80 to-white border border-red-100 rounded-2xl p-6 space-y-3">
              <h3 className="font-black text-slate-900 text-lg">Editorial contact</h3>
              <p className="text-sm text-slate-500 font-medium">
                For corrections, source attribution, complaints or editorial questions:
              </p>
              <div className="space-y-1.5 text-sm font-semibold">
                <p><strong className="text-slate-700">Email:</strong> <a href="mailto:inminut@gmail.com" className="text-red-600 hover:underline">inminut@gmail.com</a></p>
                <p><strong className="text-slate-700">Response time:</strong> 3–5 business days</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-xs sm:text-sm font-bold text-slate-400">
            &copy; {new Date().getFullYear()} INMinut. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs sm:text-sm font-extrabold text-slate-300">
            <a href="#about" className="hover:text-red-500 transition-colors">About Us</a>
            <Link to="/policy" className="hover:text-red-500 transition-colors">Privacy Policy</Link>
            <a href="mailto:inminut@gmail.com" className="hover:text-red-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
