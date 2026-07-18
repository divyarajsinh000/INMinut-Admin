import { useSettings } from "../context/SettingsContext";
import { Link } from "react-router-dom";

const Policy = () => {
  const { appLogo } = useSettings();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {/* Premium background blur highlights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={appLogo || "/logo-dark.png"}
              alt="INMinut"
              className="h-10 object-contain rounded-xl"
            />
            <span className="h-5 w-px bg-slate-300 hidden sm:inline" />
            <p className="text-sm font-bold text-slate-500 tracking-tight">Legal Document</p>
          </div>

        </header>

        {/* Content Box */}
        <main className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-10 lg:p-12">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">
            INMINUT PRIVACY POLICY
          </h1>
          <p className="text-sm font-bold text-red-600 mb-8 uppercase tracking-wide">
            Effective Date: 17 July 2026
          </p>

          <div className="prose prose-slate max-w-none text-slate-600 space-y-6 leading-relaxed text-[15px] sm:text-base font-medium">
            <p>
              InMinut is operated by Inminut Enterprise (&ldquo;InMinut&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). This Privacy Policy explains how we collect, use, store, share, and protect information when you access or use the InMinut mobile application, website, and related services.
            </p>

            <p>
              InMinut is a free news application. Users can access news without creating an account or purchasing a subscription.
            </p>

            {/* Section 1 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                1. Scope
              </h2>
              <p className="mb-3">
                This Privacy Policy applies to information processed in connection with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>the InMinut mobile application;</li>
                <li>news articles, images, videos, PDF files, and other media;</li>
                <li>push notifications and notification preferences;</li>
                <li>app usage, analytics, security, and performance;</li>
                <li>media sharing and downloading features;</li>
                <li>city, category, language, or content preferences;</li>
                <li>advertisements or sponsored content displayed in the app; and</li>
                <li>support requests and communications.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                2. No User Registration
              </h2>
              <p className="mb-3">
                InMinut does not require users to register, create an account, provide a password, or purchase a subscription to access the app.
              </p>
              <p className="mb-3">
                Users can open the application and:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>browse news;</li>
                <li>view news cards and articles;</li>
                <li>view images;</li>
                <li>play videos;</li>
                <li>open PDF files;</li>
                <li>download available media;</li>
                <li>share news and media;</li>
                <li>select preferred cities or categories; and</li>
                <li>receive news notifications.</li>
              </ul>
              <p className="mt-3">
                Because no user registration is required, we generally do not collect a user&rsquo;s name, email address, mobile number, password, or account credentials unless the user voluntarily provides such information while contacting us for support or another specific purpose.
              </p>
            </section>

            {/* Section 3 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                3. Information We Collect
              </h2>
              <p>
                Depending on how the app is used, we may collect the following categories of information.
              </p>
              <div className="mt-3 pl-4 border-l-2 border-slate-200">
                <h3 className="font-bold text-slate-900 mb-1">a. Device Information</h3>
                <p className="mb-2">We may collect limited information about the device used to access InMinut, such as:</p>
                <ul className="list-disc pl-6 space-y-1 text-slate-600">
                  <li>device name;</li>
                  <li>device model;</li>
                  <li>device manufacturer;</li>
                  <li>operating system and version;</li>
                  <li>application version;</li>
                  <li>device type;</li>
                  <li>language and regional settings;</li>
                  <li>time zone;</li>
                  <li>IP address;</li>
                  <li>device or installation identifiers;</li>
                  <li>notification permission status;</li>
                  <li>network and connection information; and</li>
                  <li>limited technical identifiers generated by the app or service providers.</li>
                </ul>
                <p className="mt-2">
                  We use this information to operate the application, deliver notifications, troubleshoot technical problems, prevent abuse, and improve compatibility and performance.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                4. Push Notification Information
              </h2>
              <p className="mb-3">
                When a user allows notifications, InMinut may collect and store:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Expo push token;</li>
                <li>Firebase Cloud Messaging token;</li>
                <li>Apple Push Notification service token;</li>
                <li>app installation identifier;</li>
                <li>device platform;</li>
                <li>notification permission status;</li>
                <li>device name or model;</li>
                <li>app version;</li>
                <li>selected city or category preferences; and</li>
                <li>information about whether a notification was delivered, opened, or interacted with, where technically available.</li>
              </ul>
              <p className="mt-3">
                A push token is a technical identifier that allows notification providers to deliver messages to a particular app installation. It is not intended to identify the user by name.
              </p>
              <p>
                We may use push-notification information to deliver breaking-news alerts, city-specific or category-specific news, service-related notifications, measure notification delivery and engagement, prevent duplicate notifications, maintain active and inactive device-token records, and troubleshoot failed notifications.
              </p>
              <p className="bg-red-50 text-red-950/90 rounded-2xl p-4 mt-3 border border-red-100 text-sm">
                Users can disable notifications at any time through their device settings. Disabling notifications does not prevent the user from browsing news within the app.
              </p>
            </section>

            {/* Section 5 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                5. News Preferences
              </h2>
              <p>
                Users may be able to select preferences such as preferred cities, states, countries, news categories, language, notification categories, content interests, and whether they want to view news from all cities.
              </p>
              <p>
                These preferences may be stored locally on the device or associated with an anonymous app installation or device identifier. We use preferences to personalise the order and type of news displayed and to send relevant notifications.
              </p>
            </section>

            {/* Section 6 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                6. App Usage and Interaction Data
              </h2>
              <p className="mb-3">
                We may collect information about how users interact with InMinut, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>news items viewed;</li>
                <li>news cards opened;</li>
                <li>categories viewed;</li>
                <li>cities selected;</li>
                <li>search terms;</li>
                <li>images opened;</li>
                <li>videos played;</li>
                <li>PDF files opened;</li>
                <li>news items shared;</li>
                <li>media downloaded;</li>
                <li>links clicked;</li>
                <li>advertisements viewed or clicked;</li>
                <li>notification interactions;</li>
                <li>time and date of activity;</li>
                <li>session duration;</li>
                <li>app screen activity; and</li>
                <li>feature usage.</li>
              </ul>
              <p className="mt-3">
                We may use this information in aggregated or installation-level form to understand which news is useful or popular, improve news ordering and recommendations, measure views, shares, saves and downloads, prepare city-wise or category-wise analytics, improve the app&rsquo;s interface and functionality, detect technical problems and abuse, and understand overall app performance.
              </p>
            </section>

            {/* Section 7 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                7. Crash, Diagnostic, and Performance Data
              </h2>
              <p>
                When the app experiences an error, crash, or performance issue, we or our technology providers may collect crash logs, error messages, diagnostic information, app state at the time of the error, device model, operating-system version, app version, network status, timestamps, and technical event logs.
              </p>
              <p>
                This information is used to identify bugs, improve stability, investigate failures, and maintain application security.
              </p>
            </section>

            {/* Section 8 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                8. News Content and Media
              </h2>
              <p>
                InMinut may display or provide access to written news, titles and descriptions, images, videos, PDF documents, external links, advertisements, sponsored content, and other digital media.
              </p>
              <p>
                The app may allow users to view, download, save, copy, or share this content, subject to applicable law and any restrictions associated with the content.
              </p>
              <p>
                Downloading or sharing content may involve the device&rsquo;s operating system, file manager, media library, browser, messaging applications, or other third-party applications selected by the user.
              </p>
              <p>
                Once content is shared with another application or downloaded to a device, the handling of that content may be governed by the receiving application&rsquo;s or device provider&rsquo;s privacy practices.
              </p>
            </section>

            {/* Section 9 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                9. Photos, Videos, Files, and Device Storage
              </h2>
              <p>
                InMinut may request access to certain device features where required for app functionality, including photos or media library, files or document storage, download folder, notification permission, and media playback capabilities.
              </p>
              <p>
                These permissions may be used to allow users to save news images, download videos, download PDF documents, share news content, open downloaded media, and receive notifications.
              </p>
              <p>
                InMinut does not access all photos, videos, or files on the device merely because the app is installed.
              </p>
              <p>
                Where supported, we use system file pickers, media pickers, share sheets, or download managers so that the user can control which files are accessed or where content is saved.
              </p>
              <p>
                Users may manage or revoke app permissions through their device settings. Certain features may not work when required permissions are disabled.
              </p>
            </section>

            {/* Section 10 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                10. Information Provided Voluntarily
              </h2>
              <p>
                Users may voluntarily provide information when they contact customer support, send an email, report incorrect or inappropriate news, submit feedback, report a technical issue, respond to a survey, or communicate with us through another available channel.
              </p>
              <p>
                Such information may include name, email address, mobile number, message content, screenshots, device information, attachments, and any other information included in the communication.
              </p>
              <p>
                We use this information to respond to requests, investigate issues, provide assistance, and improve the application.
              </p>
            </section>

            {/* Section 11 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                11. How We Use Information
              </h2>
              <p className="mb-3">
                We may use collected information to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>provide and operate the InMinut application;</li>
                <li>display news, images, videos, and PDF documents;</li>
                <li>remember user preferences;</li>
                <li>personalise city-wise or category-wise news;</li>
                <li>deliver push notifications;</li>
                <li>enable downloading and sharing;</li>
                <li>measure news views, shares, clicks, and downloads;</li>
                <li>provide analytics to app administrators;</li>
                <li>identify popular news, categories, and cities;</li>
                <li>maintain application performance;</li>
                <li>detect and resolve technical issues;</li>
                <li>prevent spam, misuse, fraud, and security incidents;</li>
                <li>maintain logs, backups, and business-continuity systems;</li>
                <li>improve the application&rsquo;s features and user experience;</li>
                <li>communicate with users who contact us;</li>
                <li>comply with applicable law; and</li>
                <li>protect our legal rights, users, and services.</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                12. Free Application and No Subscription Data
              </h2>
              <p>
                InMinut is currently provided as a free application.
              </p>
              <p>
                The application does not require users to purchase a subscription, provide debit-card or credit-card details, provide bank-account information, pay a registration fee, or provide recurring-payment information.
              </p>
              <p>
                Accordingly, InMinut does not ordinarily collect subscription, billing, invoice, or payment information from app users.
              </p>
              <p>
                If paid services are introduced in the future, this Privacy Policy may be updated before or when such services are made available.
              </p>
            </section>

            {/* Section 13 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                13. Advertising and Sponsored Content
              </h2>
              <p>
                InMinut may display advertisements, promotional banners, or sponsored content.
              </p>
              <p>
                Depending on the advertising implementation, we or an advertising provider may process limited information such as advertisement views, advertisement clicks, device type, app version, approximate location derived from IP address, language, general content preferences, anonymous or pseudonymous advertising identifiers, and fraud-prevention information.
              </p>
              <p>
                We do not provide advertisers with a user&rsquo;s name, mobile number, email address, or private communications unless the user has voluntarily provided such information for a clearly explained purpose.
              </p>
              <p>
                Advertisements and external advertiser websites may be governed by the privacy policies of the relevant advertiser or service provider.
              </p>
            </section>

            {/* Section 14 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                14. Location Information
              </h2>
              <p>
                InMinut does not require precise GPS location merely to browse general news.
              </p>
              <p>
                Where city-specific content is offered, the app may allow the user to manually select preferred cities.
              </p>
              <p>
                If a future feature requests device location, we will request the required device permission and explain the purpose before using it.
              </p>
              <p>
                Approximate location may also be inferred from an IP address for purposes such as security, analytics, localisation, or content delivery.
              </p>
            </section>

            {/* Section 15 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                15. Sharing of Information
              </h2>
              <p>
                We do not sell or rent users&rsquo; personal data for direct monetary consideration.
              </p>
              <p>
                We may disclose limited information to authorised service providers where reasonably necessary to operate, secure, maintain, support, analyse, and improve InMinut.
              </p>
              <p>
                These service providers may include cloud-hosting providers, database and storage providers, content-delivery networks, push-notification providers, analytics providers, crash-reporting and diagnostic providers, video, image, and document-delivery providers, security and fraud-prevention providers, customer-support providers, advertising service providers, professional advisors, advisors, and insurers, and other technology vendors working on our behalf.
              </p>
              <p>
                We may also disclose information where required by law, in response to valid legal or governmental requests, to investigate fraud, misuse, or security incidents, to protect the rights, property, or safety of InMinut, users, or others, to enforce our terms or policies, or in connection with a merger, acquisition, restructuring, financing, or transfer of business assets.
              </p>
            </section>

            {/* Section 16 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                16. Third-Party Sharing Initiated by Users
              </h2>
              <p>
                When users choose to share news, images, videos, text, links, or PDF files, the information may be sent to third-party applications such as WhatsApp, Instagram, Facebook, email applications, SMS applications, cloud-storage services, file-sharing applications, or other applications selected through the device&rsquo;s sharing interface.
              </p>
              <p>
                The sharing action is initiated and controlled by the user.
              </p>
              <p>
                InMinut is not responsible for how the receiving third-party application collects, stores, uses, or shares the content after it has been transferred.
              </p>
            </section>

            {/* Section 17 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                17. External Links and Websites
              </h2>
              <p>
                News content, advertisements, or other parts of InMinut may contain links to external websites, videos, social-media pages, or third-party services.
              </p>
              <p>
                We are not responsible for the availability, content, security practices, cookies, data collection, downloads, or privacy practices of third parties.
              </p>
            </section>

            {/* Section 18 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                18. Local Storage, SDKs, and Similar Technologies
              </h2>
              <p>
                InMinut may use local device storage, application storage, software development kits, caches, cookies on web pages, anonymous installation identifiers, and similar technologies.
              </p>
              <p>
                These technologies may be used to remember selected cities and categories, remember onboarding completion, store notification preferences, maintain app configuration, improve loading speed, deliver notifications, perform analytics, detect misuse, maintain security, and support app functionality.
              </p>
              <p>
                Clearing the app&rsquo;s data or uninstalling the app may remove locally stored preferences.
              </p>
            </section>

            {/* Section 19 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                19. Data Retention
              </h2>
              <p>
                We retain information only for as long as reasonably necessary for the purposes described in this Privacy Policy.
              </p>
              <p>
                Retention periods may depend on whether a device token remains active, notification-delivery requirements, analytics requirements, security and fraud-prevention needs, technical logs and backup cycles, support and dispute-resolution requirements, legal obligations, and the nature of the information.
              </p>
              <p>
                Inactive or invalid push-notification tokens may be deleted, disabled, or anonymised after they are identified as inactive.
              </p>
              <p>
                Aggregated or anonymised analytics that no longer reasonably identify a user or app installation may be retained for longer periods.
              </p>
            </section>

            {/* Section 20 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                20. Data Security
              </h2>
              <p>
                We use reasonable technical and organisational safeguards designed to protect information against unauthorised access, accidental loss, alteration, misuse, disclosure, and destruction.
              </p>
              <p>
                Safeguards may include access controls, secure network communication, authentication for administrative systems, restricted database access, monitoring and logging, backup controls, vendor-management measures, and incident-response procedures.
              </p>
              <p className="bg-slate-50 border border-slate-200 rounded-2xl p-4 font-bold text-slate-600 text-sm">
                No internet-based service, mobile application, or storage system can be guaranteed to be completely secure.
              </p>
            </section>

            {/* Section 21 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                21. Personal Data Breach Response
              </h2>
              <p>
                If we become aware of a personal-data breach affecting information in our possession or control, we may take reasonable steps to investigate the incident, contain the breach, secure affected systems, assess possible risks, restore affected services, notify affected individuals where required, and notify applicable authorities where required by law.
              </p>
            </section>

            {/* Section 22 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                22. International and Cross-Border Processing
              </h2>
              <p>
                InMinut may use service providers, cloud infrastructure, content-delivery systems, or technical resources located in India or other countries.
              </p>
              <p>
                Information may therefore be processed or stored outside the user&rsquo;s state or country, subject to applicable legal requirements, contractual safeguards, and restrictions imposed by law.
              </p>
            </section>

            {/* Section 23 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                23. User Choices and Rights
              </h2>
              <p>
                Subject to applicable law, users may contact us to request information about personal data processed by us, correction of inaccurate information, deletion or erasure where appropriate, withdrawal of consent where processing is based on consent, withdrawal from optional communications, grievance redressal, assistance with notification or device-token deletion, and other rights available under applicable law.
              </p>
              <p>
                Because InMinut does not require account registration, we may need information such as an installation identifier, push token, support-email address, or device information to locate relevant records.
              </p>
              <p>
                We may require reasonable verification before processing a request.
              </p>
              <p>
                Users may also control certain data directly by disabling notifications, changing app permissions, clearing app data, changing city or category preferences, deleting downloaded files, or uninstalling the application.
              </p>
            </section>

            {/* Section 24 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                24. Children
              </h2>
              <p>
                InMinut provides general news and informational content and is not intended to knowingly collect personal data directly from children.
              </p>
              <p>
                The app does not require users to create an account or provide their age.
              </p>
              <p>
                If we become aware that a child&rsquo;s personal data has been collected in a manner not permitted by applicable law, we may delete or restrict the relevant information.
              </p>
              <p>
                Parents or guardians may contact us if they believe a child has provided personal data through the app.
              </p>
            </section>

            {/* Section 25 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                25. News Accuracy and Content Sources
              </h2>
              <p>
                InMinut may publish, summarise, aggregate, or link to news and media obtained from authorised contributors, public sources, publishers, agencies, or third parties.
              </p>
              <p>
                This Privacy Policy governs how information about app users is processed. It does not determine the editorial accuracy, ownership, copyright status, or reliability of individual news items.
              </p>
              <p>
                Questions concerning a particular news item may be submitted through the available support or reporting channel.
              </p>
            </section>

            {/* Section 26 */}
            <section className="pt-4">
              <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight border-l-4 border-red-500 pl-3">
                26. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes to the application, new features, changes to data practices, legal or regulatory requirements, security improvements, or changes to service providers.
              </p>
              <p>
                The updated version will be published in the application, on our app, or through another appropriate notice, together with a revised effective date.
              </p>
            </section>

            {/* Section 27 */}
            <section className="pt-4 pb-8">
              <h2 className="text-xl font-black text-slate-900 mb-4 tracking-tight border-l-4 border-red-500 pl-3">
                27. Privacy and Grievance Contact
              </h2>
              <p className="mb-4">
                For privacy-related questions, requests, complaints, or grievances concerning InMinut, contact:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-2 max-w-md">
                <p className="font-bold text-slate-900 text-lg">InMinut Enterprise</p>
                <div className="h-px bg-slate-200 my-2" />
                <p className="text-sm font-medium text-slate-600"><strong className="text-slate-900">Contact Person:</strong> Hiren Joshi</p>
                <p className="text-sm font-medium text-slate-600"><strong className="text-slate-900">Email:</strong> <a href="mailto:inminut@gmail.com" className="text-red-600 hover:underline">inminut@gmail.com</a></p>
                <p className="text-sm font-medium text-slate-600"><strong className="text-slate-900">Phone:</strong> +91 8000801315</p>
                <p className="text-sm font-medium text-slate-600"><strong className="text-slate-900">Address:</strong> Ahmedabad &ndash; 380052, Gujarat, India</p>
              </div>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 text-xs font-bold text-slate-400 tracking-wide">
          &copy; {new Date().getFullYear()} INMINUT ENTERPRISE. ALL RIGHTS RESERVED.
        </footer>
      </div>
    </div>
  );
};

export default Policy;
