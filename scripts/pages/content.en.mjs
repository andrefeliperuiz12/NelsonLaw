// ============================================================
// Service page content — ENGLISH
// ============================================================
// Read by scripts/build-pages.mjs. After editing, run:
//   node scripts/build-pages.mjs
//
// Same editorial rules as content.es.mjs, and the SAME SCOPE: every service,
// inclusion and exclusion stated in Spanish must be stated here too.
// Do not claim that the firm works in English: that is a pending decision
// (see the restructuring report). The FAQ says so honestly.
// ============================================================

import { SITE } from './site.mjs';

const s = (key) => SITE.slugs[key].en;

const ui = {
  home: 'Home',
  ogLocale: 'en_US',
  navLabel: 'Main navigation',
  breadcrumbLabel: 'Breadcrumb',
  nav: [
    { hash: '#services', label: 'Services' },
    { hash: '#how-we-work', label: 'How we work' },
    { hash: '#contact', label: 'Contact' },
  ],
  navCta: 'Request an assessment',
  faqTag: 'Frequently asked questions',
  faqTitle: 'Worth knowing <em>before you start</em>',
  ctaNote: 'Sending an enquiry does not engage the firm or confirm that we will take on the matter.',
  siblingsTitle: 'Other services',
  disclaimer:
    'This page provides general information about Panamanian law. It is not legal advice and does not replace the analysis of a specific case. Sending an enquiry does not by itself create an attorney-client relationship: an engagement is formalised only by written agreement, after the matter has been assessed and checked for conflicts of interest.',
  footerTagline: 'Law Firm · Panama City',
  rights: 'All rights reserved.',
  footerLinks: [
    { href: '/en/' + s('residencia'), label: 'Residency' },
    { href: '/en/' + s('permisos'), label: 'Work permits' },
    { href: '/en/' + s('relocalizacion'), label: 'Relocation' },
    { href: '/en/' + s('contratos'), label: 'Contracts & real estate' },
    { href: '/en/' + s('administrativo'), label: 'Administrative' },
    { href: '/en/' + s('tributario'), label: 'Tax' },
    { href: '/en/' + s('constitucional'), label: 'Constitutional' },
    { href: '/en/#contact', label: 'Contact' },
    { href: '/en/privacy', label: 'Privacy' },
  ],
};

const defaultSteps = [
  {
    title: 'Initial assessment',
    text: 'We review your enquiry, check for conflicts of interest and tell you whether we can take the matter on, what deadlines apply and what is needed.',
  },
  {
    title: 'Written proposal',
    text: 'Scope, fees and third-party costs listed separately, plus what is not included. Nothing starts until you accept it.',
  },
  {
    title: 'Remote preparation',
    text: 'Documents, filings and strategy are handled by email, video call or messaging, and you review them before anything is filed.',
  },
  {
    title: 'Filing and follow-up',
    text: 'Filing with the relevant authority, responses to its requests and progress updates until a decision is issued.',
  },
];

const pages = {
  // ----------------------------------------------------------------------
  residencia: {
    slug: s('residencia'),
    area: 'residencia_migracion',
    num: '01',
    cardName: 'Residency & immigration',
    cardDesc: 'Profile assessment, residency application, dependants, renewals and corrections.',
    title: 'Panama Residency for Foreign Nationals | Juriscorp S.C.',
    description:
      'Assessment of your immigration profile and preparation of your Panama residency application: dependants, renewals, corrections and foreign documents.',
    schemaName: 'Residency and immigration in Panama',
    breadcrumb: 'Residency & immigration',
    eyebrow: 'Service',
    h1: 'Residency <em>& immigration</em>',
    lead:
      'Choosing a residency category that does not fit your profile, or filing a foreign document without the right apostille or translation, often costs months. Before gathering paperwork, it pays to know which route applies to you and what will be required. We help you map that route and see the application through to a decision.',
    audience: {
      label: 'Who it is for',
      value: 'Foreign nationals who want to live in Panama, and their dependants',
      note: 'Also for those with an application in progress who need to renew, extend or respond to a request from the authority.',
    },
    scope: {
      tag: 'What is included',
      title: 'From first assessment <em>to decision</em>',
      intro:
        'We assess first and recommend a route second. We do not sell a catalogue of visas: the right category depends on your circumstances.',
      items: [
        {
          title: 'Profile and category assessment',
          text: 'We look at your activity, financial means and family or employment ties, and tell you which residency categories may apply and which one we recommend, with what each requires.',
        },
        {
          title: 'Application and file',
          text: 'A document list tailored to your case, checks on validity and format, drafting of the application and assembly of the file for the National Immigration Service (Servicio Nacional de Migración).',
        },
        {
          title: 'Dependants',
          text: 'Inclusion of a spouse, children or other dependants where the category allows it, with the relevant proof of relationship.',
        },
        {
          title: 'Renewals and extensions',
          text: 'Expiry tracking and preparation of the renewals or extensions available in your category, so your status does not lapse.',
        },
        {
          title: 'Corrections and follow-up',
          text: 'Responses to requests and observations from the authority, and follow-up until the application is decided.',
        },
        {
          title: 'Foreign documents',
          text: 'Coordination of apostilles, legalisations and official translations of documents issued outside Panama. Third-party costs are quoted separately.',
        },
      ],
      excluded: {
        title: 'Not part of this service',
        text: 'Naturalisation, and any procedure before the Electoral Tribunal, the Civil Registry or the national ID office (Cedulación). We do not guarantee approval or timing either: the decision rests with the immigration authority.',
      },
    },
    process: {
      tag: 'How we work',
      title: 'How we handle <em>your application</em>',
      presence: {
        title: 'Your presence and the lawyer’s are not the same thing',
        text: 'Much of the work can be done while you are outside Panama. Some immigration steps, however, may require the applicant to appear in person, for example for registration or to collect documents. We tell you which ones apply to your case before you plan your trip. We do not offer “residency without travel”.',
      },
    },
    documents: {
      tag: 'For the initial assessment',
      title: 'What to <em>have ready</em>',
      intro: 'For guidance only. We do not need originals or copies to start; it is enough to know:',
      items: [
        'Your nationality and the country you currently live in.',
        'The main reason for residency: work, investment, retirement, family or other.',
        'Which dependants would come with you.',
        'If you are already in Panama, your current immigration status and expiry dates.',
        'Roughly when you plan to settle.',
        'Which documents you already have apostilled or translated.',
      ],
      note: {
        title: 'Please do not send documents through the form',
        text: 'The final list depends on the category and is provided in writing after the assessment. Do not attach or type passport numbers or other ID data in the web enquiry.',
      },
    },
    faq: [
      {
        q: 'Can I obtain residency without travelling to Panama?',
        a: [
          'Generally, no. A large part of the work can be done remotely, but some steps may require you to appear in person.',
          'We tell you which ones apply to your category and how to group your visits, without promising you will not need to come.',
        ],
      },
      {
        q: 'Does residency allow me to work?',
        a: [
          'Not necessarily. Residency and permission to work are separate authorisations, and the rules depend on the category. Some people will also need a work permit.',
          `We check this in the assessment. See also <a href="/en/${s('permisos')}">Work permits</a>.`,
        ],
      },
      {
        q: 'How long does it take?',
        a: [
          'It depends on the category, the authority’s workload and whether the file is complete from the start. We do not offer guaranteed timeframes; we do keep you informed of the status and of every request.',
        ],
      },
      {
        q: 'Can my family be included?',
        a: [
          'If the category allows it, yes: spouse, children and other dependants, with proof of relationship apostilled or legalised, and translated where required.',
        ],
      },
      {
        q: 'Do you handle Panamanian citizenship?',
        a: [
          'No. Naturalisation and procedures before the Electoral Tribunal, the Civil Registry or Cedulación are not part of our services.',
        ],
      },
    ],
    cta: {
      title: 'Want to know which residency route fits you?',
      text: 'Tell us about your situation in a few lines. We will reply through the channel you choose with the next steps to assess it.',
      button: 'Assess my residency',
      whatsapp: 'Hello, I would like to assess my residency options in Panama.',
    },
  },

  // ----------------------------------------------------------------------
  permisos: {
    slug: s('permisos'),
    area: 'permisos_trabajo',
    num: '02',
    cardName: 'Work permits',
    cardDesc: 'The right permit, applications and renewals, worker and employer documents.',
    title: 'Work Permits for Foreign Nationals in Panama | Juriscorp',
    description:
      'Work permits for foreign nationals in Panama: assessment of the applicable permit, applications and renewals, employer documentation and expiry tracking.',
    schemaName: 'Work permits for foreign nationals in Panama',
    breadcrumb: 'Work permits',
    eyebrow: 'Service',
    h1: 'Work <em>permits</em>',
    lead:
      'To work in Panama, a foreign national needs an authorisation that does not always come with residency. We help you identify the permit that applies, gather the worker’s and the company’s documents, and keep track of expiry dates.',
    audience: {
      label: 'Who it is for',
      value: 'Foreign workers and the companies that hire them',
      note: 'If the worker and the employer both contact us about the same application, we agree at the outset whom we represent.',
    },
    scope: {
      tag: 'What is included',
      title: 'The authorisation <em>and its paperwork</em>',
      intro: 'The service covers permission to work and the hiring documents.',
      items: [
        {
          title: 'Which permit applies',
          text: 'We review the worker’s profile, immigration status and role, and tell you which permit applies and what conditions it carries.',
        },
        {
          title: 'Applications and renewals',
          text: 'Preparation and filing of the application with the Ministry of Labour (MITRADEL), and renewals before expiry.',
        },
        {
          title: 'Worker and employer documents',
          text: 'Review of the worker’s personal documents and of the company documents the procedure requires, to avoid preventable objections.',
        },
        {
          title: 'Employment contract for the hire',
          text: 'Drafting or review of the employment contract filed with the application, consistent with the permit and with labour law.',
        },
        {
          title: 'Follow-up and expiry dates',
          text: 'Follow-up until a decision is issued, and a calendar of expiry dates for the permit and related documents.',
        },
      ],
      excluded: {
        title: 'Not part of this service',
        text: 'Employment litigation, dismissal claims and payroll management. We do not guarantee approval of the permit or its timing either.',
      },
    },
    process: {
      tag: 'How we work',
      title: 'How we handle <em>the application</em>',
      presence: {
        title: 'Filing channel and in-person steps',
        text: 'Depending on the type of permit, the application may be filed online or in person, and some stages may require the worker or a company representative to attend. The available channel is confirmed for each application during the assessment.',
      },
    },
    documents: {
      tag: 'For the initial assessment',
      title: 'What to <em>have ready</em>',
      intro: 'For guidance only. To start, these details are enough:',
      items: [
        'The worker’s nationality and, if already in Panama, their immigration status.',
        'Role, duties and expected start date.',
        'General details of the hiring company.',
        'For a renewal, the expiry date of the current permit.',
        'The contract or offer letter, if one exists.',
      ],
      note: {
        title: 'Please do not send documents through the form',
        text: 'The final list depends on the permit and is provided in writing after the assessment.',
      },
    },
    faq: [
      {
        q: 'Are residency and a work permit the same thing?',
        a: [
          'No. Residency allows you to stay in the country; a work permit allows you to work. Some residency categories are linked to employment and others do not include permission to work.',
          `We review this case by case. See also <a href="/en/${s('residencia')}">Residency & immigration</a>.`,
        ],
      },
      {
        q: 'Who applies, the worker or the company?',
        a: [
          'It depends on the type of permit. Often both are involved and the company provides its own documents. We tell you in the assessment.',
        ],
      },
      {
        q: 'What happens if the permit expires?',
        a: [
          'Working on an expired permit can have consequences for both the worker and the employer. That is why we track expiry dates and prepare renewals in advance.',
        ],
      },
      {
        q: 'Do you handle employment disputes or dismissals?',
        a: [
          'No. This service covers permission to work and the hiring paperwork. Employment litigation is not part of our services.',
        ],
      },
    ],
    cta: {
      title: 'Coming to work in Panama, or hiring a foreign national?',
      text: 'Describe the case in a few lines and we will tell you which permit to assess and which documents to gather.',
      button: 'Assess my work permit',
      whatsapp: 'Hello, I need information about a work permit in Panama.',
    },
  },

  // ----------------------------------------------------------------------
  relocalizacion: {
    slug: s('relocalizacion'),
    area: 'relocalizacion_legal',
    num: '03',
    cardName: 'Legal relocation',
    cardDesc: 'One legal plan for your move: residency, work permit, housing and business.',
    title: 'Legal Relocation to Panama | Juriscorp S.C.',
    description:
      'Legal support to settle in Panama: pre-move document plan, residency and work permit, lease review, property purchase or setting up a company.',
    schemaName: 'Legal support for relocating to Panama',
    breadcrumb: 'Legal relocation',
    eyebrow: 'Service',
    h1: 'Legal <em>relocation</em>',
    lead:
      'Moving to Panama opens several legal fronts at once: your immigration status, perhaps a work permit, a lease or a purchase, and sometimes a company. We help you organise them into a single plan, in the right order, so one step does not hold up the next.',
    audience: {
      label: 'Who it is for',
      value: 'Individuals and families planning to settle in Panama',
      note: 'Including those relocating a professional or business activity.',
    },
    scope: {
      tag: 'What is included',
      title: 'The legal side <em>of your move</em>',
      intro: 'We coordinate the legal work. Logistics are decided by you and your providers.',
      items: [
        {
          title: 'Pre-move document plan',
          text: 'Which documents to obtain, apostille or translate in your country before you travel, and in what order, so you do not have to repeat steps from abroad.',
        },
        {
          title: 'Residency and work permit',
          text: `Coordination of the immigration component and, where relevant, the employment one, within the same plan. Details under <a href="/en/${s('residencia')}">Residency</a> and <a href="/en/${s('permisos')}">Work permits</a>.`,
        },
        {
          title: 'Lease review',
          text: 'Legal review of the lease before you sign: term, deposits, grounds for termination and each party’s obligations.',
        },
        {
          title: 'Guidance on buying property',
          text: `Title search and contract review before you commit. Details under <a href="/en/${s('contratos')}#inmuebles">Contracts, companies & real estate</a>.`,
        },
        {
          title: 'Guidance on setting up a company',
          text: 'Which structure is worth considering and what legal steps it involves, in coordination with your accountant.',
        },
        {
          title: 'Schedule of steps and appointments',
          text: 'Organisation of the legal steps and of the appointments that require your presence, grouped together where possible.',
        },
      ],
      excluded: {
        title: 'Not part of this service',
        text: 'House hunting, removals, transport, customs clearance of household goods, school enrolment and opening bank accounts. We can review the legal documents those providers ask you for, but we do not provide those services or guarantee their outcome. Account approval is solely the bank’s decision.',
      },
    },
    process: {
      tag: 'How we work',
      title: 'One plan, <em>in stages</em>',
      steps: [
        {
          title: 'Diagnosis',
          text: 'What needs to be resolved before you arrive, on arrival and afterwards. We check for conflicts of interest and tell you what we can take on.',
        },
        {
          title: 'Written proposal',
          text: 'Components included, the fee for each and third-party costs listed separately: government fees, apostilles, translations and notary.',
        },
        {
          title: 'Preparation from your country',
          text: 'Documents, contracts and applications are prepared remotely, with your review.',
        },
        {
          title: 'Execution in Panama',
          text: 'Filings, signings and appointments on the agreed schedule, with follow-up until each component is closed.',
        },
      ],
      presence: {
        title: 'Some steps will be in person',
        text: 'This service coordinates several procedures and some require your presence in Panama. We give you a schedule of the expected appointments so you can plan for them.',
      },
    },
    documents: {
      tag: 'For the initial assessment',
      title: 'What to <em>have ready</em>',
      intro: 'For guidance only. To prepare the diagnosis it helps to know:',
      items: [
        'Your current country of residence and the nationalities of everyone moving.',
        'Approximate moving date.',
        'Whether you will work in Panama, invest, retire or relocate a business.',
        'Whether you plan to rent or buy a home.',
        'Which documents you already have apostilled or translated.',
      ],
      note: {
        title: 'Please do not send documents through the form',
        text: 'We will tell you in writing which documents to prepare and how to send them.',
      },
    },
    faq: [
      {
        q: 'Will you find me a home or organise the move?',
        a: [
          'No. Our service is the legal component. We can review the lease or purchase contract you choose, but house hunting and logistics are outside it.',
        ],
      },
      {
        q: 'Can I start before travelling?',
        a: [
          'Yes, and it is advisable. Many documents are easier to obtain and apostille in your home country than from abroad once you are in Panama.',
        ],
      },
      {
        q: 'Can you open a bank account for me?',
        a: [
          'No. Account opening depends on each bank’s policies. We can tell you which legal documents banks usually ask for, without guaranteeing approval.',
        ],
      },
      {
        q: 'Does this service include residency?',
        a: [
          'It coordinates residency as part of the plan. Which components your case includes, and the cost of each, are set out in the written proposal.',
        ],
      },
    ],
    cta: {
      title: 'Planning your move to Panama?',
      text: 'Tell us when and with whom you plan to settle. We will propose a legal plan in stages.',
      button: 'Plan my relocation',
      whatsapp: 'Hello, I am planning to move to Panama and need legal guidance.',
    },
  },

  // ----------------------------------------------------------------------
  contratos: {
    slug: s('contratos'),
    area: 'contratos_empresas_inmuebles',
    num: '04',
    cardName: 'Contracts, companies & real estate',
    cardDesc: 'Contracts, shareholder agreements, corporate documents, powers of attorney and title searches.',
    title: 'Contracts, Companies & Real Estate in Panama | Juriscorp',
    description:
      'Contract drafting and review, shareholder agreements, corporate documents, powers of attorney, title searches and review of property purchases and leases in Panama.',
    schemaName: 'Contracts, corporate documents and real estate review in Panama',
    breadcrumb: 'Contracts, companies & real estate',
    eyebrow: 'Service',
    h1: 'Contracts, companies <em>& real estate</em>',
    lead:
      'Many disputes can be avoided with a document that is well drafted and reviewed in time. We prepare and review contracts, corporate documents and property transactions so that you sign knowing what you are taking on. Most of this work is done in writing and by video call.',
    audience: {
      label: 'Who it is for',
      value: 'Individuals, companies, property owners and investors',
      note: 'In Panama or abroad, with transactions or documents governed by Panamanian law.',
    },
    scope: {
      tag: 'What is included',
      title: 'Three areas, <em>one standard</em>',
      intro: 'Reviewing before you sign costs less than arguing afterwards.',
      items: [
        {
          id: 'contratos',
          title: 'Contract drafting and review',
          text: 'Service agreements, sale and purchase, leases, confidentiality and other civil and commercial agreements. Review of clauses and risks, and negotiation of the text in writing.',
        },
        {
          title: 'Shareholder agreements',
          text: 'Contributions, management, decision-making, exit of partners and how disagreements will be resolved.',
        },
        {
          id: 'empresas',
          title: 'Corporate documents',
          text: 'Minutes, resolutions and updates to corporate records, with coordination of notarisation and registration at the Public Registry.',
        },
        {
          title: 'Incorporation and amendments',
          text: 'Incorporation of companies and amendments to their articles, with the scope defined in the proposal.',
        },
        {
          title: 'Powers of attorney',
          text: 'Drafting of general and special powers of attorney, and coordination of their execution, apostille when used abroad, and registration where required.',
        },
        {
          id: 'inmuebles',
          title: 'Title search and due diligence',
          text: 'Review of the property’s registry history, liens, restrictions and the seller’s position before you commit.',
        },
        {
          title: 'Purchases and leases',
          text: 'Review of promissory agreements, sale and purchase contracts and leases, and coordination of closing with the notary and the Public Registry.',
        },
      ],
      excluded: {
        title: 'Not part of this service',
        text: 'Registered agent services and recurring corporate compliance; property litigation, boundary disputes, land titling and agrarian proceedings; accounting and comprehensive tax advice.',
      },
    },
    process: {
      tag: 'How we work',
      title: 'In writing, <em>with your review</em>',
      presence: {
        title: 'Signing and the notary',
        text: 'Most of the work is done in writing. Executing deeds or powers of attorney before a notary may require the signatories to attend or a prior power of attorney; we tell you before the signing or closing is scheduled.',
      },
    },
    documents: {
      tag: 'For the initial assessment',
      title: 'What to <em>have ready</em>',
      intro: 'For guidance only. Depending on the matter, it helps to know:',
      items: [
        'What kind of contract or transaction it is, and whether there is a draft.',
        'Who the parties are and where they live.',
        'For companies: the company name and what change is needed.',
        'For property: the property details and the stage of negotiations.',
        'The expected signing or closing date.',
      ],
      note: {
        title: 'The draft comes later',
        text: 'If there is a draft to review, we will ask for it through an agreed channel after the assessment. Please do not paste it into the form.',
      },
    },
    faq: [
      {
        q: 'Can you review a contract if I am outside Panama?',
        a: [
          'Yes. Review and negotiation are done in writing and by video call. What may require attendance, or a power of attorney, is signing before a notary when the transaction calls for it.',
        ],
      },
      {
        q: 'What is a title search and when should I do one?',
        a: [
          'It is a review of the property’s registry history: who holds title, what liens or restrictions apply and whether anything prevents the sale. It is best done before signing a promissory agreement or paying any money.',
        ],
      },
      {
        q: 'Do you offer registered agent services?',
        a: [
          'That is not part of our current services. We can review your company’s documents and prepare minutes or powers of attorney, but we do not act as registered agent or take on recurring corporate compliance.',
        ],
      },
      {
        q: 'Do you handle property or boundary disputes?',
        a: [
          'No. Our real estate work is preventive and document-based: title searches and contract review. Property litigation, boundary disputes and agrarian proceedings are outside our services.',
        ],
      },
    ],
    cta: {
      title: 'Have a contract or transaction to review?',
      text: 'Tell us what it is about and when you plan to sign. We will tell you what review we recommend and what we will need.',
      button: 'Review my contract',
      whatsapp: 'Hello, I need a contract or transaction in Panama reviewed.',
    },
  },

  // ----------------------------------------------------------------------
  administrativo: {
    slug: s('administrativo'),
    area: 'administrativo_tributario',
    num: '05',
    cardName: 'Administrative law',
    cardDesc: 'Petitions, administrative appeals, penalties, permits, licences and public procurement.',
    title: 'Administrative Law in Panama | Juriscorp S.C.',
    description:
      'Petitions, case follow-up, administrative appeals, defence against penalties, permits and licences, and legal review of public procurement in Panama.',
    schemaName: 'Administrative law in Panama',
    breadcrumb: 'Administrative law',
    eyebrow: 'Administrative & tax',
    h1: 'Administrative <em>law</em>',
    lead:
      'When the other side is a public authority, procedure matters as much as substance. A missed deadline or a poorly framed appeal can close the door before anyone examines whether you were right. We take on selected administrative matters, with a focus on written work: petitions, appeals and document-based defence.',
    heroNote: 'Qualification: Master’s degree in Administrative Law.',
    audience: {
      label: 'Who it is for',
      value: 'Individuals and companies dealing with procedures, penalties or decisions of public authorities',
      note: 'Including foreign investors with permits, licences or contracts with the Panamanian State.',
    },
    scope: {
      tag: 'What is included',
      title: 'Matters before <em>public authorities</em>',
      intro: 'Each matter has its own route and its own deadlines. These are the matters we take on, after assessing each case.',
      items: [
        {
          title: 'Petitions and document requests',
          text: 'Petitions to public authorities, requests for copies and certifications, and freedom-of-information requests.',
        },
        {
          title: 'Case follow-up',
          text: 'Review of the status of a procedure, the contents of the file and the deadlines that are running.',
        },
        {
          title: 'Administrative appeals',
          text: 'Requests for reconsideration and appeals against decisions that affect you, where the applicable procedure provides for them.',
        },
        {
          title: 'Defence against penalties',
          text: 'Written submissions and appeals against fines, closures and other penalties, focusing on notice, the right to be heard and the reasoning of the decision.',
        },
        {
          title: 'Permits and licences',
          text: 'Applications, renewals and defence of permits, licences and authorisations before public authorities and municipalities.',
        },
        {
          title: 'Legal review of public procurement',
          text: 'Review of tender specifications and bid documents, and preparation of complaints or challenges in the matters we accept.',
        },
      ],
      excluded: {
        title: 'If the matter needs to go to court',
        text: `Claims before the Third Chamber of the Supreme Court are handled under <a href="/en/${s('constitucional')}">Constitutional & administrative litigation</a>, always after a feasibility study.`,
      },
    },
    process: {
      tag: 'How we work',
      title: 'Deadline first, <em>merits second</em>',
      presence: {
        title: 'Written work, with in-person steps assessed upfront',
        text: 'Most of this work is written. Some steps, such as inspecting a physical file or attending certain hearings, may require attendance. We assess this before accepting the matter and tell you how it will be covered.',
      },
    },
    institutions: {
      title: 'The institutional map',
      intro: 'General administrative procedure is governed by Law 38 of 2000, together with the rules specific to each sector.',
      items: [
        {
          mark: '—',
          title: 'Ministries, autonomous agencies and municipalities',
          text: 'Each with its own procedure and deadlines. This is where almost every administrative matter begins.',
        },
        {
          mark: 'DGCP',
          title: 'Directorate General of Public Procurement',
          text: 'Oversees the State’s purchasing system and runs the PanamaCompra platform.',
        },
        {
          mark: 'TACP',
          title: 'Administrative Tribunal for Public Procurement',
          text: 'Decides challenges against acts in contractor selection procedures.',
        },
        {
          mark: 'ANTAI',
          title: 'National Authority for Transparency and Access to Information',
          text: 'The route to enforce access to public information, useful when building a file.',
        },
        {
          mark: 'PA',
          title: 'Office of the Attorney for the Administration',
          text: 'Issues opinions that guide public authorities and takes part in administrative litigation.',
        },
        {
          mark: 'CSJ',
          title: 'Third Chamber of the Supreme Court',
          text: 'Reviews the legality of administrative acts through administrative litigation claims.',
        },
      ],
    },
    documents: {
      tag: 'For the initial assessment',
      title: 'What to <em>have ready</em>',
      intro: 'For guidance only. To tell whether there is room to act we need:',
      items: [
        'Which authority issued the decision, penalty or request.',
        'The date you were notified. Please also give it in the form.',
        'What you want to achieve: annul, amend, obtain a permit or respond.',
        'Any appeals or submissions already filed.',
      ],
      note: {
        title: 'If a deadline is running, say so first',
        text: 'Tick the option in the form indicating that you have a notice or deadline. We will ask for a copy of the decision through an agreed channel; please do not attach it to the web enquiry.',
      },
    },
    faq: [
      {
        q: 'Do I always have to exhaust administrative remedies before going to court?',
        a: [
          'Not in every case. It depends on the claim and the procedure. Some claims require the available administrative appeals to have been used first and are subject to time limits; others do not, and the law and case law recognise exceptions.',
          'That is why the first step is to identify what is being challenged and by which route. Getting this wrong can lead to a claim being dismissed without examining the merits.',
        ],
      },
      {
        q: 'How long do I have to appeal a decision?',
        a: [
          'It is set by the rules of each procedure. Deadlines are usually short and run from notification; once they expire, the decision may become final.',
          'Contact us as soon as you are notified and include the date in your enquiry.',
        ],
      },
      {
        q: 'Can I challenge the award of a public tender?',
        a: [
          'Public procurement rules provide for complaints and challenges with short deadlines and their own requirements. It is best to review the tender specifications and the file as early as possible. We assess feasibility before accepting the matter.',
        ],
      },
      {
        q: 'Do you assist foreign clients with administrative matters in Panama?',
        a: [
          'Yes. The assessment can be done remotely and representation is formalised by power of attorney. Some steps may require attendance; we tell you before committing to the engagement.',
        ],
      },
    ],
    cta: {
      title: 'Received a decision or request that affects you?',
      text: 'Describe the matter in general terms and give us the notification date. We will tell you whether we see room to act and what we need to assess it.',
      button: 'Assess an administrative decision',
      whatsapp: 'Hello, I received an administrative decision in Panama and need it assessed.',
    },
  },

  // ----------------------------------------------------------------------
  tributario: {
    slug: s('tributario'),
    area: 'administrativo_tributario',
    num: '05',
    cardName: 'Tax law',
    cardDesc: 'Tax opinions, responses to DGI requests, and appeals before the DGI and the TAT.',
    title: 'Tax Law in Panama | Juriscorp S.C.',
    description:
      'Tax opinions and appeals in Panama: responses to DGI requests and audits, tax penalties, and appeals before the DGI and the Administrative Tax Tribunal.',
    schemaName: 'Tax opinions and appeals in Panama',
    breadcrumb: 'Tax law',
    eyebrow: 'Administrative & tax',
    h1: 'Tax <em>law</em>',
    lead:
      'A dispute with the tax authority is rarely won on figures alone. It is won with a well-built file, the right legal grounds and an appeal filed on time. We take on selected tax opinions and appeals, and work with your accountant when the matter calls for accounting work.',
    heroNote: 'Institutional experience: former assistant to a Judge of the Administrative Tax Tribunal.',
    audience: {
      label: 'Who it is for',
      value: 'Taxpayers and companies facing tax requests, assessments or penalties',
      note: 'Also for those who need a legal opinion before carrying out a transaction.',
    },
    scope: {
      tag: 'What is included',
      title: 'Matters before <em>the tax authority</em>',
      intro: 'Legal work. Accounting is done by your accountant or a specialist, in coordination with us.',
      items: [
        {
          title: 'Tax opinions',
          text: 'Legal analysis of a specific transaction or situation; for example, whether income is Panama-source under the territoriality principle.',
        },
        {
          title: 'Information requests and audits',
          text: 'Preparation of responses to information requests, audits and additional assessments, with documentary support for the taxpayer’s position.',
        },
        {
          title: 'Appeals before the DGI and the TAT',
          text: 'Requests for reconsideration before the Directorate General of Revenue and appeals before the Administrative Tax Tribunal, where available.',
        },
        {
          title: 'Tax penalties',
          text: 'Document-based defence against fines and surcharges.',
        },
        {
          title: 'Limitation periods and refunds',
          text: 'Analysis of whether a liability is still enforceable, and applications for refunds or recognition of credits.',
        },
      ],
      excluded: {
        title: 'Not part of this service',
        text: 'Bookkeeping, preparation of tax returns, transfer pricing studies and comprehensive tax planning. When a matter requires them, we coordinate with your accountant or a specialist, and the proposal says so.',
      },
    },
    process: {
      tag: 'How we work',
      title: 'Review <em>before you reply</em>',
      presence: {
        title: 'Mostly written work',
        text: 'Tax responses and appeals are written. If any step requires attendance, we identify it during the assessment.',
      },
    },
    institutions: {
      title: 'The authorities involved',
      intro: 'As a general rule, Panama taxes income produced within its territory: the territoriality principle.',
      items: [
        {
          mark: 'DGI',
          title: 'Directorate General of Revenue',
          text: 'Audits, assesses and collects. It is the first level of almost any national tax dispute.',
        },
        {
          mark: 'TAT',
          title: 'Administrative Tax Tribunal',
          text: 'A tribunal independent of the DGI that decides, at the second administrative level, appeals against its decisions.',
        },
        {
          mark: 'CSJ',
          title: 'Third Chamber of the Supreme Court',
          text: 'Provides judicial review of decisions taken at the administrative level, through the appropriate claim.',
        },
        {
          mark: '—',
          title: 'Municipalities',
          text: 'Local taxes and fees with their own procedure.',
        },
      ],
    },
    documents: {
      tag: 'For the initial assessment',
      title: 'What to <em>have ready</em>',
      intro: 'For guidance only:',
      items: [
        'What you received: information request, audit, assessment, fine or decision.',
        'The notification date. Please also give it in the form.',
        'The tax and the period concerned.',
        'If you have an accountant, how to reach them.',
        'Any responses or appeals already filed.',
      ],
      note: {
        title: 'Tax data comes later',
        text: 'Please do not include financial statements or tax ID numbers in the web enquiry. If needed, we will ask for them through an agreed channel.',
      },
    },
    faq: [
      {
        q: 'When does the time to appeal start running?',
        a: [
          'Generally from notification of the decision, and it is counted according to the rules of the procedure. Give the notification date in your enquiry so we can check it straight away.',
        ],
      },
      {
        q: 'Should I answer a DGI request before getting advice?',
        a: [
          'It is better to have it reviewed first. A response given without analysis can entrench the authority’s position and narrow the room for a later defence.',
        ],
      },
      {
        q: 'Do you keep the books or file tax returns?',
        a: [
          'No. Our work is legal. When accounting work is needed, it is done by your accountant or a specialist, in coordination with us.',
        ],
      },
      {
        q: 'What does the territoriality principle mean?',
        a: [
          'That, as a general rule, Panama taxes income produced within its territory. Whether a transaction generates Panama-source income is one of the most frequent points of dispute with the authority.',
        ],
      },
    ],
    cta: {
      title: 'Received a tax request or decision?',
      text: 'Tell us what you received and when you were notified. We will tell you what can be done and what we need to assess it.',
      button: 'Assess my tax matter',
      whatsapp: 'Hello, I received a tax request or decision in Panama and need guidance.',
    },
  },

  // ----------------------------------------------------------------------
  constitucional: {
    slug: s('constitucional'),
    area: 'constitucional_contencioso',
    num: '06',
    cardName: 'Constitutional & administrative litigation',
    cardDesc: 'Feasibility studies and claims before the Full Court or the Third Chamber of the Supreme Court.',
    title: 'Constitutional & Administrative Litigation | Juriscorp',
    description:
      'Feasibility studies, unconstitutionality claims before the Full Supreme Court, and annulment and full-jurisdiction claims before the Third Chamber in Panama.',
    schemaName: 'Constitutional and administrative litigation in Panama',
    breadcrumb: 'Constitutional & administrative litigation',
    eyebrow: 'Service',
    h1: 'Constitutional & <em>administrative litigation</em>',
    lead:
      'Some decisions of the State can only be corrected before the Supreme Court of Justice. These are technical matters with strict formal requirements, where it pays to know whether there is a real prospect of success before investing in a claim. That is why the work always starts with a feasibility study.',
    heroNote: 'Qualification: Master’s degree in Administrative Law.',
    audience: {
      label: 'Who it is for',
      value: 'Individuals and companies affected by an administrative act or a legal provision',
      note: 'Also for those who need a second opinion on an ongoing case.',
    },
    scope: {
      tag: 'What is included',
      title: 'From study <em>to claim</em>',
      intro: 'We accept each matter after assessing its scope, its deadlines and what the proceedings will require.',
      items: [
        {
          title: 'Feasibility study',
          text: 'Analysis of the act or provision, the available claim, its requirements and deadlines, and the arguments available. It ends with a written recommendation.',
        },
        {
          title: 'Unconstitutionality claims',
          text: 'Preparation and filing before the Full Supreme Court of Justice, in matters accepted after the study.',
        },
        {
          title: 'Annulment claims',
          text: 'Challenges before the Third Chamber against administrative acts that breach the law.',
        },
        {
          title: 'Full-jurisdiction claims',
          text: 'Restoration, before the Third Chamber, of rights harmed by an administrative decision.',
        },
        {
          title: 'Interim measures',
          text: 'Applications to provisionally suspend the effects of the act, where available and justified.',
        },
        {
          title: 'Legal opinions and case review',
          text: 'Second opinions on ongoing cases and technical review of filings and case files.',
        },
      ],
      excluded: {
        title: 'What we do not promise',
        text: 'Admission and the decision rest with the Court. We do not guarantee outcomes or timing, and we do not accept a matter without the prior study.',
      },
    },
    process: {
      tag: 'How we work',
      title: 'Feasibility first, <em>claim second</em>',
      steps: [
        {
          title: 'Initial consultation',
          text: 'We identify the act or provision, the date of notification or publication and what you are seeking. We check for conflicts of interest.',
        },
        {
          title: 'Feasibility study',
          text: 'Available claim, requirements, deadlines, evidence and foreseeable steps. Written recommendation.',
        },
        {
          title: 'Proposal and claim',
          text: 'If we recommend acting and you accept the proposal, we prepare the claim and, where available, the application for interim measures.',
        },
        {
          title: 'Procedural follow-up',
          text: 'Handling of submissions, filings and notices until judgment, with a report on each step.',
        },
      ],
      presence: {
        title: 'Written proceedings are not proceedings without attendance',
        text: 'Proceedings being mostly written does not mean they require no in-person steps. Before accepting a matter we identify notices, evidence and hearings, and tell you how they will be handled.',
      },
    },
    institutions: {
      title: 'Two separate jurisdictions',
      intro: 'They are not successive levels of the same case. Each hears its own claims, with its own requirements.',
      items: [
        {
          mark: 'Full',
          title: 'Full Supreme Court of Justice (Pleno)',
          text: 'Hears unconstitutionality claims against laws, decrees, acts and other provisions, on substantive or procedural grounds.',
        },
        {
          mark: '3rd',
          title: 'Third Chamber (Administrative Litigation)',
          text: 'Hears claims against acts of the public administration, including annulment and full-jurisdiction claims.',
        },
        {
          mark: 'PA',
          title: 'Office of the Attorney for the Administration',
          text: 'Takes part in administrative litigation, depending on the type of claim.',
        },
      ],
    },
    documents: {
      tag: 'For the initial assessment',
      title: 'What to <em>have ready</em>',
      intro: 'For guidance only:',
      items: [
        'Which act or provision affects you and who issued it.',
        'The date of notification or publication. Please also give it in the form.',
        'Any appeals already filed and their outcome.',
        'What you are seeking: annulment of the act, restoration of a right, or a declaration that a provision is unconstitutional.',
      ],
      note: {
        title: 'The case file comes later',
        text: 'If the matter moves to a feasibility study, we will ask for the file through an agreed channel. Please do not attach it to the web enquiry.',
      },
    },
    faq: [
      {
        q: 'Is an unconstitutionality claim the same as an administrative litigation claim?',
        a: [
          'No. Unconstitutionality claims are heard by the Full Supreme Court and seek a declaration that a provision or act breaches the Constitution. Administrative litigation claims, such as annulment or full-jurisdiction claims, are heard by the Third Chamber and concern the legality of administrative acts.',
        ],
      },
      {
        q: 'Is this the “last resort” for my case?',
        a: [
          'Not necessarily. An administrative litigation claim may be the first time a matter reaches a court, and an unconstitutionality claim is not an appeal against an earlier judgment. These are proceedings with their own requirements.',
        ],
      },
      {
        q: 'What is the difference between annulment and full jurisdiction?',
        a: [
          'A full-jurisdiction claim seeks to restore an individual right that has been harmed and may include compensation; it is subject to time limits and prior requirements. An annulment claim seeks to set aside an act that breaches the law.',
          'The choice depends on what you want to achieve and how much time has passed. It is settled in the feasibility study.',
        ],
      },
      {
        q: 'Do you guarantee the Court will admit the claim?',
        a: [
          'No. Admission and the decision rest with the Court. What we do is tell you frankly, in the feasibility study, whether we recommend filing.',
        ],
      },
    ],
    cta: {
      title: 'Want to know whether your case can go to the Court?',
      text: 'Tell us which act or provision affects you and when it was notified or published. We will tell you whether a feasibility study makes sense.',
      button: 'Request a feasibility study',
      whatsapp: 'Hello, I would like to assess whether my case can go to the Supreme Court of Panama.',
    },
  },
};

export default { ui, defaultSteps, pages };
